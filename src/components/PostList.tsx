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
      <div className="mt-6 flex flex-col divide-y divide-line">
        {posts.map((post) => (
          <div key={post.slug} className="py-8 first:pt-0 last:pb-0">
            <PostCard post={post} locale={locale} />
          </div>
        ))}
      </div>
    </section>
  );
}
