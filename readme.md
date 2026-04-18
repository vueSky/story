echo "# story" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/caslanbigeyes/story.git
git push -u origin main




好，这里直接给你一套**可运行的完整 repo（Next.js + Markdown + 在线发布后台 + GitHub commit）**。
你只需要 `git clone + 配置 token + 部署` 就能用。

---

# 📦 一、项目结构（完整版）

```bash
next-blog-cms/
├── posts/                     # 博客内容
│   └── hello-world.md
│
├── src/
│   ├── pages/
│   │   ├── index.tsx
│   │   ├── admin.tsx          # 后台写作页
│   │   ├── posts/[slug].tsx
│   │   └── api/publish.ts     # 发布接口
│   │
│   ├── lib/
│   │   ├── posts.ts
│   │   └── markdown.ts
│   │
│   ├── components/
│   │   └── Layout.tsx
│   │
│   └── styles/
│       └── globals.css
│
├── .env.local
├── next.config.js
├── tsconfig.json
├── package.json
```

---

# 🚀 二、package.json

```json
{
  "name": "next-blog-cms",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "gray-matter": "^4.0.3",
    "remark": "^14.0.2",
    "remark-html": "^15.0.2",
    "slugify": "^1.6.6"
  }
}
```

---

# ⚙️ 三、核心代码

---

## 1️⃣ Markdown 读取（lib/posts.ts）

```ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "posts");

export function getAllPosts() {
  const files = fs.readdirSync(postsDir);

  return files.map((file) => {
    const slug = file.replace(".md", "");
    const content = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data } = matter(content);

    return { slug, ...data };
  });
}

export function getPostBySlug(slug: string) {
  const file = fs.readFileSync(
    path.join(postsDir, `${slug}.md`),
    "utf8"
  );

  const { data, content } = matter(file);
  return { slug, content, ...data };
}
```

---

## 2️⃣ Markdown 转 HTML

```ts
import { remark } from "remark";
import html from "remark-html";

export async function markdownToHtml(md: string) {
  const result = await remark().use(html).process(md);
  return result.toString();
}
```

---

## 3️⃣ 首页

```tsx
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home({ posts }: any) {
  return (
    <div style={{ padding: 40 }}>
      <h1>My Blog</h1>

      {posts.map((p: any) => (
        <div key={p.slug}>
          <Link href={`/posts/${p.slug}`}>
            <h2>{p.title}</h2>
          </Link>
        </div>
      ))}
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      posts: getAllPosts(),
    },
  };
}
```

---

## 4️⃣ 文章页

```tsx
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { markdownToHtml } from "@/lib/markdown";

export default function Post({ post }: any) {
  return (
    <div style={{ padding: 40 }}>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}

export async function getStaticPaths() {
  const posts = getAllPosts();

  return {
    paths: posts.map((p) => ({
      params: { slug: p.slug },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }: any) {
  const post = getPostBySlug(params.slug);
  const content = await markdownToHtml(post.content);

  return {
    props: {
      post: { ...post, content },
    },
  };
}
```

---

## 5️⃣ 后台页面（核心🔥）

```tsx
import { useState } from "react";

export default function Admin() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const publish = async () => {
    await fetch("/api/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 123456"
      },
      body: JSON.stringify({ title, content }),
    });

    alert("发布成功");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>写文章</h1>

      <input
        placeholder="标题"
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        rows={20}
        onChange={(e) => setContent(e.target.value)}
      />

      <button onClick={publish}>发布</button>
    </div>
  );
}
```

---

## 6️⃣ 发布接口（最核心🔥）

```ts
import slugify from "slugify";

export default async function handler(req, res) {
  if (req.headers.authorization !== "Bearer 123456") {
    return res.status(401).end("Unauthorized");
  }

  const { title, content } = req.body;

  const slug = slugify(title, { lower: true });

  const md = `---
title: "${title}"
date: "${new Date().toISOString()}"
---

${content}
`;

  const base64 = Buffer.from(md).toString("base64");

  const response = await fetch(
    `https://api.github.com/repos/${process.env.REPO}/contents/posts/${slug}.md`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `add post ${title}`,
        content: base64,
      }),
    }
  );

  const data = await response.json();

  res.status(200).json(data);
}
```

---

# 🔐 四、环境变量

```bash
# .env.local
GITHUB_TOKEN=ghp_xxx
REPO=你的用户名/仓库名
```

---

# 🚀 五、运行

```bash
npm install
npm run dev
```

访问：

```bash
http://localhost:3000/admin
```

---

# 🌍 六、部署（关键）

你只需要：

1️⃣ push 到 GitHub
2️⃣ 绑定部署平台（Vercel / Cloudflare Pages）
3️⃣ 配置环境变量

之后👇

```bash
点击发布 → 自动 commit → 自动部署 → 博客更新
```

---

# 🔥 七、你现在已经拥有的能力

这套就是：

```bash
无数据库 CMS
+ 自动发布系统
+ 静态博客
```

---

# 👉 如果你要再进阶（我建议你下一步）

我可以帮你升级成：

### 💥 专业版后台

* 登录（GitHub OAuth）
* 草稿 / 发布 / 删除
* 文章列表管理
* 标签系统
* 图片上传（接你 COS）

或者：

👉 给你一版 **UI很高级的后台（Notion风）**

直接说：
**“升级后台 UI” 或 “做登录系统”** 🚀
# story
