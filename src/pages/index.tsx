import Link from "next/link";
import Head from "next/head";
import type { GetStaticProps } from "next";
import { getAllPosts, type PostMeta } from "@/lib/posts";

interface Props {
  posts: PostMeta[];
}

export default function Home({ posts }: Props) {
  return (
    <>
      <Head>
        <title>My Blog</title>
        <meta name="description" content="基于 Next.js + Markdown 的个人博客" />
      </Head>

      <section className="space-y-8">
        <header className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">文章列表</h1>
          <p className="text-sm text-gray-500 mt-2">共 {posts.length} 篇</p>
        </header>

        {posts.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <p>还没有文章。</p>
            <p className="mt-2">
              去{" "}
              <Link href="/admin" className="text-blue-600 hover:underline">
                写作页
              </Link>{" "}
              发布第一篇吧 ✨
            </p>
          </div>
        ) : (
          <ul className="space-y-8">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/posts/${post.slug}`} className="group block">
                  <h2 className="text-xl font-semibold group-hover:text-blue-600 transition">
                    {post.title}
                  </h2>

                  <div className="text-xs text-gray-500 mt-2 flex items-center flex-wrap gap-x-3 gap-y-1">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
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

                  {post.excerpt ? (
                    <p className="text-gray-600 mt-3 leading-7 line-clamp-2">
                      {post.excerpt}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      posts: getAllPosts(),
    },
  };
};
