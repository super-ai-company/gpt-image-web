import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import { getPublicConfig, resolveProvider } from './config.js';

const app = express();
const sessionCookieName = 'gpt_image_access';
const sessionSecret = process.env.ACCESS_SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const sessionMaxAgeMs = Number(process.env.ACCESS_SESSION_DAYS || 7) * 24 * 60 * 60 * 1000;
const secureCookie = process.env.ACCESS_COOKIE_SECURE === 'true';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 2
  }
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));

function isAuthEnabled() {
  return Boolean(process.env.ACCESS_PASSWORD);
}

function parseCookies(header = '') {
  return header.split(';').reduce((cookies, item) => {
    const index = item.indexOf('=');
    if (index === -1) return cookies;
    const key = item.slice(0, index).trim();
    const value = item.slice(index + 1).trim();
    if (key) {
      cookies[key] = decodeURIComponent(value);
    }
    return cookies;
  }, {});
}

function signPayload(payload) {
  return crypto
    .createHmac('sha256', sessionSecret)
    .update(payload)
    .digest('base64url');
}

function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({ iat: Date.now() })).toString('base64url');
  return `${payload}.${signPayload(payload)}`;
}

function verifySessionToken(token) {
  if (!token || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  const expected = signPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Date.now() - Number(data.iat || 0) <= sessionMaxAgeMs;
  } catch {
    return false;
  }
}

function isAuthenticated(req) {
  if (!isAuthEnabled()) return true;
  const cookies = parseCookies(req.headers.cookie);
  return verifySessionToken(cookies[sessionCookieName]);
}

function setSessionCookie(res, token) {
  const maxAgeSeconds = Math.floor(sessionMaxAgeMs / 1000);
  res.setHeader(
    'Set-Cookie',
    `${sessionCookieName}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}${secureCookie ? '; Secure' : ''}`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureCookie ? '; Secure' : ''}`
  );
}

function passwordMatches(candidate) {
  const expected = crypto.createHash('sha256').update(process.env.ACCESS_PASSWORD || '').digest();
  const actual = crypto.createHash('sha256').update(String(candidate || '')).digest();
  return crypto.timingSafeEqual(actual, expected);
}

function requireAccess(req, res, next) {
  if (req.path.startsWith('/api/auth/')) {
    next();
    return;
  }
  if (isAuthenticated(req)) {
    next();
    return;
  }
  res.status(401).json({ error: 'Access password required' });
}

function buildClient(provider, clientApiKey) {
  const apiKey = clientApiKey || process.env[provider.apiKeyEnv];
  if (!apiKey) {
    const publicConfig = getPublicConfig();
    if (publicConfig.allowClientApiKey) {
      throw new Error('API key is required');
    }
    throw new Error(`Missing API key env: ${provider.apiKeyEnv}`);
  }

  return new OpenAI({
    apiKey,
    baseURL: provider.baseURL
  });
}

function requirePrompt(prompt) {
  const value = String(prompt || '').trim();
  if (!value) {
    throw new Error('Prompt is required');
  }
  if (value.length > 2000) {
    throw new Error('Prompt must be 2000 characters or fewer');
  }
  return value;
}

function normalizeImageResponse(response) {
  return (response.data || []).map((item, index) => ({
    id: `${Date.now()}-${index}`,
    b64: item.b64_json,
    url: item.url || '',
    revisedPrompt: item.revised_prompt || ''
  }));
}

function dataUrlToFile(file) {
  if (!file) return null;
  const name = file.originalname || 'image.png';
  const type = file.mimetype || 'image/png';
  return new File([file.buffer], name, { type });
}

app.get('/api/auth/session', (req, res) => {
  res.json({
    authRequired: isAuthEnabled(),
    authenticated: isAuthenticated(req)
  });
});

app.post('/api/auth/login', (req, res) => {
  if (!isAuthEnabled()) {
    res.json({ ok: true });
    return;
  }
  if (!passwordMatches(req.body?.password)) {
    res.status(401).json({ error: '访问口令不正确' });
    return;
  }
  setSessionCookie(res, createSessionToken());
  res.json({ ok: true });
});

app.post('/api/auth/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.use('/api', requireAccess);

app.get('/api/config', (_req, res) => {
  res.json(getPublicConfig());
});

app.post('/api/images/generate', async (req, res) => {
  try {
    const config = getPublicConfig();
    const provider = resolveProvider(req.body.provider || config.defaultProvider);
    const clientApiKey = config.allowClientApiKey ? req.body.apiKey : undefined;
    const client = buildClient(provider, clientApiKey);
    const prompt = requirePrompt(req.body.prompt);

    const response = await client.images.generate({
      model: req.body.model || config.defaultModel,
      prompt,
      n: Number(req.body.count || 1),
      size: req.body.size || 'auto',
      quality: req.body.quality || 'auto',
      output_format: req.body.format || 'png'
    });

    res.json({
      images: normalizeImageResponse(response),
      meta: {
        mode: 'generate',
        provider: provider.id,
        model: req.body.model || config.defaultModel,
        count: Number(req.body.count || 1),
        size: req.body.size || 'auto',
        quality: req.body.quality || 'auto',
        format: req.body.format || 'png'
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Image generation failed' });
  }
});

app.post('/api/images/edit', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'mask', maxCount: 1 }
]), async (req, res) => {
  try {
    const config = getPublicConfig();
    const provider = resolveProvider(req.body.provider || config.defaultProvider);
    const clientApiKey = config.allowClientApiKey ? req.body.apiKey : undefined;
    const client = buildClient(provider, clientApiKey);
    const prompt = requirePrompt(req.body.prompt);
    const imageFile = dataUrlToFile(req.files?.image?.[0]);
    const maskFile = dataUrlToFile(req.files?.mask?.[0]);

    if (!imageFile) {
      throw new Error('Input image is required');
    }

    const payload = {
      model: req.body.model || config.defaultModel,
      prompt,
      image: imageFile,
      n: Number(req.body.count || 1),
      size: req.body.size || 'auto',
      quality: req.body.quality || 'auto',
      output_format: req.body.format || 'png'
    };

    if (maskFile) {
      payload.mask = maskFile;
    }

    const response = await client.images.edit(payload);

    res.json({
      images: normalizeImageResponse(response),
      meta: {
        mode: 'edit',
        provider: provider.id,
        model: req.body.model || config.defaultModel,
        count: Number(req.body.count || 1),
        size: req.body.size || 'auto',
        quality: req.body.quality || 'auto',
        format: req.body.format || 'png',
        hasMask: Boolean(maskFile)
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Image edit failed' });
  }
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');
const hasStaticBuild = fs.existsSync(path.join(distPath, 'index.html'));

if (process.env.NODE_ENV === 'production' || hasStaticBuild) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`GPT image web server listening on http://localhost:${port}`);
});
