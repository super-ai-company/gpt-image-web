import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import sharp from 'sharp';
import { getPublicConfig, resolveProvider } from './config.js';

const app = express();
const sessionCookieName = 'gpt_image_access';
const sessionSecret = process.env.ACCESS_SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const sessionMaxAgeMs = Number(process.env.ACCESS_SESSION_DAYS || 7) * 24 * 60 * 60 * 1000;
const imageJobResultTtlMs = Number(process.env.IMAGE_JOB_RESULT_TTL_MINUTES || 15) * 60 * 1000;
const secureCookie = process.env.ACCESS_COOKIE_SECURE === 'true';
const imageJobs = new Map();
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

function createImageJob(run) {
  const id = crypto.randomUUID();
  const job = {
    id,
    status: 'queued',
    createdAt: new Date().toISOString(),
    result: null,
    error: ''
  };
  imageJobs.set(id, job);

  setImmediate(async () => {
    job.status = 'processing';
    try {
      job.result = await run();
      job.status = 'completed';
    } catch (error) {
      job.error = error?.message || 'Image request failed';
      job.status = 'failed';
    } finally {
      job.finishedAt = new Date().toISOString();
      const cleanupTimer = setTimeout(() => imageJobs.delete(id), imageJobResultTtlMs);
      cleanupTimer.unref?.();
    }
  });

  return job;
}

function imageResult(response, meta) {
  return {
    images: normalizeImageResponse(response),
    meta
  };
}

function logImageError(label, request, error) {
  console.error(label, {
    provider: request.provider || 'default',
    model: request.model || 'default',
    status: error?.status,
    code: error?.code,
    type: error?.type,
    requestId: error?.request_id || error?.requestId,
    message: error?.message,
    cause: error?.cause?.message
  });
}

async function dataUrlToFile(file) {
  if (!file) return null;
  let name = file.originalname || 'image.png';
  let type = file.mimetype || 'image/png';
  let buffer = file.buffer;

  if (path.extname(name).toLowerCase() === '.mpo') {
    buffer = await sharp(buffer, { pages: 1 }).jpeg().toBuffer();
    name = `${path.basename(name, path.extname(name)) || 'image'}.jpg`;
    type = 'image/jpeg';
  }

  return new File([buffer], name, { type });
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

app.get('/api/images/jobs/:jobId', (req, res) => {
  const job = imageJobs.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: 'Image job not found or expired' });
    return;
  }

  res.json({
    jobId: job.id,
    status: job.status,
    createdAt: job.createdAt,
    finishedAt: job.finishedAt,
    result: job.status === 'completed' ? job.result : undefined,
    error: job.status === 'failed' ? job.error : undefined
  });
});

app.post('/api/images/generate', (req, res) => {
  try {
    const config = getPublicConfig();
    const provider = resolveProvider(req.body.provider || config.defaultProvider);
    const clientApiKey = config.allowClientApiKey ? req.body.apiKey : undefined;
    const client = buildClient(provider, clientApiKey);
    const prompt = requirePrompt(req.body.prompt);
    const request = { ...req.body, prompt };
    const job = createImageJob(async () => {
      try {
        const response = await client.images.generate({
          model: request.model || config.defaultModel,
          prompt: request.prompt,
          n: Number(request.count || 1),
          size: request.size || 'auto',
          quality: request.quality || 'auto',
          output_format: request.format || 'png'
        });
        return imageResult(response, {
          mode: 'generate',
          provider: provider.id,
          model: request.model || config.defaultModel,
          count: Number(request.count || 1),
          size: request.size || 'auto',
          quality: request.quality || 'auto',
          format: request.format || 'png'
        });
      } catch (error) {
        logImageError('[image.generate.error]', request, error);
        throw error;
      }
    });
    res.status(202).json({ jobId: job.id, status: job.status });
  } catch (error) {
    logImageError('[image.generate.error]', req.body || {}, error);
    res.status(400).json({ error: error.message || 'Image generation failed' });
  }
});

app.post('/api/images/edit', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'mask', maxCount: 1 }
]), (req, res) => {
  try {
    const config = getPublicConfig();
    const provider = resolveProvider(req.body.provider || config.defaultProvider);
    const clientApiKey = config.allowClientApiKey ? req.body.apiKey : undefined;
    const client = buildClient(provider, clientApiKey);
    const prompt = requirePrompt(req.body.prompt);
    const inputImage = req.files?.image?.[0];
    const inputMask = req.files?.mask?.[0];
    if (!inputImage) {
      throw new Error('Input image is required');
    }
    const request = { ...req.body, prompt };
    const job = createImageJob(async () => {
      try {
        const imageFile = await dataUrlToFile(inputImage);
        const maskFile = await dataUrlToFile(inputMask);
        const payload = {
          model: request.model || config.defaultModel,
          prompt: request.prompt,
          image: imageFile,
          n: Number(request.count || 1),
          size: request.size || 'auto',
          quality: request.quality || 'auto',
          output_format: request.format || 'png'
        };
        if (maskFile) {
          payload.mask = maskFile;
        }

        const response = await client.images.edit(payload);
        return imageResult(response, {
          mode: 'edit',
          provider: provider.id,
          model: request.model || config.defaultModel,
          count: Number(request.count || 1),
          size: request.size || 'auto',
          quality: request.quality || 'auto',
          format: request.format || 'png',
          hasMask: Boolean(maskFile)
        });
      } catch (error) {
        logImageError('[image.edit.error]', request, error);
        throw error;
      }
    });
    res.status(202).json({ jobId: job.id, status: job.status });
  } catch (error) {
    logImageError('[image.edit.error]', req.body || {}, error);
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
