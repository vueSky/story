import Link from "next/link";
import Head from "next/head";
import type { GetStaticPaths, GetStaticProps } from "next";
import { getAllPosts, getPostBySlug, type Post } from "@/lib/posts";
import { markdownToHtml } from "@/lib/markdown";
import Comments from "@/components/Comments";

interface Props {
  post: Post;
}

export default function PostPage({ post }: Props) {
  return (
    <>
      <Head>
        <title>{post.title} · My Blog</title>
        {post.excerpt ? (
          <meta name="description" content={post.excerpt} />
        ) : null}
      </Head>

      <article className="space-y-8 animate-fade-up">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回列表
        </Link>

        <header className="pb-8 border-b border-gray-200/70">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">
            <span className="w-6 h-px bg-gray-400" />
            Article
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight leading-[1.15] text-gray-900">
            {post.title}
          </h1>

          <div className="text-sm text-gray-500 mt-6 flex items-center flex-wrap gap-x-4 gap-y-1">
            <time dateTime={post.date} className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  strokeLinecap="round"
                />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
              {new Date(post.date).toLocaleString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>

            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
              {post.readingTime} 分钟阅读
            </span>

            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {post.wordCount} 字
            </span>

            {post.tags && post.tags.length > 0 ? (
              <span className="flex items-center gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </span>
            ) : null}
          </div>
        </header>

        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <Comments />
      </article>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts();
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug;
  if (typeof slug !== "string") {
    return { notFound: true };
  }

  try {
    const post = getPostBySlug(slug);
    const html = await markdownToHtml(post.content);

    return {
      props: {
        post: { ...post, content: html },
      },
      revalidate: 60,
    };
  } catch {
    return { notFound: true };
  }
};
