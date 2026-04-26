export const SUPPORTED_LOCALES = ["pt", "es"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt";

export const SPANISH_COUNTRIES = new Set([
  "ES",
  "MX",
  "AR",
  "CO",
  "CL",
  "PE",
  "VE",
  "EC",
  "GT",
  "CU",
  "BO",
  "DO",
  "HN",
  "PY",
  "NI",
  "SV",
  "CR",
  "PA",
  "UY",
  "PR",
]);

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function pickLocaleFromCountry(country: string | undefined | null): Locale {
  if (!country) return DEFAULT_LOCALE;
  return SPANISH_COUNTRIES.has(country.toUpperCase()) ? "es" : "pt";
}
