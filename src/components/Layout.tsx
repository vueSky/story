import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-gray-900 texture-noise">
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 text-white text-sm font-serif shadow-sm group-hover:rotate-6 transition-transform duration-300">
              M
            </span>
            <span className="font-serif">My Blog</span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            {[
              { href: "/", label: "首页" },
              { href: "/admin", label: "写作" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  isActive(item.href)
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 md:py-16">
        {children}
      </main>

      <footer className="border-t border-gray-200/60 bg-white/50">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            <span>Crafted with Next.js & Markdown</span>
            <span className="w-1 h-1 rounded-full bg-gray-400" />
          </div>
          <div>© {new Date().getFullYear()} My Blog</div>
        </div>
      </footer>
    </div>
  );
}
