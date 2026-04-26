import Image from "next/image";
import { getStrings } from "@/i18n";
import type { Locale } from "@/lib/locale";

type HeroProps = {
  locale: Locale;
  postsCount: number;
};

export function Hero({ locale, postsCount }: HeroProps) {
  const t = getStrings(locale);
  return (
    <section className="border-b border-line">
      <div className="mx-auto flex max-w-content flex-col items-center px-4 py-16 text-center sm:py-24">
        <div className="h-28 w-28 overflow-hidden rounded-full ring-1 ring-line bg-surface">
          <Image
            src="/images/avatar.svg"
            alt={t.site.name}
            width={112}
            height={112}
            priority
          />
        </div>

        <h1 className="mt-7 text-3xl font-extrabold tracking-tight sm:text-[2.5rem] sm:leading-tight">
          {t.site.name}
        </h1>

        <p className="mt-1.5 text-sm text-ink-mute">{t.site.email}</p>

        <p className="mt-5 max-w-xl text-base leading-[1.7] text-ink-soft sm:text-lg">
          {t.site.tagline}
        </p>

        <p className="mt-8 text-sm text-ink-mute">
          <strong className="text-ink font-bold">{postsCount}</strong>{" "}
          {t.hero.posts}
        </p>
      </div>
    </section>
  );
}
