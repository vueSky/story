import slugify from "slugify";

export interface TocItem {
  id: string;
  text: string;
  level: number; // 2 | 3
}

export interface MarkdownResult {
  html: string;
  toc: TocItem[];
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function makeSlug(text: string, used: Set<string>): string {
  const base =
    slugify(text, { lower: true, strict: true, locale: "zh" }) ||
    `section-${used.size + 1}`;
  let id = base;
  let i = 2;
  while (used.has(id)) {
    id = `${base}-${i++}`;
  }
  used.add(id);
  return id;
}

/**
 * 外链统一加 target="_blank" + rel + ↗ 标记
 */
function enhanceExternalLinks(html: string): string {
  return html.replace(
    /<a\s+([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>([\s\S]*?)<\/a>/g,
    (_m, pre: string, href: string, post: string, inner: string) => {
      const attrs = `${pre} ${post}`.trim();
      const hasTarget = /target=/.test(attrs);
      const hasRel = /rel=/.test(attrs);
      const t = hasTarget ? "" : ' target="_blank"';
      const r = hasRel ? "" : ' rel="noopener noreferrer"';
      return `<a ${attrs} href="${href}"${t}${r} data-external="1">${inner}<svg class="inline-block w-3 h-3 ml-0.5 -mt-0.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></a>`;
    }
  );
}

function injectHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();
  const out = html.replace(
    /<h([23])>([\s\S]*?)<\/h\1>/g,
    (_match, levelStr: string, inner: string) => {
      const level = Number(levelStr);
      const text = stripTags(inner);
      const id = makeSlug(text, used);
      toc.push({ id, text, level });
      return `<h${level} id="${id}"><a class="anchor" href="#${id}" aria-label="${text}">#</a>${inner}</h${level}>`;
    }
  );
  return { html: out, toc };
}

export async function markdownToHtml(md: string): Promise<MarkdownResult> {
  const { unified } = await import("unified");
  const remarkParse = (await import("remark-parse")).default;
  const remarkGfm = (await import("remark-gfm")).default;
  const remarkRehype = (await import("remark-rehype")).default;
  const rehypeHighlight = (await import("rehype-highlight")).default;
  const rehypeStringify = (await import("rehype-stringify")).default;

  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight, { detect: true, ignoreMissing: true })
    .use(rehypeStringify)
    .process(md);

  const withLinks = enhanceExternalLinks(String(processed));
  return injectHeadingIds(withLinks);
}
