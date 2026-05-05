import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/markdown";

interface Props {
  items: TocItem[];
}

export default function Toc({ items }: Props) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0.1 }
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <aside
      aria-label="文章目录"
      className="hidden xl:block fixed top-28 right-[max(1.5rem,calc((100vw-48rem)/2-18rem))] w-56 max-h-[70vh] overflow-y-auto pr-2"
    >
      <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
        <span className="w-4 h-px bg-gray-300 dark:bg-gray-700" />
        On this page
      </div>
      <ul className="space-y-1.5 text-sm border-l border-gray-200/80 dark:border-gray-800/80">
        {items.map((it) => {
          const active = activeId === it.id;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className={`block py-0.5 -ml-px border-l-2 transition-colors ${
                  it.level === 3 ? "pl-6" : "pl-3"
                } ${
                  active
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                {it.text}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
