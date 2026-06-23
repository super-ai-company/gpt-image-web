import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const promptPresets = [
  '电商主图',
  '美食海报',
  '教育招生',
  '酒店宣传',
  '医疗科普',
  '地产空间',
  '新品发布',
  '社媒广告',
  '门店横幅',
  '节日促销'
];

const defaultConfig = {
  allowClientApiKey: false,
  defaultProvider: 'openai',
  defaultModel: 'gpt-image-2',
  providers: [{ id: 'openai', name: 'OpenAI', models: ['gpt-image-2'] }],
  counts: [1, 2, 3, 4],
  sizes: ['auto', '1024x1024', '1536x1024', '1024x1536'],
  qualities: ['auto', 'low', 'medium', 'high'],
  formats: ['png', 'jpeg', 'webp']
};

function getProgressLabel(value, mode) {
  const action = mode === 'generate' ? '生成' : '编辑';
  if (value >= 100) return `${action}完成`;
  if (value >= 86) return '等待模型返回结果';
  if (value >= 68) return '正在渲染图像细节';
  if (value >= 42) return '模型正在处理提示词';
  if (value >= 18) return '已提交到模型接口';
  return '准备请求';
}

function App() {
  const [auth, setAuth] = useState({ checked: false, authRequired: false, authenticated: false });
  const [loginPassword, setLoginPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState('idle');
  const [loginError, setLoginError] = useState('');
  const [config, setConfig] = useState(defaultConfig);
  const [mode, setMode] = useState('generate');
  const [provider, setProvider] = useState(defaultConfig.defaultProvider);
  const [model, setModel] = useState(defaultConfig.defaultModel);
  const [count, setCount] = useState(1);
  const [size, setSize] = useState('auto');
  const [quality, setQuality] = useState('auto');
  const [format, setFormat] = useState('png');
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [mask, setMask] = useState(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState({ value: 0, label: '等待开始' });
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((response) => response.json())
      .then((data) => {
        setAuth({
          checked: true,
          authRequired: Boolean(data.authRequired),
          authenticated: Boolean(data.authenticated)
        });
      })
      .catch(() => {
        setAuth({ checked: true, authRequired: false, authenticated: true });
      });
  }, []);

  useEffect(() => {
    if (!auth.checked || (auth.authRequired && !auth.authenticated)) {
      return;
    }
    fetch('/api/config')
      .then((response) => response.json())
      .then((data) => {
        setConfig(data);
        setProvider(data.defaultProvider);
        setModel(data.defaultModel);
      })
      .catch(() => {
        setConfig(defaultConfig);
      });
  }, [auth]);

  const selectedProvider = useMemo(() => {
    return config.providers.find((item) => item.id === provider) || config.providers[0];
  }, [config.providers, provider]);

  useEffect(() => {
    if (!selectedProvider?.models?.includes(model)) {
      setModel(selectedProvider?.models?.[0] || config.defaultModel);
    }
  }, [selectedProvider, model, config.defaultModel]);

  const canSubmit = prompt.trim().length > 0 && status !== 'loading' && (mode === 'generate' || image);

  useEffect(() => {
    if (status !== 'loading') return undefined;

    const timer = window.setInterval(() => {
      setProgress((current) => {
        const increment = current.value < 35 ? 7 : current.value < 70 ? 4 : 1;
        const value = Math.min(current.value + increment, 92);
        return { value, label: getProgressLabel(value, mode) };
      });
    }, 700);

    return () => window.clearInterval(timer);
  }, [status, mode]);

  async function login(event) {
    event.preventDefault();
    if (!loginPassword.trim() || loginStatus === 'loading') return;

    setLoginStatus('loading');
    setLoginError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '访问口令不正确');
      }
      setAuth((current) => ({ ...current, authenticated: true }));
      setLoginPassword('');
      setLoginStatus('idle');
    } catch (requestError) {
      setLoginError(requestError.message || '登录失败');
      setLoginStatus('error');
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setResult(null);
    setError('');
    setAuth((current) => ({ ...current, authenticated: !current.authRequired }));
  }

  async function submit() {
    if (!canSubmit) return;
    setStatus('loading');
    setProgress({ value: 6, label: getProgressLabel(6, mode) });
    setError('');
    setResult(null);

    try {
      const commonPayload = {
        provider,
        model,
        count,
        size,
        quality,
        format,
        prompt: prompt.trim()
      };

      let response;
      if (mode === 'generate') {
        response = await fetch('/api/images/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...commonPayload,
            apiKey: config.allowClientApiKey ? apiKey : undefined
          })
        });
      } else {
        const formData = new FormData();
        Object.entries(commonPayload).forEach(([key, value]) => formData.append(key, value));
        if (config.allowClientApiKey) {
          formData.append('apiKey', apiKey);
        }
        formData.append('image', image);
        if (mask) {
          formData.append('mask', mask);
        }

        response = await fetch('/api/images/edit', {
          method: 'POST',
          body: formData
        });
      }

      const data = await response.json();
      if (response.status === 401) {
        setAuth((current) => ({ ...current, authenticated: false }));
      }
      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }
      setProgress({ value: 100, label: getProgressLabel(100, mode) });
      setResult(data);
      setStatus('success');
    } catch (requestError) {
      setError(requestError.message || '请求失败');
      setProgress({ value: 0, label: '请求失败' });
      setStatus('error');
    }
  }

  function resetForm() {
    setPrompt('');
    setImage(null);
    setMask(null);
    setError('');
    setResult(null);
    setProgress({ value: 0, label: '等待开始' });
    setStatus('idle');
  }

  if (!auth.checked) {
    return <div className="boot-screen">正在加载...</div>;
  }

  if (auth.authRequired && !auth.authenticated) {
    return (
      <LoginScreen
        password={loginPassword}
        status={loginStatus}
        error={loginError}
        onPasswordChange={setLoginPassword}
        onSubmit={login}
      />
    );
  }

  return (
    <main className="page-shell">
      <section className="workspace">
        <div className="panel form-panel">
          <div className="form-header">
            <div className="mode-tabs" role="tablist" aria-label="生成模式">
              <button className={mode === 'generate' ? 'active' : ''} onClick={() => setMode('generate')}>
                文生图
              </button>
              <button className={mode === 'edit' ? 'active' : ''} onClick={() => setMode('edit')}>
                图生图
              </button>
            </div>
            {auth.authRequired && (
              <button className="logout-button" type="button" onClick={logout}>
                退出
              </button>
            )}
          </div>

          <div className="field-grid">
            <SelectField
              label="API 密钥"
              value={config.allowClientApiKey ? 'browser' : 'server'}
              disabled
              options={[{ value: config.allowClientApiKey ? 'browser' : 'server', label: config.allowClientApiKey ? '页面输入' : '服务器配置' }]}
            />
            <SelectField
              label="供应商"
              value={provider}
              onChange={setProvider}
              options={config.providers.map((item) => ({ value: item.id, label: item.name }))}
            />
            <SelectField
              label="模型"
              value={model}
              onChange={setModel}
              options={(selectedProvider?.models || []).map((item) => ({ value: item, label: item }))}
            />
            <SelectField
              label="生成张数"
              value={String(count)}
              onChange={(value) => setCount(Number(value))}
              options={config.counts.map((item) => ({ value: String(item), label: `${item} 张` }))}
            />
            <SelectField
              label="图片尺寸"
              value={size}
              onChange={setSize}
              options={config.sizes.map((item) => ({ value: item, label: item === 'auto' ? '自动 (auto)' : item }))}
            />
            <SelectField
              label="图片质量"
              value={quality}
              onChange={setQuality}
              options={config.qualities.map((item) => ({ value: item, label: item === 'auto' ? '自动 (auto)' : item }))}
            />
            <SelectField
              label="输出格式"
              value={format}
              onChange={setFormat}
              options={config.formats.map((item) => ({ value: item, label: item.toUpperCase() }))}
            />
            {config.allowClientApiKey && (
              <label className="field">
                <span>页面 API Key</span>
                <input
                  type="password"
                  value={apiKey}
                  placeholder="sk-..."
                  onChange={(event) => setApiKey(event.target.value)}
                />
              </label>
            )}
          </div>

          <label className="prompt-field">
            <span>提示词</span>
            <textarea
              maxLength={2000}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={mode === 'generate'
                ? '描述你想生成的图像，例如：一张秋季咖啡馆海报，暖色自然光，主标题 Autumn Brew，杂志级排版，真实摄影风格。'
                : '描述你希望如何修改输入图，例如：保留主体轮廓，将背景替换为透明玻璃展台，增强边缘高光，保持商品居中。'}
            />
            <small>{prompt.length}/2000</small>
          </label>

          {mode === 'edit' && (
            <div className="upload-grid">
              <UploadField
                label="输入图片"
                file={image}
                required
                onChange={setImage}
                help="支持 JPEG、PNG、WEBP，最大 10MB"
              />
              <UploadField
                label="遮罩图片"
                file={mask}
                onChange={setMask}
                help="可选。透明区域表示需要编辑的位置"
              />
            </div>
          )}

          <div className="preset-row">
            {promptPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setPrompt((current) => current ? `${current}，${preset}` : preset)}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="actions">
            <button className="primary-action" disabled={!canSubmit} onClick={submit}>
              {status === 'loading' ? '生成中...' : mode === 'generate' ? '+ 生成图片' : '+ 编辑图片'}
            </button>
            <button className="secondary-action" onClick={resetForm}>重置</button>
          </div>

          <div className="billing-note">
            <span className="dot" />
            每次请求会按所选供应商、模型和账户规则计费。
          </div>
        </div>

        <ResultPanel
          mode={mode}
          status={status}
          error={error}
          progress={progress}
          result={result}
          meta={{
            provider: selectedProvider?.name || provider,
            model,
            size,
            quality,
            count
          }}
        />
      </section>
    </main>
  );
}

