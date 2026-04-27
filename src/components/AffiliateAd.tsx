import type { AffiliateAd as AdData, AffiliateGradient } from "@/data/affiliate-ads";
import type { Locale } from "@/lib/locale";

const gradientClass: Record<AffiliateGradient, string> = {
  emerald: "from-brand-500/15 via-brand-500/5 to-transparent ring-brand-500/30",
  violet: "from-violet-500/15 via-violet-500/5 to-transparent ring-violet-500/30",
  amber: "from-amber-500/15 via-amber-500/5 to-transparent ring-amber-500/30",
  blue: "from-sky-500/15 via-sky-500/5 to-transparent ring-sky-500/30",
  rose: "from-rose-500/15 via-rose-500/5 to-transparent ring-rose-500/30",
};

const gradientAccent: Record<AffiliateGradient, string> = {
  emerald: "text-brand-500 group-hover:text-brand-600",
  violet: "text-violet-500 group-hover:text-violet-600 dark:group-hover:text-violet-400",
  amber: "text-amber-600 group-hover:text-amber-500 dark:text-amber-400",
  blue: "text-sky-500 group-hover:text-sky-600 dark:group-hover:text-sky-400",
  rose: "text-rose-500 group-hover:text-rose-600 dark:group-hover:text-rose-400",
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
  const isVertical = orientation === "vertical";
  return (
    <a
      href={ad.href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`group relative block overflow-hidden rounded-2xl bg-gradient-to-br ${gradientClass[ad.gradient]} ring-1 transition-transform duration-300 hover:-translate-y-0.5 ${
        isVertical ? "p-5" : "p-5 sm:p-6"
      } ${className}`}
    >
      <span
        className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${gradientAccent[ad.gradient]}`}
      >
        {ad.badge[locale]}
      </span>
      <h3 className="mt-3 text-base font-bold tracking-tight text-ink sm:text-lg">
        {ad.title[locale]}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        {ad.description[locale]}
      </p>
      <span
        className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${gradientAccent[ad.gradient]}`}
      >
        {ad.cta[locale]}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </a>
  );
}
