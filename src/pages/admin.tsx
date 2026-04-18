import { useState } from "react";
import Head from "next/head";

type Status = "idle" | "publishing" | "success" | "error";

export default function Admin() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const publish = async () => {
    if (!title.trim() || !content.trim()) {
      setStatus("error");
      setMessage("标题和内容不能为空");
      return;
    }
    if (!token.trim()) {
      setStatus("error");
      setMessage("请输入发布 Token");
      return;
    }

    setStatus("publishing");
    setMessage("正在发布到 GitHub...");

    try {
      const resp = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const parts = [data.error || `发布失败（${resp.status}）`];
        if (data.hint) parts.push(`提示：${data.hint}`);
        if (data.docs) parts.push(`文档：${data.docs}`);
        throw new Error(parts.join("\n"));
      }

      setStatus("success");
      const successParts = [`✓ 发布成功：${data.slug}`];
      if (data.localSynced) {
        successParts.push("本地已同步，返回首页即可看到 ✨");
      } else {
        successParts.push("已提交到 GitHub，等待部署完成后上线");
      }
      if (data.url) {
        successParts.push(`GitHub: ${data.url}`);
      }
      setMessage(successParts.join("\n"));
      setTitle("");
      setTags("");
      setContent("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "发布失败");
    }
  };

  return (
    <>
      <Head>
        <title>写作 · My Blog</title>
      </Head>

      <section className="space-y-6">
        <header className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">写文章</h1>
          <p className="text-sm text-gray-500 mt-2">
            发布后会自动 commit 到 GitHub 仓库，触发部署重建
          </p>
        </header>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">标题</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="文章标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              标签（逗号分隔，可选）
            </label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tech, life, note"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              正文（支持 Markdown、代码块语法高亮）
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={20}
              placeholder={"# 标题\n\n正文，可插入代码块：\n\n```ts\nconst x = 1;\n```\n"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              发布 Token（后端 PUBLISH_TOKEN）
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入 .env.local 配置的 PUBLISH_TOKEN"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={publish}
            disabled={status === "publishing"}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {status === "publishing" ? "发布中..." : "发布"}
          </button>

          {message ? (
            <div
              className={`p-3 rounded-md text-sm whitespace-pre-wrap ${
                status === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : status === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {message}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
