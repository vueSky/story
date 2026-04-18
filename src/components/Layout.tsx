import Link from "next/link";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight hover:text-blue-600 transition"
          >
            My Blog
          </Link>
          <nav className="flex gap-5 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition">
              首页
            </Link>
            <Link href="/admin" className="hover:text-gray-900 transition">
              写作
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-6 text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} My Blog · Powered by Next.js
        </div>
      </footer>
    </div>
  );
}
