import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { getViews } from "@/lib/redis";
import { PostHeader } from "@/components/PostHeader";
import { MDXContent } from "@/components/MDXContent";
import { AdSlot } from "@/components/AdSlot";
import { PostCard } from "@/components/PostCard";
import { getStrings } from "@/i18n";
import { SUPPORTED_LOCALES, isLocale } from "@/lib/locale";

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

  return (
    <article>
      <PostHeader
        slug={slug}
        locale={locale}
        frontmatter={post.frontmatter}
        content={post.content}
        initialViews={initialViews}
      />
      <MDXContent source={post.content} />

      <div className="mx-auto max-w-prose px-4">
        <AdSlot slot="footer-1" variant="footer" />
      </div>

      {related.length > 0 ? (
        <section className="mx-auto max-w-prose px-4 pb-16 border-t border-line">
          <h2 className="mt-12 text-sm font-semibold uppercase tracking-widest text-ink-mute">
            {t.post.relatedHeading}
          </h2>
          <div className="mt-6 flex flex-col gap-12">
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
