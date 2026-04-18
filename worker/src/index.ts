/**
 * Cloudflare Worker：博客发布服务
 *
 * 能力：
 *  - 接收 POST /，校验 Authorization: Bearer <PUBLISH_TOKEN>
 *  - 将文章 Markdown 文件 PUT 到 GitHub 仓库 posts/{slug}.md
 *  - 支持 CORS 跨域（供 Vercel 前端调用）
 *  - 返回结构化错误，便于前端显示 hint
 *
 * 绑定变量（通过 wrangler secret 或 Dashboard 设置）：
 *   PUBLISH_TOKEN   —— 后台口令
 *   GITHUB_TOKEN    —— GitHub PAT
 *   REPO            —— owner/repo
 *   ALLOWED_ORIGIN  —— 可选，允许的前端域名。不设则回显请求 Origin
 */

export interface Env {
  PUBLISH_TOKEN: string;
  GITHUB_TOKEN: string;
  REPO: string;
  ALLOWED_ORIGIN?: string;
}

interface PublishBody {
  title?: string;
  content?: string;
  tags?: string[];
}

interface GithubErrorPayload {
  message?: string;
  documentation_url?: string;
}

interface GithubPutPayload extends GithubErrorPayload {
  content?: { html_url?: string; sha?: string };
  commit?: { sha?: string; html_url?: string };
}

interface GithubFilePayload {
  sha?: string;
}

// ---------- 工具函数 ----------

function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Expose-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(origin),
    },
  });
}

/** 生成 URL 安全的英文 slug，中文 / 表情会被过滤 */
function slugifyAscii(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildSlug(title: string): string {
  const datePrefix = new Date().toISOString().slice(0, 10);
  const asciiSlug = slugifyAscii(title);
  if (asciiSlug) {
    return `${datePrefix}-${asciiSlug.slice(0, 60)}`;
  }
  return `${datePrefix}-${Date.now().toString(36)}`;
}

function hintFromStatus(status: number, repo: string): string | undefined {
  if (status === 401) return "GITHUB_TOKEN 无效或过期";
  if (status === 403)
    return "GITHUB_TOKEN 权限不足，Fine-grained PAT 需要 Contents: Read and write";
  if (status === 404)
    return `仓库 ${repo} 不存在，或该 Token 无访问权限（检查 owner/name 和 PAT 勾选的仓库范围）`;
  if (status === 422) return "文件已存在但 sha 未带上（并发冲突）";
  return undefined;
}

/**
 * UTF-8 安全的 base64 编码。
 * Workers 原生 btoa 只接受 Latin1 字符串，中文会抛错，必须先 UTF-8 编码。
 */
function toBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 归一化 origin：去掉末尾斜杠、全部小写，便于白名单比较。
 */
function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, "").toLowerCase();
}

/**
 * 决定返回的 Access-Control-Allow-Origin 值。
 *  - 未设 ALLOWED_ORIGIN / 设为 "*"：回显请求 Origin；Origin 缺失时返回 "*"
 *  - ALLOWED_ORIGIN 是逗号分隔白名单：匹配时回显具体 Origin，否则回显第一项
 *
 * 容错点：
 *  - 自动去掉 ALLOWED_ORIGIN 配置末尾的 `/`
 *  - 大小写不敏感比较
 */
function pickOrigin(request: Request, env: Env): string {
  const requestOrigin = request.headers.get("Origin") || "";
  const configured = env.ALLOWED_ORIGIN?.trim();

  if (!configured || configured === "*") {
    return requestOrigin || "*";
  }

  const whitelist = configured
    .split(",")
    .map((s) => normalizeOrigin(s))
    .filter(Boolean);

  if (whitelist.length === 0) {
    return requestOrigin || "*";
  }

  const normalizedRequest = normalizeOrigin(requestOrigin);
  if (normalizedRequest && whitelist.includes(normalizedRequest)) {
    return requestOrigin;
  }

  // 未匹配：返回白名单第一项（浏览器会拒绝但不影响 preflight 可视化排查）
  return whitelist[0];
}

