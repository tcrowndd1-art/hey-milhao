import type { AffiliateAd as AdData, AffiliateGradient } from "@/data/affiliate-ads";
import type { Locale } from "@/lib/locale";

/** Emoji icon per ad id */
const AD_ICON: Record<string, string> = {
  notion: "📝",
  hotmart: "🎓",
  "amazon-br": "📚",
  beehiiv: "📨",
  cursor: "⚡",
};

/** Accent palette per gradient colour */
const ACCENT: Record<
  AffiliateGradient,
  { ring: string; icon: string; label: string; cta: string }
> = {
  emerald: {
    ring: "ring-brand-500/20 hover:ring-brand-500/50",
    icon: "bg-brand-50 dark:bg-brand-900/30",
    label: "text-brand-600 dark:text-brand-400",
    cta: "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-300 dark:hover:bg-brand-900/60",
  },
  violet: {
    ring: "ring-violet-500/20 hover:ring-violet-500/50",
    icon: "bg-violet-50 dark:bg-violet-900/30",
    label: "text-violet-600 dark:text-violet-400",
    cta: "bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-900/40 dark:text-violet-300 dark:hover:bg-violet-900/60",
  },
  amber: {
    ring: "ring-amber-500/20 hover:ring-amber-500/50",
    icon: "bg-amber-50 dark:bg-amber-900/30",
    label: "text-amber-600 dark:text-amber-400",
    cta: "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60",
  },
  blue: {
    ring: "ring-sky-500/20 hover:ring-sky-500/50",
    icon: "bg-sky-50 dark:bg-sky-900/30",
    label: "text-sky-600 dark:text-sky-400",
    cta: "bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-900/40 dark:text-sky-300 dark:hover:bg-sky-900/60",
  },
  rose: {
    ring: "ring-rose-500/20 hover:ring-rose-500/50",
    icon: "bg-rose-50 dark:bg-rose-900/30",
    label: "text-rose-600 dark:text-rose-400",
    cta: "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/60",
  },
};

type AffiliateAdProps = {
  ad: AdData;
  locale: Locale;
  orientation?: "vertical" | "horizontal";
  className?: string;
};

export function AffiliateAd({
  ad,
  locale,
  orientation = "vertical",
  className = "",
}: AffiliateAdProps) {
  const accent = ACCENT[ad.gradient];
  const icon = AD_ICON[ad.id] ?? "🔗";
  const isVertical = orientation === "vertical";

  /* ── Vertical variant (sidebar) ─────────────────────────────────── */
  if (isVertical) {
    return (
      <a
        href={ad.href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className={`group relative block rounded-2xl bg-surface p-5 ring-1 ring-inset transition-all duration-200 ${accent.ring} hover:shadow-md ${className}`}
      >
        {/* "Parceria" label */}
        <span className="absolute right-4 top-3.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-mute/50">
          Parceria
        </span>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${accent.icon}`}
          aria-hidden="true"
        >
          {icon}
        </div>

        <p className={`mt-3 text-[10px] font-bold uppercase tracking-[0.16em] ${accent.label}`}>
          {ad.badge[locale]}
        </p>
        <h3 className="mt-1 text-base font-bold leading-snug tracking-tight text-ink">
          {ad.title[locale]}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft line-clamp-3">
          {ad.description[locale]}
        </p>

        <span
          className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${accent.cta}`}
        >
          {ad.cta[locale]}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </a>
    );
  }

  /* ── Horizontal variant (in-feed, in-article, header, footer) ───── */
  return (
    <a
      href={ad.href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`group relative flex items-center gap-4 rounded-2xl bg-surface p-4 ring-1 ring-inset transition-all duration-200 sm:gap-5 sm:p-5 ${accent.ring} hover:shadow-md ${className}`}
    >
      {/* "Parceria" label */}
      <span className="absolute right-4 top-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-mute/50">
        Parceria
      </span>

      {/* Icon */}
      <div
        className={`flex-none flex h-12 w-12 items-center justify-center rounded-xl text-2xl sm:h-14 sm:w-14 sm:text-3xl ${accent.icon}`}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Copy */}
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${accent.label}`}>
          {ad.badge[locale]}
        </p>
        <h3 className="mt-0.5 truncate font-bold tracking-tight text-ink sm:text-lg">
          {ad.title[locale]}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft sm:line-clamp-2">
          {ad.description[locale]}
        </p>
      </div>

      {/* CTA button (only visible sm+) */}
      <span
        className={`hidden flex-none items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:flex ${accent.cta}`}
      >
        {ad.cta[locale]}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </a>
  );
}
