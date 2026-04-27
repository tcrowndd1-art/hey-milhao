import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { getViews, getComments } from "@/lib/redis";
import { extractToc } from "@/lib/toc";
import { PostHeader } from "@/components/PostHeader";
import { MDXContent } from "@/components/MDXContent";
import { AdSlot } from "@/components/AdSlot";
import { PostCard } from "@/components/PostCard";
import { TableOfContents } from "@/components/TableOfContents";
import { CommentSection } from "@/components/CommentSection";
import { getStrings } from "@/i18n";
import { SUPPORTED_LOCALES, isLocale } from "@/lib/locale";

const tocLabel = {
  pt: "Neste texto",
  es: "En este texto",
} as const;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    getAllPostSlugs(locale).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const post = getPostBySlug(locale, slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      type: "article",
      publishedTime: post.frontmatter.date,
      images: post.frontmatter.hero ? [{ url: post.frontmatter.hero }] : undefined,
    },
    alternates: { canonical: `/${locale}/posts/${slug}` },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const post = getPostBySlug(locale, slug);
  if (!post) notFound();

  const t = getStrings(locale);
  const [initialViews, initialComments] = await Promise.all([
    getViews(slug),
    getComments(slug),
  ]);
  const related = getRelatedPosts(locale, slug);
  const toc = extractToc(post.content);

  return (
    <article>
      <PostHeader
        slug={slug}
        locale={locale}
        frontmatter={post.frontmatter}
        content={post.content}
        initialViews={initialViews}
      />

      {/*
        3-col: [TOC 260px | prose | ads 240px]
        mobile: single column (inline TOC above content)
        lg+   : left TOC sticky + content + right gallery ads
      */}
      <div className="mx-auto max-w-[88rem] px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)_240px] lg:gap-10">

          {/* Left — TOC sidebar (lg+) */}
          <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pr-2">
            <TableOfContents
              items={toc}
              label={tocLabel[locale]}
              variant="sidebar"
            />
          </aside>

          {/* Centre — article content */}
          <div className="min-w-0 mx-auto w-full max-w-prose">
            {/* Inline TOC for mobile only */}
            <div className="lg:hidden">
              <TableOfContents
                items={toc}
                label={tocLabel[locale]}
                variant="inline"
              />
            </div>

            <MDXContent source={post.content} />

            <CommentSection
              slug={slug}
              locale={locale}
              initialComments={initialComments}
            />

            <div className="mt-10">
              <AdSlot slot="footer-post" variant="footer" locale={locale} />
            </div>
          </div>

          {/* Right — gallery ad panels (lg+) */}
          <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start lg:space-y-6">
            <AdSlot slot="sidebar-right-1" variant="sidebar" locale={locale} />
            <AdSlot slot="sidebar-right-2" variant="sidebar" locale={locale} />
          </aside>

        </div>
      </div>

      {related.length > 0 ? (
        <section className="mx-auto max-w-content px-4 pb-16 border-t border-line">
          <h2 className="mt-12 text-sm font-semibold uppercase tracking-widest text-ink-mute">
            {t.post.relatedHeading}
          </h2>
          <div className="mt-6 flex flex-col gap-2">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} locale={locale} />
            ))}
          </div>
          <div className="mt-10">
            <Link href={`/${locale}`} className="text-brand-500 hover:underline">
              {t.post.backToHome}
            </Link>
          </div>
        </section>
      ) : null}
    </article>
  );
}
