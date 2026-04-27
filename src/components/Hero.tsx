import { getStrings } from "@/i18n";
import type { Locale } from "@/lib/locale";

/** Update to your real Telegram invite link */
const TELEGRAM_URL = "https://t.me/heymilhao";
const CONTACT_EMAIL = "biznasdaq@gmail.com";

type HeroProps = {
  locale: Locale;
  postsCount: number;
};

export function Hero({ locale, postsCount }: HeroProps) {
  const t = getStrings(locale);
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-emerald-50/70 to-page dark:from-[#061a0e]/80 dark:to-page">
      {/* Ambient glow orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-emerald-400/20 blur-[110px] dark:bg-emerald-500/20"
      />

      {/* Neural dot-grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgb(16_185_129/0.11)_1.5px,transparent_1.5px)] [background-size:28px_28px]"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-content flex-col items-center px-4 py-20 text-center sm:py-28">

        {/* Badge */}
        <div className="mb-7 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700 shadow-sm backdrop-blur-sm dark:border-emerald-800/50 dark:bg-emerald-950/60 dark:text-emerald-400">
          <span aria-hidden="true" className="text-[13px]">✦</span>
          <span>{t.community.badge} · IA &amp; Sucesso</span>
        </div>

        {/* Title */}
        <h1 className="bg-gradient-to-br from-emerald-700 via-teal-500 to-emerald-400 bg-clip-text text-5xl font-black leading-[1.07] tracking-tight text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-300 sm:text-[4.5rem]">
          {t.site.name}
        </h1>

        {/* Community headline */}
        <p className="mt-4 text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {t.community.heading}
        </p>

        {/* Community body */}
        <p className="mt-3 max-w-[500px] text-base leading-relaxed text-ink-soft sm:text-lg">
          {t.community.body}
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-teal-400 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
          >
            {/* Envelope */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            {t.community.emailCta}
          </a>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-white/70 px-6 py-2.5 text-sm font-semibold text-brand-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-brand-50 dark:border-brand-500/30 dark:bg-brand-950/40 dark:text-brand-300 dark:hover:bg-brand-950/60"
          >
            {/* Paper plane */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9l20-7z" />
            </svg>
            {t.community.telegramCta}
          </a>
        </div>

        {/* Stats row — trust indicators */}
        <div className="mt-10 flex items-center gap-6 sm:gap-9">
          <div className="text-center">
            <p className="text-2xl font-black tabular-nums text-ink">{postsCount}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-ink-mute">
              {t.hero.posts}
            </p>
          </div>

          <div className="h-9 w-px bg-line" />

          <div className="text-center">
            <p className="text-2xl font-black text-brand-500">2×</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-ink-mute">
              {t.hero.frequency}
            </p>
          </div>

          <div className="h-9 w-px bg-line" />

          <div className="text-center">
            <p className="text-xl font-black text-ink">🌎</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-ink-mute">
              {t.hero.region}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
