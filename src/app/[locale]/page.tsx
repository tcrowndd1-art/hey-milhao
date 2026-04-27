import { notFound } from "next/navigation";
import { Hero } from "@/components/Hero";
import { PostList } from "@/components/PostList";
import { AdSlot } from "@/components/AdSlot";
import { getAllPosts } from "@/lib/posts";
import { isLocale } from "@/lib/locale";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const posts = getAllPosts(locale);
  return (
    <>
      <Hero locale={locale} postsCount={posts.length} />
      <div className="mx-auto max-w-content px-4 pt-6">
        <AdSlot slot="header-home" variant="header" locale={locale} />
      </div>
      <PostList locale={locale} posts={posts} />
      <div className="mx-auto max-w-content px-4 pb-6">
        <AdSlot slot="footer-home" variant="footer" locale={locale} />
      </div>
    </>
  );
}
