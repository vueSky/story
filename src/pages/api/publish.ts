import type { NextApiRequest, NextApiResponse } from "next";
import slugify from "slugify";
import fs from "fs";
import path from "path";

interface PublishBody {
  title?: string;
  content?: string;
  tags?: string[];
}

/**
 * 生成文件名安全的 slug：
 *  - 优先：日期 + slugify 后的英文 title
 *  - 纯中文/纯符号：日期 + 36 进制时间戳
 */
function buildSlug(title: string): string {
  const datePrefix = new Date().toISOString().slice(0, 10); // 2026-04-18
  const sluggedTitle = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  if (sluggedTitle) {
    // 限制长度，避免 URL 过长
    return `${datePrefix}-${sluggedTitle.slice(0, 60)}`;
  }

  return `${datePrefix}-${Date.now().toString(36)}`;
}

function hintFromStatus(status: number, repo: string): string | undefined {
  if (status === 401) {
    return "GITHUB_TOKEN 无效或过期，请检查 .env.local";
  }
  if (status === 403) {
    return "GITHUB_TOKEN 权限不足。Fine-grained PAT 需要 Contents: Read and write；Classic PAT 需要 repo 权限";
  }
  if (status === 404) {
    return `仓库 ${repo} 不存在，或该 Token 无访问权限（检查仓库 owner/name 是否正确，以及 PAT 是否勾选了该仓库）`;
  }
  if (status === 422) {
    return "GitHub 校验失败，常见于 sha 未带上导致覆盖冲突";
  }
  return undefined;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expectedToken = process.env.PUBLISH_TOKEN;
  if (!expectedToken) {
    return res
      .status(500)
      .json({ error: "服务端未配置 PUBLISH_TOKEN，请在 .env.local 中设置" });
  }

  if (req.headers.authorization !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { title, content, tags } = (req.body || {}) as PublishBody;

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: "标题和内容不能为空" });
  }

  const repo = process.env.REPO;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!repo || !githubToken) {
    return res
      .status(500)
      .json({ error: "服务端未配置 REPO 或 GITHUB_TOKEN" });
  }

  const safeSlug = buildSlug(title);

  const frontmatterLines = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `date: ${JSON.stringify(new Date().toISOString())}`,
  ];
  if (tags && tags.length > 0) {
    frontmatterLines.push(
      `tags: [${tags.map((t) => JSON.stringify(t)).join(", ")}]`
    );
  }
  frontmatterLines.push("---", "");

  const md = `${frontmatterLines.join("\n")}\n${content}\n`;
  const base64 = Buffer.from(md, "utf8").toString("base64");
  const filePath = `posts/${safeSlug}.md`;
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

  try {
    // 1) 查询现有文件 sha（存在则 PUT 需带 sha）
    let existingSha: string | undefined;
    const checkResp = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (checkResp.status === 200) {
      const existing = (await checkResp.json()) as { sha?: string };
      existingSha = existing.sha;
    } else if (checkResp.status !== 404) {
      const errData = (await checkResp.json().catch(() => ({}))) as {
        message?: string;
        documentation_url?: string;
      };
      console.error("[api/publish] GET failed:", checkResp.status, errData);
      return res.status(checkResp.status).json({
        error: `GitHub 查询失败（${checkResp.status}）：${errData.message || "未知错误"}`,
        hint: hintFromStatus(checkResp.status, repo),
        docs: errData.documentation_url,
      });
    }

    // 2) 提交文件
    const putResp = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        message: existingSha
          ? `update post: ${title}`
          : `add post: ${title}`,
        content: base64,
        sha: existingSha,
      }),
    });

    const data = (await putResp.json().catch(() => ({}))) as {
      message?: string;
      documentation_url?: string;
      content?: { html_url?: string };
      commit?: { sha?: string };
    };

    if (!putResp.ok) {
      console.error("[api/publish] PUT failed:", putResp.status, data);
      return res.status(putResp.status).json({
        error: `GitHub 提交失败（${putResp.status}）：${data.message || "未知错误"}`,
        hint: hintFromStatus(putResp.status, repo),
        docs: data.documentation_url,
      });
    }

    // dev 环境：同步写本地文件，让首页立即可见（生产环境 Vercel 文件系统只读，跳过）
    let localSynced = false;
    if (process.env.NODE_ENV === "development") {
      try {
        const postsDir = path.join(process.cwd(), "posts");
        if (!fs.existsSync(postsDir)) {
          fs.mkdirSync(postsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(postsDir, `${safeSlug}.md`), md, "utf8");
        localSynced = true;
      } catch (writeErr) {
        console.warn("[api/publish] 本地文件写入失败（不影响远程发布）:", writeErr);
      }
    }

    // 尝试触发 ISR revalidate（生产环境生效）
    try {
      await res.revalidate?.("/");
      await res.revalidate?.(`/posts/${safeSlug}`);
    } catch (revalidateErr) {
      console.warn("[api/publish] revalidate 失败:", revalidateErr);
    }

    return res.status(200).json({
      ok: true,
      slug: safeSlug,
      url: data.content?.html_url,
      commit: data.commit?.sha,
      localSynced,
    });
  } catch (err) {
    console.error("[api/publish] unexpected error:", err);
    return res.status(500).json({
      error:
        err instanceof Error ? err.message : "Publish failed (unexpected)",
    });
  }
}
