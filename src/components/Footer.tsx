import Link from "next/link";
import { getStrings } from "@/i18n";
import type { Locale } from "@/lib/locale";

function MailIcon() {
  return (
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
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function RssIcon() {
  return (
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
      aria-hidden="true"
    >
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const t = getStrings(locale);
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line bg-surface/30">
      <div className="mx-auto max-w-content px-4 py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {/* Brand + tagline */}
          <div className="sm:col-span-1">
            <p className="text-sm font-bold text-ink">{t.site.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-mute">
              {t.site.tagline}
            </p>
          </div>

          {/* Contact + RSS */}
          <div className="sm:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
              {t.footer.contactHeading}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${t.site.email}`}
                  className="inline-flex items-center gap-2 text-ink-soft transition-colors hover:text-ink"
                >
                  <MailIcon />
                  <span>{t.site.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`/${locale}/feed.xml`}
                  className="inline-flex items-center gap-2 text-ink-soft transition-colors hover:text-ink"
                >
                  <RssIcon />
                  <span>{t.footer.feed}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Pages */}
          <div className="sm:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
              {t.footer.pagesHeading}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  {t.footer.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-line pt-6 text-center text-xs text-ink-mute">
          {t.footer.rights.replace("{year}", String(year))}
        </p>
      </div>
    </footer>
  );
}
