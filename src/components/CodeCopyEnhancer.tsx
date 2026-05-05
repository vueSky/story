import { useEffect } from "react";

export default function CodeCopyEnhancer() {
  useEffect(() => {
    const pres = document.querySelectorAll<HTMLPreElement>(".prose pre");
    const cleanups: Array<() => void> = [];

    pres.forEach((pre) => {
      if (pre.dataset.enhanced) return;
      pre.dataset.enhanced = "1";
      pre.style.position = "relative";

      const code = pre.querySelector("code");
      const lang = code
        ? Array.from(code.classList)
            .find((c) => c.startsWith("language-"))
            ?.replace("language-", "")
        : undefined;

      if (lang) {
        const tag = document.createElement("span");
        tag.textContent = lang;
        tag.className =
          "absolute top-2 left-3 text-[10px] uppercase tracking-wider text-gray-400 select-none pointer-events-none";
        pre.appendChild(tag);
      }

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "复制";
      btn.className =
        "absolute top-2 right-2 text-[11px] px-2 py-1 rounded bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition opacity-0 group-hover:opacity-100";
      pre.classList.add("group");
      const onClick = async () => {
        try {
          await navigator.clipboard.writeText(code?.innerText || "");
          btn.textContent = "已复制";
          setTimeout(() => (btn.textContent = "复制"), 1500);
        } catch {
          btn.textContent = "失败";
        }
      };
      btn.addEventListener("click", onClick);
      pre.appendChild(btn);

      cleanups.push(() => btn.removeEventListener("click", onClick));
    });

    return () => cleanups.forEach((c) => c());
  }, []);

  return null;
}
