import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/posts";
import type { Locale } from "@/lib/locale";
import { formatDate, estimateReadMinutes } from "@/lib/format";
import { getStrings } from "@/i18n";

export function PostCard({ post, locale }: { post: Post; locale: Locale }) {
  const t = getStrings(locale);
  const { slug, frontmatter, content } = post;
  const minutes = estimateReadMinutes(content);
  return (
    <article className="group">
      <Link
        href={`/${locale}/posts/${slug}`}
        className="grid gap-5 sm:grid-cols-[1fr_240px] sm:gap-6 items-start"
      >
        <div className="order-2 sm:order-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink group-hover:text-brand-500 transition-colors">
            {frontmatter.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-ink-soft">{frontmatter.excerpt}</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-ink-mute">
            <time dateTime={frontmatter.date}>
              {formatDate(frontmatter.date, locale)}
            </time>
            <span aria-hidden="true">·</span>
            <span>
              {minutes} {t.post.minRead}
            </span>
          </div>
        </div>
        <div className="order-1 sm:order-2">
          {frontmatter.hero ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl ring-1 ring-line bg-surface">
              <Image
                src={frontmatter.hero}
                alt={frontmatter.title}
                fill
                sizes="(max-width: 640px) 100vw, 240px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          ) : (
            <div className="aspect-[16/9] w-full rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 ring-1 ring-line dark:from-brand-900 dark:to-brand-800" />
          )}
        </div>
      </Link>
    </article>
  );
}
