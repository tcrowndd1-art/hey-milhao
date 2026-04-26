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
          className="inline-flex items-center gap-2 font-bold tracking-tight text-ink"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand-500"
            aria-hidden="true"
          >
            <path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
          </svg>
          <span>{t.site.name}</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle ariaLabel={t.nav.toggleTheme} />
        </div>
      </div>
    </header>
  );
}
