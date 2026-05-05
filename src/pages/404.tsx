import Link from "next/link";
import SEO from "@/components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="页面走丢了" description="404 - 你寻找的内容不存在" />
      <div className="py-20 md:py-28 text-center animate-fade-up">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-40 bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-300 rounded-full" />
          <h1 className="font-serif text-[8rem] md:text-[11rem] leading-none font-bold bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent select-none">
            404
          </h1>
        </div>

        <p className="font-serif text-xl md:text-2xl text-gray-800 dark:text-gray-100 mb-2">
          这里什么也没有
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
          页面可能已被移动或永远地消失在了时间的褶皱里。
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full text-sm hover:bg-gray-700 dark:hover:bg-white transition shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            回到首页
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center px-5 py-2.5 text-sm text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            写一篇
          </Link>
        </div>
      </div>
    </>
  );
}
