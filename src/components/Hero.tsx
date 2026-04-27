import { getStrings } from "@/i18n";
import type { Locale } from "@/lib/locale";

type HeroProps = {
  locale: Locale;
  postsCount: number;
};

export function Hero({ locale, postsCount }: HeroProps) {
  const t = getStrings(locale);
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-emerald-50/70 to-page dark:from-[#061a0e]/80 dark:to-page">
      {/* Ambient glow orb — positions above centre, bleeds into header */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[760px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-emerald-400/20 blur-[110px] dark:bg-emerald-500/20"
      />

      {/* Neural dot-grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgb(16_185_129/0.11)_1.5px,transparent_1.5px)] [background-size:28px_28px]"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-content flex-col items-center px-4 py-20 text-center sm:py-28">
        {/* Category badge */}
        <div className="mb-7 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700 shadow-sm backdrop-blur-sm dark:border-emerald-800/50 dark:bg-emerald-950/60 dark:text-emerald-400">
          <span aria-hidden="true" className="text-[13px]">✦</span>
          <span>IA &amp; Sucesso · América Latina</span>
        </div>

        {/* Title with gradient */}
        <h1 className="bg-gradient-to-br from-emerald-700 via-teal-500 to-emerald-400 bg-clip-text text-5xl font-black leading-[1.07] tracking-tight text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-300 sm:text-[4.5rem]">
          {t.site.name}
        </h1>

        {/* Tagline */}
        <p className="mt-5 max-w-[490px] text-base leading-relaxed text-ink-soft sm:text-lg">
          {t.site.tagline}
        </p>

        {/* Stats row */}
        <div className="mt-10 flex items-center gap-6 sm:gap-9">
          <div className="text-center">
            <p className="text-2xl font-black tabular-nums text-ink">
              {postsCount}
            </p>
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