// ---------- Worker 入口 ----------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = pickOrigin(request, env);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    // 健康检查（GET）
    if (request.method === "GET") {
      return json(
        { ok: true, service: "story-blog-publisher", time: new Date().toISOString() },
        200,
        origin
      );
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, origin);
    }

    // 环境变量校验
    const { PUBLISH_TOKEN, GITHUB_TOKEN, REPO } = env;
    if (!PUBLISH_TOKEN || !GITHUB_TOKEN || !REPO) {
      return json(
        {
          error: "Worker 未配置必要的环境变量",
          hint:
            "请用 `npx wrangler secret put PUBLISH_TOKEN|GITHUB_TOKEN|REPO` 或在 Cloudflare Dashboard 设置",
        },
        500,
        origin
      );
    }

    // 认证
    if (request.headers.get("Authorization") !== `Bearer ${PUBLISH_TOKEN}`) {
      return json({ error: "Unauthorized" }, 401, origin);
    }

    // 解析 body
    let body: PublishBody;
    try {
      body = await request.json<PublishBody>();
    } catch {
      return json({ error: "Invalid JSON body" }, 400, origin);
    }

    const { title, content, tags } = body;
    if (!title?.trim() || !content?.trim()) {
      return json({ error: "标题和内容不能为空" }, 400, origin);
    }

    // 构建 slug 和 Markdown
    const slug = buildSlug(title);

    const frontmatter: string[] = [
      "---",
      `title: ${JSON.stringify(title)}`,
      `date: ${JSON.stringify(new Date().toISOString())}`,
    ];
    if (Array.isArray(tags) && tags.length > 0) {
      const safeTags = tags.filter((t): t is string => typeof t === "string");
      if (safeTags.length > 0) {
        frontmatter.push(
          `tags: [${safeTags.map((t) => JSON.stringify(t)).join(", ")}]`
        );
      }
    }
    frontmatter.push("---", "");

    const md = `${frontmatter.join("\n")}\n${content}\n`;
    const base64 = toBase64Utf8(md);
    const filePath = `posts/${slug}.md`;
    const apiUrl = `https://api.github.com/repos/${REPO}/contents/${filePath}`;

    const githubHeaders = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "story-blog-worker",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    // 1) 查询现有文件 sha（文件已存在则 PUT 必须带 sha）
    let existingSha: string | undefined;
    try {
      const checkResp = await fetch(apiUrl, { headers: githubHeaders });

      if (checkResp.status === 200) {
        const existing = await checkResp.json<GithubFilePayload>();
        existingSha = existing.sha;
      } else if (checkResp.status !== 404) {
        const errData = await checkResp
          .json<GithubErrorPayload>()
          .catch<GithubErrorPayload>(() => ({}));
        return json(
          {
            error: `GitHub 查询失败（${checkResp.status}）：${
              errData.message || "未知错误"
            }`,
            hint: hintFromStatus(checkResp.status, REPO),
            docs: errData.documentation_url,
          },
          checkResp.status,
          origin
        );
      }
    } catch (err) {
      return json(
        {
          error: "GitHub 查询请求失败",
          detail: err instanceof Error ? err.message : String(err),
        },
        502,
        origin
      );
    }

    // 2) 提交文件
    try {
      const putResp = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          ...githubHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: existingSha ? `update post: ${title}` : `add post: ${title}`,
          content: base64,
          sha: existingSha,
        }),
      });

      const data = await putResp
        .json<GithubPutPayload>()
        .catch<GithubPutPayload>(() => ({}));

      if (!putResp.ok) {
        return json(
          {
            error: `GitHub 提交失败（${putResp.status}）：${
              data.message || "未知错误"
            }`,
            hint: hintFromStatus(putResp.status, REPO),
            docs: data.documentation_url,
          },
          putResp.status,
          origin
        );
      }

      return json(
        {
          ok: true,
          slug,
          url: data.content?.html_url,
          commit: data.commit?.sha,
        },
        200,
        origin
      );
    } catch (err) {
      return json(
        {
          error: "GitHub 提交请求失败",
          detail: err instanceof Error ? err.message : String(err),
        },
        502,
        origin
      );
    }
  },
} satisfies ExportedHandler<Env>;
