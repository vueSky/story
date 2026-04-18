// 动态 import 以兼容 Next.js 对 ESM-only 依赖的处理
export async function markdownToHtml(md: string): Promise<string> {
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

  return String(processed);
}
