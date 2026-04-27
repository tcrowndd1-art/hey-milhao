import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { getStrings } from "@/i18n";

export function TopNav({ locale }: { locale: Locale }) {
  const t = getStrings(locale);
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-page/80 backdrop-blur-md supports-[backdrop-filter]:bg-page/60">
      <div className="mx-auto flex h-11 max-w-[88rem] items-center px-4 sm:px-6">
        <Link
          href={`/${locale}`}
          className="group inline-flex items-center gap-2.5 font-black tracking-tight"
          aria-label={t.site.name}
        >
          {/* 3D Gallery frame logo */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:scale-110"
          >
            <defs>
              <linearGradient id="gl" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>
            </defs>
            {/* Outer frame */}
            <rect x="1" y="1" width="20" height="20" rx="1.5" stroke="url(#gl)" strokeWidth="1.6" />
            {/* Inner frame */}
            <rect x="5.5" y="5.5" width="11" height="11" rx="0.5" stroke="url(#gl)" strokeWidth="1" opacity="0.6" />
            {/* Corner depth lines — 3D perspective */}
            <line x1="1" y1="1" x2="5.5" y2="5.5" stroke="url(#gl)" strokeWidth="0.9" />
            <line x1="21" y1="1" x2="16.5" y2="5.5" stroke="url(#gl)" strokeWidth="0.9" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" stroke="url(#gl)" strokeWidth="0.9" />
            <line x1="1" y1="21" x2="5.5" y2="16.5" stroke="url(#gl)" strokeWidth="0.9" />
          </svg>

          {/* Gradient site name */}
          <span className="bg-gradient-to-r from-emerald-700 via-teal-500 to-emerald-500 bg-clip-text text-sm text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-300">
            {t.site.name}
          </span>
        </Link>
      </div>
    </header>
  );
}
