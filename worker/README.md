# Story Blog Publisher · Cloudflare Worker

独立的博客发布服务。前端 admin 页把发布请求发到这个 Worker，Worker 再调用 GitHub API 提交文章。

## 架构

```
前端 admin 页 (Vercel)
    │
    │  POST  JSON + Bearer Token
    ▼
Cloudflare Worker  (本项目)
    │
    │  GitHub Contents API
    ▼
GitHub Repo (caslanbigeyes/story)
    │
    │  webhook
    ▼
Vercel 自动重建 → 上线
```

## 本地开发

```bash
cd worker
npm install
```

### 配置本地环境变量

创建 `.dev.vars`（已在 `.gitignore` 中，不会进 git）：

```bash
PUBLISH_TOKEN=781650249
GITHUB_TOKEN=github_pat_xxx
REPO=caslanbigeyes/story
```

然后：

```bash
npm run dev
```

默认跑在 `http://localhost:8787`，测试：

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 781650249" \
  -d '{"title":"hello worker","content":"# Hello\n\n内容...","tags":["test"]}'
```

## 部署到 Cloudflare

### 1. 安装依赖并登录

```bash
npm install
npx wrangler login
```

### 2. 设置 secrets（逐条，回车后输入值）

```bash
npx wrangler secret put PUBLISH_TOKEN
# 输入：781650249

npx wrangler secret put GITHUB_TOKEN
# 输入：github_pat_xxx

npx wrangler secret put REPO
# 输入：caslanbigeyes/story
```

可选：限制 CORS 来源：

```bash
npx wrangler secret put ALLOWED_ORIGIN
# 输入：https://story-mtup.vercel.app
```

### 3. 部署

```bash
npm run deploy
```

部署成功会输出 Worker URL，形如：

```
https://story-blog-publisher.<你的账号子域>.workers.dev
```

### 4. 查看实时日志（可选）

```bash
npm run tail
```

## 前端对接

在 Vercel 项目的 Environment Variables 中添加：

```
NEXT_PUBLIC_PUBLISH_ENDPOINT=https://story-blog-publisher.xxx.workers.dev
```

然后 Redeploy，admin 页的「发布」按钮就会走 Worker 而不是 Vercel 的 `/api/publish`。

未配置此变量时，前端保留原行为（走 `/api/publish`），两种方式可无缝切换。

## 接口规范

### `POST /`

请求头：
- `Content-Type: application/json`
- `Authorization: Bearer <PUBLISH_TOKEN>`

请求体：

```json
{
  "title": "文章标题",
  "content": "正文 Markdown",
  "tags": ["tag1", "tag2"]
}
```

成功响应（200）：

```json
{
  "ok": true,
  "slug": "2026-04-19-hello-world",
  "url": "https://github.com/...",
  "commit": "abc123..."
}
```

失败响应：

```json
{
  "error": "人类可读的错误",
  "hint": "排查建议（可选）",
  "docs": "GitHub 文档链接（可选）"
}
```

### `GET /` — 健康检查

```json
{ "ok": true, "service": "story-blog-publisher", "time": "..." }
```

### `OPTIONS /` — CORS preflight

自动处理。

## 常见问题

| 现象 | 原因 | 解决 |
|---|---|---|
| 401 Unauthorized | `PUBLISH_TOKEN` 未设或不匹配 | `wrangler secret list` 确认 |
| 500 "Worker 未配置必要的环境变量" | secret 未设置 | `wrangler secret put` 逐个添加 |
| 403 from GitHub | PAT 权限不足 | Fine-grained PAT 需要 Contents: Read and write |
| 404 from GitHub | 仓库名错 / PAT 未勾选该仓库 | 检查 `REPO` 和 PAT scope |
| CORS 错误 | 浏览器跨域被拦 | 设置 `ALLOWED_ORIGIN` 或确认 Origin 被回显 |

## 安全提示

- `.dev.vars` 和 Cloudflare secrets 包含敏感信息，不要进 git
- 若 PAT 泄漏，立即在 GitHub [revoke](https://github.com/settings/tokens) 并重新生成
- 生产环境建议设置 `ALLOWED_ORIGIN` 限制跨域来源，防止他人嫖用你的 Worker
