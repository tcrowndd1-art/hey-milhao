import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Locale } from "./locale";

const POSTS_BASE = path.join(process.cwd(), "content", "posts");

function postsDir(locale: Locale): string {
  return path.join(POSTS_BASE, locale);
}

export type PostFrontmatter = {
  title: string;
  date: string;
  excerpt: string;
  hero?: string;
  locale?: string;
  category?: string;
};

export type Post = {
  slug: string;
  locale: Locale;
  frontmatter: PostFrontmatter;
  content: string;
};

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function getAllPostSlugs(locale: Locale): string[] {
  const dir = postsDir(locale);
  ensureDir(dir);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostBySlug(locale: Locale, slug: string): Post | null {
  const fullPath = path.join(postsDir(locale), `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;
  const file = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(file);
  const fm = data as Partial<PostFrontmatter>;
  if (!fm.title || !fm.date || !fm.excerpt) {
    throw new Error(
      `Post ${locale}/${slug}.mdx missing required frontmatter (title/date/excerpt).`,
    );
  }
  return {
    slug,
    locale,
    frontmatter: {
      title: fm.title,
      date: fm.date,
      excerpt: fm.excerpt,
      hero: fm.hero,
      locale: fm.locale ?? locale,
      category: fm.category,
    },
    content,
  };
}

export function getAllPosts(locale: Locale): Post[] {
  return getAllPostSlugs(locale)
    .map((slug) => getPostBySlug(locale, slug))
    .filter((p): p is Post => p !== null)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime(),
    );
}

export function getRelatedPosts(locale: Locale, currentSlug: string, limit = 2): Post[] {
  return getAllPosts(locale)
    .filter((p) => p.slug !== currentSlug)
    .slice(0, limit);
}
