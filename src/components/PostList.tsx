import type { Post } from "@/lib/posts";
import { PostCard } from "./PostCard";
import { getStrings } from "@/i18n";
import type { Locale } from "@/lib/locale";

export function PostList({ posts, locale }: { posts: Post[]; locale: Locale }) {
  const t = getStrings(locale);
  return (
    <section className="mx-auto max-w-content px-4 py-12">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-mute">
        {t.home.latestHeading}
      </h2>
      <div className="mt-6 flex flex-col gap-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>
    </section>
  );
}
