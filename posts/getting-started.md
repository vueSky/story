---
title: "快速开始"
date: "2026-04-18T12:00:00.000Z"
excerpt: "本地起服务、配置 GitHub Token、部署上线的完整步骤。"
tags: ["教程", "部署"]
---

# 快速开始

## 1. 安装依赖

```bash
npm install
```

## 2. 配置环境变量

复制模板：

```bash
cp .env.local.example .env.local
```

然后编辑 `.env.local`：

```bash
GITHUB_TOKEN=ghp_xxx            # GitHub PAT，需要 repo 权限
REPO=caslanbigeyes/story        # 仓库 owner/name
PUBLISH_TOKEN=my-secret-token   # 后台发布时填入的口令
```

## 3. 本地运行

```bash
npm run dev
```

访问：

- 首页：<http://localhost:3000>
- 写作：<http://localhost:3000/admin>

## 4. 部署

推荐 **Vercel**：

1. 把仓库推到 GitHub
2. 在 Vercel 导入该仓库
3. 配置与 `.env.local` 相同的环境变量
4. Deploy 即可

## 5. 发布流程

1. 打开 `/admin`
2. 输入标题 / 标签 / Markdown 正文
3. 输入 `PUBLISH_TOKEN`
4. 点击「发布」→ 接口调用 GitHub API，新增 `posts/{slug}.md` 的 commit
5. GitHub 触发 Vercel 自动重建，几分钟后文章上线

就是这么简单 🎉
