import Link from "next/link";
import { getStrings } from "@/i18n";
import type { Locale } from "@/lib/locale";

export function Footer({ locale }: { locale: Locale }) {
  const t = getStrings(locale);
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-content flex-col gap-3 px-4 py-10 text-sm text-ink-mute sm:flex-row sm:items-center sm:justify-between">
        <p>{t.footer.rights.replace("{year}", String(year))}</p>
        <nav className="flex gap-4">
          <Link href={`/${locale}/about`} className="hover:text-ink">
            {t.footer.about}
          </Link>
          <Link href={`/${locale}/privacy`} className="hover:text-ink">
            {t.footer.privacy}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
