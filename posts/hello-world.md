---
title: "Hello World"
date: "2026-04-18T10:00:00.000Z"
excerpt: "这是本博客的第一篇文章，介绍项目的架构与使用方式。"
tags: ["公告", "Next.js"]
---

# 欢迎来到 My Blog

这是一个基于 **Next.js + Markdown + GitHub** 的无数据库博客系统。

## 特性

- 📝 用 Markdown 写作
- 🚀 后台「发布」→ 自动 commit 到 GitHub
- ⚡ SSG 静态生成，访问极快
- 🎨 Tailwind CSS + Typography 优雅排版
- 🌈 代码块语法高亮（highlight.js）

## 目录结构

```bash
Story/
├── posts/                 # 所有 Markdown 文章
│   └── hello-world.md
├── src/
│   ├── pages/             # Next.js Pages Router
│   │   ├── index.tsx      # 首页列表
│   │   ├── admin.tsx      # 后台写作
│   │   ├── posts/[slug].tsx
│   │   └── api/publish.ts # 发布接口
│   ├── lib/
│   │   ├── posts.ts       # 读取 Markdown
│   │   └── markdown.ts    # Markdown → HTML
│   ├── components/Layout.tsx
│   └── styles/globals.css
└── .env.local             # GitHub Token 等敏感配置
```

## 代码高亮

```ts
function greet(name: string): string {
  return `Hello, ${name}!`;
}

console.log(greet("World"));
```

```js
// 支持多种语言
const sum = (a, b) => a + b;
console.log(sum(1, 2));
```

## 引用与列表

> 用 Markdown 写作是一种享受，专注内容本身。

- 列表项 A
- 列表项 B
- 列表项 C

| 列 1 | 列 2 | 列 3 |
| ---- | ---- | ---- |
| a    | b    | c    |
| d    | e    | f    |

欢迎继续探索其他文章 ✨
