import type { Locale } from "./locale";

export function formatCount(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1_000_000) {
    const v = n / 1000;
    return v >= 10 ? `${Math.round(v)}k` : `${v.toFixed(1)}k`;
  }
  const v = n / 1_000_000;
  return v >= 10 ? `${Math.round(v)}M` : `${v.toFixed(1)}M`;
}

const LOCALE_TAG: Record<Locale, string> = {
  pt: "pt-BR",
  es: "es-419",
};

export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  return d.toLocaleDateString(LOCALE_TAG[locale] ?? "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function estimateReadMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
