import Image from "next/image";
import Link from "next/link";
import type { PostFrontmatter } from "@/lib/posts";
import { ViewCounter } from "./ViewCounter";
import { formatDate, estimateReadMinutes } from "@/lib/format";
import { getStrings } from "@/i18n";
import type { Locale } from "@/lib/locale";

type PostHeaderProps = {
  slug: string;
  locale: Locale;
  frontmatter: PostFrontmatter;
  content: string;
  initialViews: number;
};

export function PostHeader({
  slug,
  locale,
  frontmatter,
  content,
  initialViews,
}: PostHeaderProps) {
  const t = getStrings(locale);
  const minutes = estimateReadMinutes(content);
  return (
    <header className="mx-auto max-w-prose px-4 pt-10">
      <Link href={`/${locale}`} className="text-sm text-ink-mute hover:text-ink">
        {t.post.backToHome}
      </Link>
      <h1 className="mt-6 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
        {frontmatter.title}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-mute">
        <span className="font-medium text-ink-soft">{t.site.name}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={frontmatter.date}>{formatDate(frontmatter.date, locale)}</time>
        <span aria-hidden="true">·</span>
        <span>
          {minutes} {t.post.minRead}
        </span>
        <span aria-hidden="true">·</span>
        <ViewCounter slug={slug} initial={initialViews} viewsLabel={t.post.views} />
      </div>
      {frontmatter.hero ? (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl ring-1 ring-line">
          <Image
            src={frontmatter.hero}
            alt={frontmatter.title}
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover"
            priority
          />
        </div>
      ) : null}
    </header>
  );
}
