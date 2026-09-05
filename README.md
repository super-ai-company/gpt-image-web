# GPT 图片生成网页

一个轻量的图片生成/编辑网页，支持 OpenAI 兼容接口、模型切换、供应商配置和 Docker 部署。

## 功能

- 文生图：输入提示词生成图片。
- 图生图：上传原图，可选遮罩图，按提示词编辑图片。
- 支持供应商、模型、尺寸、质量、输出格式配置。
- 内置 GPT-Image2 Style Library 模板，通过同一供应商 API 生成可编辑的专业提示词。
- API Key 保存在服务端 `.env`，前端默认不暴露密钥。
- 图片生成和编辑使用后台任务轮询，避免长请求触发反向代理超时。
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

## 提示词到图片工作流

1. 在“创意简述”中写清楚要做什么，以及必须出现的标题、商品或场景。
2. 使用智能匹配给出的 3 个风格方向，或手动选择 Style Library 模板。
3. 点击“生成专业提示词”。服务端会复用所选图片供应商的 `baseURL` 和 API Key，调用 `PROMPT_MODEL`。
4. 检查并修改生成的六段式提示词，然后生成图片。
5. 生成后可填写“继续调整”；服务端会先用文本模型重写完整提示词，再自动重新生成。需要保持原图细节时，点击某张结果下方的“继续编辑”进入图生图。

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
# 提示词生成复用相同的 OPENAI_BASE_URL 和 OPENAI_API_KEY
PROMPT_MODEL=gpt-5-mini
```

公网访问建议配置站点口令：

```env
ACCESS_PASSWORD=your-site-password
ACCESS_SESSION_DAYS=7
# HTTPS 反代部署时可设为 true
ACCESS_COOKIE_SECURE=false
# 生成结果在服务端内存中的保留分钟数，默认 15
IMAGE_JOB_RESULT_TTL_MINUTES=15
```

配置后，浏览器需要先输入访问口令才能进入页面；图片生成和编辑 API 也会校验登录状态。

OpenAI 兼容中转接口示例：

```env
OPENAI_API_KEY=sk-your-key
OPENAI_BASE_URL=http://your-host:your-port/v1
DEFAULT_PROVIDER=openai
DEFAULT_MODEL=gpt-image-2
PROMPT_MODEL=gpt-5-mini
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

## 自动部署

生产部署使用 1Panel 主机主动拉取 GitHub 的方式，避免依赖外部机器入站访问内网服务。

当前生产约定：

```text
Host: 192.168.1.83
App dir: /home/happy/apps/gpt-image-web
Public port: 15230
URL: http://110.171.40.190:15230
Branch: main
```

服务器每分钟执行一次：

```bash
/home/happy/apps/gpt-image-web/deploy/pull-deploy.sh
```

脚本会检查 `main` 的最新 commit，只有发现更新时才会拉取代码并执行：

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans
```

部署前请在服务器的 `/home/happy/apps/gpt-image-web/.env` 配置真实密钥和访问口令；该文件不会提交到 GitHub。

## 注意

- 图片接口会按供应商账户规则计费。
- 提示词生成与图片生成复用所选供应商的 `baseURL` 和 API Key；供应商需同时支持 `PROMPT_MODEL` 配置的文本模型。
- 后台任务保存在当前服务进程内；服务重启后，未完成任务和未领取结果会丢失。
- 图生图支持 JPEG、PNG、WEBP，单文件最大 10MB。
- 兼容接口通常需要 `baseURL` 带 `/v1`。
