import dynamic from "next/dynamic";

// Giscus 内部依赖 window，禁用 SSR
const Giscus = dynamic(
  () => import("@giscus/react").then((mod) => mod.default),
  { ssr: false }
);

interface CommentsProps {
  /** 可选：覆盖环境变量中的主题 */
  theme?: "light" | "dark" | "preferred_color_scheme";
}

export default function Comments({ theme = "light" }: CommentsProps) {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  // 配置缺失时优雅降级，不阻塞文章渲染
  if (!repo || !repoId || !category || !categoryId) {
    const missing = [
      !repo && "NEXT_PUBLIC_GISCUS_REPO",
      !repoId && "NEXT_PUBLIC_GISCUS_REPO_ID",
      !category && "NEXT_PUBLIC_GISCUS_CATEGORY",
      !categoryId && "NEXT_PUBLIC_GISCUS_CATEGORY_ID",
    ]
      .filter(Boolean)
      .join(", ");

    return (
      <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400 text-center space-y-1">
        <div>评论区未启用 · 缺失：{missing}</div>
        <div className="text-[11px] text-gray-300">
          本地：修改 .env.local 后需重启 dev server　·　Vercel：在 Settings →
          Environment Variables 添加并 Redeploy
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-6 border-t border-gray-200">
      <Giscus
        id="comments"
        repo={repo as `${string}/${string}`}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme}
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}
