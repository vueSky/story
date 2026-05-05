import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTime: number; // 分钟
  wordCount: number;
}

export interface Post extends PostMeta {
  content: string;
}

function ensurePostsDir(): boolean {
  return fs.existsSync(postsDir);
}

/**
 * 中英文混排的阅读时间估算：
 *  - 中文按字数 / 400 字/分钟
 *  - 英文按词数 / 250 词/分钟
 *  - 最少 1 分钟
 */
function computeReadingStats(content: string): {
  readingTime: number;
  wordCount: number;
} {
  const chineseChars = content.match(/[\u4e00-\u9fff]/g)?.length || 0;
  const englishWords = content.match(/[a-zA-Z]+/g)?.length || 0;
  const minutes = chineseChars / 400 + englishWords / 250;
  return {
    readingTime: Math.max(1, Math.round(minutes)),
    wordCount: chineseChars + englishWords,
  };
}

function buildExcerpt(data: Record<string, unknown>, content: string): string {
  if (typeof data.excerpt === "string" && data.excerpt.trim()) {
    return data.excerpt.trim();
  }
  return content.replace(/\s+/g, " ").slice(0, 140).trim();
}

function buildTags(data: Record<string, unknown>): string[] {
  if (!Array.isArray(data.tags)) {
    return [];
  }
  return data.tags.filter((t: unknown): t is string => typeof t === "string");
}

function parseMeta(filename: string): PostMeta {
  const slug = filename.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(postsDir, filename), "utf8");
  const { data, content } = matter(raw);
  const stats = computeReadingStats(content);

  return {
    slug,
    title: typeof data.title === "string" && data.title ? data.title : slug,
    date:
      typeof data.date === "string" && data.date
        ? data.date
        : new Date().toISOString(),
    excerpt: buildExcerpt(data, content),
    tags: buildTags(data),
    readingTime: stats.readingTime,
    wordCount: stats.wordCount,
  };
}

export function getAllPosts(): PostMeta[] {
  if (!ensurePostsDir()) {
    return [];
  }

  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map(parseMeta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * 基于 tag 重叠度找相关文章；标签相同越多越靠前，
 * 标签数相同则按日期更近优先。最多返回 limit 篇。
 */
export function getRelatedPosts(slug: string, limit = 3): PostMeta[] {
  const all = getAllPosts();
  const current = all.find((p) => p.slug === slug);
  if (!current || current.tags.length === 0) {
    return all.filter((p) => p.slug !== slug).slice(0, limit);
  }
  const tagSet = new Set(current.tags);
  return all
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      score: p.tags.filter((t) => tagSet.has(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) =>
      b.score - a.score || (a.post.date < b.post.date ? 1 : -1)
    )
    .slice(0, limit)
    .map((x) => x.post);
}

export function getPostBySlug(slug: string): Post {
  const raw = fs.readFileSync(path.join(postsDir, `${slug}.md`), "utf8");
  const { data, content } = matter(raw);
  const stats = computeReadingStats(content);

  return {
    slug,
    title: typeof data.title === "string" && data.title ? data.title : slug,
    date:
      typeof data.date === "string" && data.date
        ? data.date
        : new Date().toISOString(),
    excerpt: buildExcerpt(data, content),
    tags: buildTags(data),
    readingTime: stats.readingTime,
    wordCount: stats.wordCount,
    content,
  };
}
