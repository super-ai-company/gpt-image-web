# GPT 图片生成网页

一个轻量的图片生成/编辑网页，支持 OpenAI 兼容接口、模型切换、供应商配置和 Docker 部署。

## 功能

- 文生图：输入提示词生成图片。
- 图生图：上传原图，可选遮罩图，按提示词编辑图片。
- 支持供应商、模型、尺寸、质量、输出格式配置。
- API Key 保存在服务端 `.env`，前端默认不暴露密钥。
- 生成结果在浏览器预览并下载。

## 本地运行

```bash
npm install
npm run build
npm start
```

访问：

```text
http://localhost:3000
```

开发模式：

```bash
npm run server
npm run dev
```

开发模式访问：

```text
http://localhost:5173
```

## 配置

复制配置文件：

```bash
copy .env.example .env
```

OpenAI 官方接口：

```env
OPENAI_API_KEY=sk-your-key
OPENAI_BASE_URL=https://api.openai.com/v1
DEFAULT_PROVIDER=openai
DEFAULT_MODEL=gpt-image-2
```

公网访问建议配置站点口令：

```env
ACCESS_PASSWORD=your-site-password
ACCESS_SESSION_DAYS=7
# HTTPS 反代部署时可设为 true
ACCESS_COOKIE_SECURE=false
```

配置后，浏览器需要先输入访问口令才能进入页面；图片生成和编辑 API 也会校验登录状态。

OpenAI 兼容中转接口示例：

```env
OPENAI_API_KEY=sk-your-key
OPENAI_BASE_URL=http://your-host:your-port/v1
DEFAULT_PROVIDER=openai
DEFAULT_MODEL=gpt-image-2
```

如果需要配置多个供应商：

```env
PROVIDERS_JSON=[{"id":"openai","name":"OpenAI","baseURL":"https://api.openai.com/v1","apiKeyEnv":"OPENAI_API_KEY","models":["gpt-image-2","gpt-image-1"]},{"id":"relay","name":"中转接口","baseURL":"http://your-host:your-port/v1","apiKeyEnv":"RELAY_API_KEY","models":["gpt-image-2"]}]
```

## Docker 部署

准备 `.env` 后执行：

```bash
docker compose up -d --build
```

访问：

```text
http://localhost:3000
```

停止：

```bash
docker compose down
```

## 注意

- 图片接口会按供应商账户规则计费。
- 图生图支持 JPEG、PNG、WEBP，单文件最大 10MB。
- 兼容接口通常需要 `baseURL` 带 `/v1`。
