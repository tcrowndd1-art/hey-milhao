import Image from "next/image";
import { getStrings } from "@/i18n";
import type { Locale } from "@/lib/locale";

/**
 * ── 프로필 사진 교체 방법 ──────────────────────────────────────────
 * 1. 사진 파일을 public/images/ 폴더에 넣기  (예: author.jpg)
 * 2. 아래 AUTHOR_IMG 경로를 "/images/author.jpg" 로 변경
 */
const AUTHOR_IMG = "/images/author.svg";

const TELEGRAM_URL = "https://t.me/heymilhao";
const CONTACT_EMAIL = "biznasdaq@gmail.com";

type HeroProps = { locale: Locale; postsCount: number };

export function Hero({ locale, postsCount }: HeroProps) {
  const t = getStrings(locale);
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-emerald-50/60 to-page dark:from-[#061a0e]/80 dark:to-page">
      {/* Glow orb */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[440px] w-[680px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-emerald-400/20 blur-[100px] dark:bg-emerald-500/20" />
      {/* Dot grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgb(16_185_129/0.10)_1.5px,transparent_1.5px)] [background-size:28px_28px]" />

      <div className="relative z-10 mx-auto max-w-content px-6 py-14 sm:py-20">
        {/* ── Horizontal card: photo LEFT · text RIGHT ─────────── */}
        <div className="flex flex-col items-center gap-7 text-center sm:flex-row sm:items-center sm:gap-10 sm:text-left">

          {/* Photo */}
          <div className="relative flex-none">
            <div className="h-[108px] w-[108px] overflow-hidden rounded-full ring-4 ring-brand-500/30 shadow-xl shadow-brand-500/10 dark:ring-brand-400/30 sm:h-[120px] sm:w-[120px]">
              <Image
                src={AUTHOR_IMG}
                alt={t.site.name}
                width={120}
                height={120}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            {/* Online dot */}
            <span aria-hidden="true" className="absolute bottom-1.5 right-1.5 block h-4 w-4 rounded-full bg-brand-400 ring-2 ring-white dark:ring-[#0b0d10]" />
          </div>

          {/* Text block */}
          <div className="min-w-0 flex-1">
            {/* Site name */}
            <h1 className="bg-gradient-to-br from-emerald-700 via-teal-500 to-emerald-400 bg-clip-text text-4xl font-black leading-tight tracking-tight text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-300 sm:text-5xl">
              {t.site.name}
            </h1>

            {/* Badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700 shadow-sm backdrop-blur-sm dark:border-emerald-800/50 dark:bg-emerald-950/60 dark:text-emerald-400">
              <span aria-hidden="true">✦</span>
              <span>IA · Negócios · Sucesso</span>
            </div>

            {/* Community heading */}
            <p className="mt-4 text-base font-bold tracking-tight text-ink sm:text-lg">
              {t.community.heading}
            </p>

            {/* Body */}
            <p className="mt-1.5 max-w-[460px] text-sm leading-relaxed text-ink-soft sm:text-base">
              {t.community.body}
            </p>

            {/* CTAs */}
            <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-teal-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                {t.community.emailCta}
              </a>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-brand-500/35 bg-white/70 px-5 py-2.5 text-sm font-semibold text-brand-700 backdrop-blur-sm transition-colors hover:bg-brand-50 dark:border-brand-500/30 dark:bg-brand-950/40 dark:text-brand-300 dark:hover:bg-brand-950/60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/></svg>
                {t.community.telegramCta}
              </a>
            </div>

            {/* Stats */}
            <div className="mt-6 flex items-center justify-center gap-6 sm:justify-start sm:gap-8">
              <div className="text-center sm:text-left">
                <p className="text-xl font-black tabular-nums text-ink">{postsCount}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-mute">{t.hero.posts}</p>
              </div>
              <div className="h-7 w-px bg-line" />
              <div className="text-center sm:text-left">
                <p className="text-xl font-black text-brand-500">2×</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-mute">{t.hero.frequency}</p>
              </div>
              <div className="h-7 w-px bg-line" />
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-ink">🌎</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-mute">{t.hero.region}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
