import { getStrings } from "@/i18n";
import type { Locale } from "@/lib/locale";

/** Update this to your real Telegram invite link */
const TELEGRAM_URL = "https://t.me/heymilhao";
const CONTACT_EMAIL = "biznasdaq@gmail.com";

export function Community({ locale }: { locale: Locale }) {
  const t = getStrings(locale);
  return (
    <section className="mx-auto max-w-content px-4 pb-16">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-500 p-8 text-white shadow-xl sm:p-10">
        {/* Dot-grid pattern overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,white/12_1.5px,transparent_1.5px)] [background-size:24px_24px]"
        />
        {/* Glow orb */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative z-10">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
            <span aria-hidden="true">✦</span>
            {t.community.badge}
          </div>

          <h2 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">
            {t.community.heading}
          </h2>
          <p className="mt-3 max-w-lg text-base text-white/80">
            {t.community.body}
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap gap-3">
            {/* Email */}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-white/90"
            >
              {/* Envelope icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              {t.community.emailCta}
            </a>

            {/* Telegram */}
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              {/* Telegram paper-plane icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22 11 13 2 9l20-7z" />
              </svg>
              {t.community.telegramCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
