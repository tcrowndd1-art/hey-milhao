import type { AffiliateAd as AdData, AffiliateGradient } from "@/data/affiliate-ads";
import type { Locale } from "@/lib/locale";

/* ─── Icons ─────────────────────────────────────────────────────── */
const AD_ICON: Record<string, string> = {
  notion: "📝",
  hotmart: "🎓",
  "amazon-br": "📚",
  beehiiv: "📨",
  cursor: "⚡",
};

/* ─── Gallery canvas palette per gradient ───────────────────────── */
const CANVAS: Record<
  AffiliateGradient,
  { bg: string; orb1: string; orb2: string; accent: string }
> = {
  emerald: {
    bg: "from-emerald-950 via-[#064232] to-teal-900",
    orb1: "bg-emerald-400/25 blur-3xl h-36 w-36 -top-8 -left-8",
    orb2: "bg-teal-300/15 blur-[80px] h-48 w-48 -bottom-12 -right-8",
    accent: "text-emerald-300",
  },
  violet: {
    bg: "from-violet-950 via-[#1e0a3c] to-purple-900",
    orb1: "bg-violet-400/25 blur-3xl h-36 w-36 -top-8 -right-8",
    orb2: "bg-fuchsia-300/15 blur-[80px] h-48 w-48 -bottom-12 -left-4",
    accent: "text-violet-300",
  },
  amber: {
    bg: "from-amber-950 via-[#3b1f00] to-orange-900",
    orb1: "bg-amber-400/25 blur-3xl h-36 w-36 -top-8 left-4",
    orb2: "bg-yellow-300/15 blur-[80px] h-48 w-48 -bottom-12 -right-4",
    accent: "text-amber-300",
  },
  blue: {
    bg: "from-blue-950 via-[#0a1e3c] to-sky-900",
    orb1: "bg-sky-400/25 blur-3xl h-36 w-36 -top-8 -right-8",
    orb2: "bg-blue-300/15 blur-[80px] h-48 w-48 -bottom-12 -left-4",
    accent: "text-sky-300",
  },
  rose: {
    bg: "from-rose-950 via-[#2a0a14] to-pink-900",
    orb1: "bg-rose-400/25 blur-3xl h-36 w-36 -top-8 -left-8",
    orb2: "bg-pink-300/15 blur-[80px] h-48 w-48 -bottom-12 -right-4",
    accent: "text-rose-300",
  },
};

/* ─── Horizontal accent (in-feed / article / header / footer) ───── */
const H_ACCENT: Record<AffiliateGradient, { ring: string; label: string; cta: string }> = {
  emerald: {
    ring: "ring-brand-500/20 hover:ring-brand-500/50",
    label: "text-brand-600 dark:text-brand-400",
    cta: "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-300 dark:hover:bg-brand-900/60",
  },
  violet: {
    ring: "ring-violet-500/20 hover:ring-violet-500/50",
    label: "text-violet-600 dark:text-violet-400",
    cta: "bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-900/40 dark:text-violet-300 dark:hover:bg-violet-900/60",
  },
  amber: {
    ring: "ring-amber-500/20 hover:ring-amber-500/50",
    label: "text-amber-600 dark:text-amber-400",
    cta: "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60",
  },
  blue: {
    ring: "ring-sky-500/20 hover:ring-sky-500/50",
    label: "text-sky-600 dark:text-sky-400",
    cta: "bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-900/40 dark:text-sky-300 dark:hover:bg-sky-900/60",
  },
  rose: {
    ring: "ring-rose-500/20 hover:ring-rose-500/50",
    label: "text-rose-600 dark:text-rose-400",
    cta: "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/60",
  },
};

/** Deterministic "catalog №" from ad id */
function catalogNo(id: string): string {
  const n = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return String((n % 99) + 1).padStart(2, "0");
}

/* ─── Props ──────────────────────────────────────────────────────── */
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
  const icon = AD_ICON[ad.id] ?? "🔗";
  const no = catalogNo(ad.id);

  /* ── GALLERY PANEL (sidebar / vertical) ─────────────────────────── */
  if (orientation === "vertical") {
    const c = CANVAS[ad.gradient];
    return (
      <a
        href={ad.href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className={`group block overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/10 transition-all duration-300 hover:shadow-2xl hover:ring-white/20 ${className}`}
      >
        {/* ── Canvas — the "artwork" ─────────────────────────────── */}
        <div
          className={`relative h-52 overflow-hidden bg-gradient-to-br ${c.bg}`}
        >
          {/* Fine grid texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:22px_22px]"
          />

          {/* Glow orb 1 */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute rounded-full ${c.orb1}`}
          />
          {/* Glow orb 2 */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute rounded-full ${c.orb2}`}
          />

          {/* Centred icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-5xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110"
              aria-hidden="true"
            >
              {icon}
            </span>
          </div>

          {/* Catalog number — bottom right, gallery label style */}
          <span className="absolute bottom-3 right-3.5 font-mono text-[9px] tracking-[0.22em] text-white/30 select-none">
            № {no}
          </span>

          {/* Bottom fade into content */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/30 to-transparent"
          />
        </div>

        {/* ── Content panel ──────────────────────────────────────── */}
        <div className="bg-[#0e0f11] px-5 py-4 dark:bg-[#0e0f11]">
          <p
            className={`text-[9px] font-bold uppercase tracking-[0.22em] ${c.accent} opacity-70`}
          >
            {ad.badge[locale]}
          </p>

          <h3 className="mt-1.5 text-sm font-bold leading-snug tracking-tight text-white/90">
            {ad.title[locale]}
          </h3>

          <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-white/50">
            {ad.description[locale]}
          </p>

          <span
            className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold ${c.accent} transition-opacity group-hover:opacity-100 opacity-70`}
          >
            {ad.cta[locale]}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </div>
      </a>
    );
  }

  /* ── HORIZONTAL STRIP (in-feed / in-article / header / footer) ─── */
  const h = H_ACCENT[ad.gradient];
  return (
    <a
      href={ad.href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`group relative flex items-center gap-4 rounded-2xl bg-surface p-4 ring-1 ring-inset transition-all duration-200 sm:gap-5 sm:p-5 ${h.ring} hover:shadow-md ${className}`}
    >
      <span className="absolute right-4 top-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-mute/40">
        Parceria
      </span>

      {/* Icon */}
      <div
        className="flex-none flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-2xl sm:h-14 sm:w-14 sm:text-3xl ring-1 ring-line"
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Copy */}
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${h.label}`}>
          {ad.badge[locale]}
        </p>
        <h3 className="mt-0.5 truncate font-bold tracking-tight text-ink sm:text-lg">
          {ad.title[locale]}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft sm:line-clamp-2">
          {ad.description[locale]}
        </p>
      </div>

      {/* CTA */}
      <span
        className={`hidden flex-none items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:flex ${h.cta}`}
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
