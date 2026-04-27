import { notFound } from "next/navigation";
import { Hero } from "@/components/Hero";
import { PostList } from "@/components/PostList";
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
  const viewsMap = await getManyViews(posts.map((p) => p.slug)).catch(() => ({}));

  return (
    <>
      <Hero locale={locale} postsCount={posts.length} />

      {/*
        3-column layout — same pattern as post pages:
          mobile       : single column (sidebars hidden)
          lg  (1024px) : [center | right-sidebar]
          xl  (1280px) : [left-sidebar | center | right-sidebar]
      */}
      <div className="mx-auto max-w-[88rem] px-4 pt-2">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[240px_minmax(0,1fr)_240px]">

          {/* Left gallery panel — xl+ only */}
          <aside className="hidden xl:flex xl:flex-col xl:gap-6 xl:sticky xl:top-20 xl:self-start">
            <AdSlot slot="sidebar-home-left-1" variant="sidebar" locale={locale} />
            <AdSlot slot="sidebar-home-left-2" variant="sidebar" locale={locale} />
          </aside>

          {/* Center: post list + footer ad */}
          <div className="min-w-0">
            <PostList locale={locale} posts={posts} viewsMap={viewsMap} />
            <div className="pb-8">
              <AdSlot slot="footer-home" variant="footer" locale={locale} />
            </div>
          </div>

          {/* Right gallery panel — lg+ */}
          <aside className="hidden lg:flex lg:flex-col lg:gap-6 lg:sticky lg:top-20 lg:self-start">
            <AdSlot slot="sidebar-home-right-1" variant="sidebar" locale={locale} />
            <AdSlot slot="sidebar-home-right-2" variant="sidebar" locale={locale} />
          </aside>

        </div>
      </div>
    </>
  );
}