function LoginScreen({ password, status, error, onPasswordChange, onSubmit }) {
  return (
    <main className="login-shell">
      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-mark">AI</div>
        <h1>访问验证</h1>
        <p>请输入站点访问口令后继续使用图片生成工具。</p>
        <label className="login-field">
          <span>访问口令</span>
          <input
            type="password"
            value={password}
            autoFocus
            placeholder="输入访问口令"
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </label>
        {error && <div className="login-error">{error}</div>}
        <button className="login-button" disabled={!password.trim() || status === 'loading'}>
          {status === 'loading' ? '验证中...' : '进入工具'}
        </button>
      </form>
    </main>
  );
}

function SelectField({ label, value, onChange, options, disabled = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select disabled={disabled} value={value} onChange={(event) => onChange?.(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function UploadField({ label, file, onChange, help, required = false }) {
  return (
    <label className={`upload-field ${file ? 'has-file' : ''}`}>
      <span>{label}{required ? ' *' : ''}</span>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
      <strong>{file ? file.name : '点击上传图片'}</strong>
      <small>{help}</small>
    </label>
  );
}

function ResultPanel({ mode, status, error, progress, result, meta }) {
  const title = status === 'loading'
    ? mode === 'generate' ? '正在生成' : '正在编辑'
    : status === 'success'
      ? '生成完成'
      : mode === 'generate' ? '等待生成' : '等待编辑';

  return (
    <aside className="panel result-panel">
      <div className="result-header">
        <div>
          <span>生成结果</span>
          <h2>{title}</h2>
        </div>
        <b>{status === 'loading' ? '处理中' : status === 'success' ? '已完成' : status === 'error' ? '失败' : '待开始'}</b>
      </div>

      {(status === 'loading' || status === 'success') && (
        <ProgressBar progress={progress} />
      )}

      <div className={`preview-box ${status}`}>
        {status === 'loading' && <div className="loader" />}
        {status !== 'success' && (
          <div className="empty-preview">
            <div className="preview-icon">□</div>
            <strong>{mode === 'generate' ? '生成完成后会在这里预览' : '编辑完成后会在这里预览'}</strong>
            <p>{mode === 'generate' ? '图片生成可能需要一段时间。' : '编辑模式需要上传输入图片，可选遮罩图。'}</p>
          </div>
        )}
        {status === 'success' && result?.images?.length > 0 && (
          <div className="image-grid">
            {result.images.map((image, index) => (
              <figure key={image.id}>
                <img src={image.b64 ? `data:image/${result.meta.format};base64,${image.b64}` : image.url} alt={`生成结果 ${index + 1}`} />
                <figcaption>
                  <span>结果 {index + 1}</span>
                  <a
                    href={image.b64 ? `data:image/${result.meta.format};base64,${image.b64}` : image.url}
                    download={image.b64 ? `gpt-image-${index + 1}.${result.meta.format}` : undefined}
                    target={image.b64 ? undefined : '_blank'}
                    rel={image.b64 ? undefined : 'noreferrer'}
                  >
                    下载
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      {error && <div className="error-box">{error}</div>}

      <dl className="meta-card">
        <div>
          <dt>模式</dt>
          <dd>{mode === 'generate' ? '文生图' : '图片编辑'}</dd>
        </div>
        <div>
          <dt>供应商</dt>
          <dd>{meta.provider}</dd>
        </div>
        <div>
          <dt>模型</dt>
          <dd>{meta.model}</dd>
        </div>
        <div>
          <dt>尺寸</dt>
          <dd>{meta.size === 'auto' ? '自动' : meta.size}</dd>
        </div>
        <div>
          <dt>质量</dt>
          <dd>{meta.quality === 'auto' ? '自动' : meta.quality}</dd>
        </div>
        <div>
          <dt>生成张数</dt>
          <dd>{meta.count}</dd>
        </div>
      </dl>
    </aside>
  );
}

function ProgressBar({ progress }) {
  const value = Math.max(0, Math.min(100, Math.round(progress.value || 0)));

  return (
    <div className="progress-card" aria-live="polite">
      <div className="progress-line">
        <span>{progress.label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}>
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
