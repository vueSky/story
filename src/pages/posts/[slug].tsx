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

      <article className="space-y-6">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline inline-block"
        >
          ← 返回列表
        </Link>

        <header className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>

          <div className="text-xs text-gray-500 mt-3 flex items-center flex-wrap gap-x-3 gap-y-1">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleString("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
            {post.tags && post.tags.length > 0 ? (
              <span className="flex items-center gap-1">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
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
