import Link from "next/link";
import Head from "next/head";
import type { GetStaticProps } from "next";
import { getAllPosts, type PostMeta } from "@/lib/posts";

interface Props {
  posts: PostMeta[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-white/60 backdrop-blur text-gray-600 px-2.5 py-0.5 rounded-full text-xs border border-gray-200/60">
      <span className="w-1 h-1 rounded-full bg-gray-400" />
      {tag}
    </span>
  );
}

function FeaturedCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative block rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-10 md:p-14 shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-up"
    >
      {/* 装饰性光晕 */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors duration-700" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors duration-700" />

      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-medium text-blue-300 mb-4 uppercase tracking-widest">
          <span className="inline-block w-8 h-px bg-blue-300" />
          Featured · 精选
        </div>

        <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight mb-4 group-hover:translate-x-1 transition-transform duration-500">
          {post.title}
        </h2>

        {post.excerpt ? (
          <p className="text-gray-300/90 text-base md:text-lg leading-relaxed mb-6 max-w-2xl line-clamp-3">
            {post.excerpt}
          </p>
        ) : null}

        <div className="flex items-center flex-wrap gap-3 text-xs text-gray-400">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="w-1 h-1 rounded-full bg-gray-500" />
          <span>{post.readingTime} min read</span>
          {post.tags && post.tags.length > 0 ? (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-500" />
              <span className="flex items-center gap-1.5">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </span>
            </>
          ) : null}
        </div>

        <div className="mt-8 inline-flex items-center gap-2 text-sm text-white/90 group-hover:gap-3 transition-all duration-300">
          <span>开始阅读</span>
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post, index }: { post: PostMeta; index: number }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative block bg-white rounded-2xl p-6 md:p-7 border border-gray-200/70 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 60, 480)}ms` }}
    >
      {/* 顶部细线装饰 */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-gray-400 mb-3">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span>{post.readingTime} min</span>
      </div>

      <h3 className="font-serif text-xl md:text-2xl font-semibold text-gray-900 leading-snug tracking-tight mb-3 group-hover:text-blue-600 transition-colors duration-300">
        {post.title}
      </h3>

      {post.excerpt ? (
        <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed line-clamp-2 mb-4">
          {post.excerpt}
        </p>
      ) : null}

      {post.tags && post.tags.length > 0 ? (
        <div className="flex items-center flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>
      ) : null}
    </Link>
  );
}

export default function Home({ posts }: Props) {
  const [featured, ...rest] = posts;

  return (
    <>
      <Head>
        <title>My Blog — 思考、记录、分享</title>
        <meta name="description" content="基于 Next.js + Markdown 的个人博客" />
      </Head>

      <div className="space-y-16">
        {/* Hero 区 */}
        <section className="relative pt-6 pb-10 animate-fade-up">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
            <div className="absolute top-10 right-1/4 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl" />
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-gray-500 uppercase tracking-[0.2em] mb-4">
            <span className="w-6 h-px bg-gray-400" />
            Journal
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6">
            思考、记录、分享
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              用文字留下此刻
            </span>
          </h1>

          <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-xl">
            一个用 Markdown 写作的个人空间。这里记录代码、生活、与那些值得被记住的瞬间。
          </p>

          <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              共 {posts.length} 篇文章
            </span>
            <span className="h-4 w-px bg-gray-300" />
            <Link
              href="/admin"
              className="hover:text-gray-900 transition-colors inline-flex items-center gap-1"
            >
              写一篇
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </section>

        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">✍️</div>
            <p className="text-gray-500">还没有文章。</p>
            <Link
              href="/admin"
              className="inline-block mt-4 px-5 py-2 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-700 transition"
            >
              写第一篇
            </Link>
          </div>
        ) : (
          <>
            {/* Featured 区 */}
            {featured ? (
              <section>
                <FeaturedCard post={featured} />
              </section>
            ) : null}

            {/* Latest 列表 */}
            {rest.length > 0 ? (
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-px bg-gray-400" />
                    <h2 className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em]">
                      Latest · 最新
                    </h2>
                  </div>
                  <span className="text-xs text-gray-400">{rest.length} 篇</span>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {rest.map((post, idx) => (
                    <PostCard key={post.slug} post={post} index={idx} />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      posts: getAllPosts(),
    },
    revalidate: 60,
  };
};
