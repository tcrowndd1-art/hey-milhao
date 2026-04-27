import { notFound } from "next/navigation";
import { Hero } from "@/components/Hero";
import { PostList } from "@/components/PostList";
import { Community } from "@/components/Community";
import { AdSlot } from "@/components/AdSlot";
import { getAllPosts } from "@/lib/posts";
import { getManyViews } from "@/lib/redis";
import { isLocale } from "@/lib/locale";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const posts = getAllPosts(locale);

  // Batch-fetch view counts for all posts (best-effort — falls back to empty map)
  const viewsMap = await getManyViews(posts.map((p) => p.slug)).catch(() => ({}));

  return (
    <>
      <Hero locale={locale} postsCount={posts.length} />
      <div className="mx-auto max-w-content px-4 pt-6">
        <AdSlot slot="header-home" variant="header" locale={locale} />
      </div>
      <PostList locale={locale} posts={posts} viewsMap={viewsMap} />
      <Community locale={locale} />
      <div className="mx-auto max-w-content px-4 pb-6">
        <AdSlot slot="footer-home" variant="footer" locale={locale} />
      </div>
    </>
  );
}
