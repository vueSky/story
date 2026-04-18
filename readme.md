say my life


有，而且你这个场景（静态博客 + 在线发布）**最适合的就是 Cloudflare Workers 或 Vercel Serverless**，完全可以做到“免费 + 不用本地 + 环境变量可用”。

我帮你讲清楚：**能用 + 怎么用 + 推荐选哪个**。

---

# 🥇 一、结论先说（最推荐方案）

## 👉 最优解：Cloudflare Workers

原因：

* ✅ 免费额度很大（够个人博客）
* ✅ 环境变量支持（Secrets）
* ✅ 全球边缘部署（很快）
* ✅ 非常适合“发布 API”

👉 你这个 CMS 发布系统 = **完美匹配 Workers**

---

## 🥈 次选：Vercel Functions

优点：

* Next.js 原生支持
* 上手简单
* 自动部署

缺点：

* 免费额度稍紧
* GitHub API 写入有时会慢一点

---

# 🚀 二、你现在要解决的问题本质

你现在卡的是：

```bash id="p9k2ma"
PUBLISH_TOKEN 在部署环境不可用
```

👉 解决思路只有一个：

> ❗ 把“发布逻辑”从前端移到 Serverless

---

# ⚙️ 三、方案 1（强烈推荐）：Cloudflare Workers

---

## 1️⃣ 创建 Worker

```bash id="k8m2qa"
npm create cloudflare@latest
```

选：

```bash id="c9k2ma"
✔ Worker
✔ TypeScript
```

---

## 2️⃣ 写发布 API

```ts id="w8k2qa"
export default {
  async fetch(request, env) {
    const { title, content } = await request.json();

    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const md = `---
title: "${title}"
date: "${new Date().toISOString()}"
---

${content}
`;

    const base64 = btoa(md);

    const res = await fetch(
      `https://api.github.com/repos/${env.REPO}/contents/posts/${slug}.md`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${env.PUBLISH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `add ${title}`,
          content: base64,
        }),
      }
    );

    return new Response(JSON.stringify(await res.json()));
  },
};
```

---

## 3️⃣ 配置环境变量（关键🔥）

```bash id="m8k2qa"
wrangler secret put PUBLISH_TOKEN
wrangler secret put REPO
```

👉 这一步就是你说的“环境变量生效”

---

## 4️⃣ 部署

```bash id="z8k2ma"
wrangler deploy
```

---

## 🎯 前端调用

```ts id="q8m2ka"
await fetch("https://your-worker.workers.dev", {
  method: "POST",
  body: JSON.stringify({ title, content })
});
```

---

# ⚡ 四、方案 2：Vercel Functions（更简单）

如果你不想折腾 Worker：

👉 直接在 Next.js 项目里：

```bash id="n8m2qa"
/api/publish.ts
```

---

## 写法：

```ts id="v8k2qa"
export default async function handler(req, res) {
  const { title, content } = req.body;

  const token = process.env.PUBLISH_TOKEN;
  const repo = process.env.REPO;

  const slug = title.toLowerCase().replace(/\s+/g, "-");

  const md = `---
title: "${title}"
---

${content}`;

  const base64 = Buffer.from(md).toString("base64");

  const result = await fetch(
    `https://api.github.com/repos/${repo}/contents/posts/${slug}.md`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `add ${title}`,
        content: base64,
      }),
    }
  );

  res.json(await result.json());
}
```

---

## 环境变量（Vercel里设置）

```bash id="x8m2ka"
Project Settings → Environment Variables
```

添加：

* `PUBLISH_TOKEN`
* `REPO`

---

# 🧠 五、两种方案对比

| 能力   | Workers | Vercel     |
| ---- | ------- | ---------- |
| 免费额度 | ⭐⭐⭐⭐    | ⭐⭐⭐        |
| 延迟   | 极低      | 低          |
| 配置难度 | 中       | 简单         |
| 适合   | 工程化 CMS | Next.js 项目 |

---

# 🚨 六、关键认知（避免再踩坑）

```bash id="k9m2qa"
GitHub Pages ❌ 没有 server
Cloudflare/Vercel ✔ 才是 backend
```

---

# 🧩 七、推荐你最终架构（最稳）

```bash id="m9k2qa"
前台：GitHub Pages / Cloudflare Pages
后台：Cloudflare Worker
数据：GitHub repo（Markdown）
```

---

# 🚀 如果你要我帮你继续升级

我可以直接帮你做👇

### 💥 完整生产级 CMS：

* 在线登录后台
* 发布 / 草稿 / 删除
* 图片上传（COS / R2）
* 自动部署
* 不需要本地

---

👉 直接说：

**“帮我做 Cloudflare Worker 完整版本”**
