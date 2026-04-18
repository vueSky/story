import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
}

export interface Post extends PostMeta {
  content: string;
}

function ensurePostsDir(): boolean {
  return fs.existsSync(postsDir);
}

function parseMeta(filename: string): PostMeta {
  const slug = filename.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(postsDir, filename), "utf8");
  const { data, content } = matter(raw);

  const excerpt =
    typeof data.excerpt === "string" && data.excerpt.trim()
      ? data.excerpt.trim()
      : content.replace(/\s+/g, " ").slice(0, 140).trim();

  return {
    slug,
    title: typeof data.title === "string" && data.title ? data.title : slug,
    date:
      typeof data.date === "string" && data.date
        ? data.date
        : new Date().toISOString(),
    excerpt,
    tags: Array.isArray(data.tags)
      ? data.tags.filter((t: unknown): t is string => typeof t === "string")
      : undefined,
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

export function getPostBySlug(slug: string): Post {
  const raw = fs.readFileSync(path.join(postsDir, `${slug}.md`), "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: typeof data.title === "string" && data.title ? data.title : slug,
    date:
      typeof data.date === "string" && data.date
        ? data.date
        : new Date().toISOString(),
    excerpt: typeof data.excerpt === "string" ? data.excerpt : undefined,
    tags: Array.isArray(data.tags)
      ? data.tags.filter((t: unknown): t is string => typeof t === "string")
      : undefined,
    content,
  };
}
