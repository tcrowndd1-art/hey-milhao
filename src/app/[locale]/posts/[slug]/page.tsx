import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { getViews } from "@/lib/redis";
import { extractToc } from "@/lib/toc";
import { PostHeader } from "@/components/PostHeader";
import { MDXContent } from "@/components/MDXContent";
import { AdSlot } from "@/components/AdSlot";
import { PostCard } from "@/components/PostCard";
import { TableOfContents } from "@/components/TableOfContents";
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
  const initialViews = await getViews(slug);
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

      <div className="mx-auto max-w-content px-4 py-10">
        <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <TableOfContents items={toc} label={tocLabel[locale]} />
          <div className="min-w-0">
            <MDXContent source={post.content} />
            <div className="mt-10">
              <AdSlot slot="footer-1" variant="footer" />
            </div>
          </div>
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
