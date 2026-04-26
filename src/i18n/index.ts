import { pt, type Strings } from "./pt";
import { es } from "./es";
import type { Locale } from "@/lib/locale";

const dictionaries: Record<Locale, Strings> = { pt, es };

export function getStrings(locale: Locale): Strings {
  return dictionaries[locale] ?? pt;
}

export type { Strings };
