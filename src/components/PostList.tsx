import type { Post } from "@/lib/posts";
import { PostCard } from "./PostCard";
import { AdSlot } from "./AdSlot";
import { getStrings } from "@/i18n";
import type { Locale } from "@/lib/locale";

const IN_FEED_AFTER = 2;

export function PostList({ posts, locale }: { posts: Post[]; locale: Locale }) {
  const t = getStrings(locale);
  return (
    <section className="mx-auto max-w-content px-4 py-12">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-mute">
        {t.home.latestHeading}
      </h2>
      <div className="mt-6 flex flex-col gap-2">
        {posts.map((post, idx) => (
          <div key={post.slug} className="contents">
            <PostCard post={post} locale={locale} />
            {idx === IN_FEED_AFTER && idx < posts.length - 1 ? (
              <AdSlot slot="in-feed-1" variant="in-feed" locale={locale} />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
