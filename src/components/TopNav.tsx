import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { getStrings } from "@/i18n";
import type { Locale } from "@/lib/locale";

export function TopNav({ locale }: { locale: Locale }) {
  const t = getStrings(locale);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur supports-[backdrop-filter]:bg-page/70">
      <div className="mx-auto flex h-14 max-w-content items-center justify-between px-4 sm:px-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 font-black tracking-tight"
          aria-label={t.site.name}
        >
          {/* Sparkle icon in brand gradient */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#nav-grad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="nav-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>
            </defs>
            <path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
          </svg>

          {/* Gradient text logo */}
          <span className="bg-gradient-to-r from-emerald-700 via-teal-500 to-emerald-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-300">
            {t.site.name}
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle ariaLabel={t.nav.toggleTheme} />
        </div>
      </div>
    </header>
  );
}
