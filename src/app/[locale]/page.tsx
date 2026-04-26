import { notFound } from "next/navigation";
import { Hero } from "@/components/Hero";
import { PostList } from "@/components/PostList";
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
      <PostList locale={locale} posts={posts} />
    </>
  );
}
