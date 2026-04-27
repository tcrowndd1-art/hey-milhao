import type { Locale } from "@/lib/locale";

export type Localized = Record<Locale, string>;

export type AffiliateGradient =
  | "emerald"
  | "violet"
  | "amber"
  | "blue"
  | "rose";

export type AffiliateAd = {
  id: string;
  badge: Localized;
  title: Localized;
  description: Localized;
  cta: Localized;
  href: string;
  gradient: AffiliateGradient;
};

/**
 * Affiliate ad pool.
 *
 * Replace each `href` with your real affiliate link after signing up:
 *   1. Notion             → https://www.notion.so/affiliates
 *   2. Hotmart            → https://www.hotmart.com (Programa de Afiliados)
 *   3. Amazon Brasil      → https://associados.amazon.com.br
 *   4. Beehiiv            → https://www.beehiiv.com/partners
 *   5. Cursor             → https://cursor.com (referral program when available)
 *
 * Until then, links go to the official sites with a `?ref=heymilhao` placeholder.
 */
export const AFFILIATE_ADS: AffiliateAd[] = [
  {
    id: "notion",
    badge: { pt: "Patrocinado", es: "Patrocinado" },
    title: {
      pt: "Notion para fundadores",
      es: "Notion para fundadores",
    },
    description: {
      pt: "Centralize wikis, projetos e docs. Plano gratuito generoso e versão IA poderosa.",
      es: "Centraliza wikis, proyectos y docs. Plan gratuito generoso y una versión IA potente.",
    },
    cta: { pt: "Começar grátis", es: "Empezar gratis" },
    href: "https://www.notion.so/?ref=heymilhao",
    gradient: "violet",
  },
  {
    id: "hotmart",
    badge: { pt: "Patrocinado", es: "Patrocinado" },
    title: {
      pt: "Hotmart — venda seu conhecimento",
      es: "Hotmart — vende tu conocimiento",
    },
    description: {
      pt: "Plataforma latina nº 1 para cursos online, ebooks e mentorias. Comissão recorrente.",
      es: "Plataforma latina nº 1 para cursos online, ebooks y mentorías. Comisión recurrente.",
    },
    cta: { pt: "Conhecer", es: "Conocer" },
    href: "https://www.hotmart.com/?ref=heymilhao",
    gradient: "amber",
  },
  {
    id: "amazon-br",
    badge: { pt: "Patrocinado", es: "Patrocinado" },
    title: {
      pt: "Os livros que citamos",
      es: "Los libros que citamos",
    },
    description: {
      pt: "Os títulos sobre IA, produto e estratégia mencionados nas nossas edições, em um clique.",
      es: "Los títulos sobre IA, producto y estrategia mencionados en nuestras ediciones, a un clic.",
    },
    cta: { pt: "Ver lista", es: "Ver lista" },
    href: "https://www.amazon.com.br/?tag=heymilhao-20",
    gradient: "rose",
  },
  {
    id: "beehiiv",
    badge: { pt: "Patrocinado", es: "Patrocinado" },
    title: {
      pt: "Beehiiv — newsletter sem dor",
      es: "Beehiiv — newsletter sin dolor",
    },
    description: {
      pt: "A plataforma usada por operadores latinos para escalar de 0 a 50k assinantes.",
      es: "La plataforma usada por operadores latinos para escalar de 0 a 50k suscriptores.",
    },
    cta: { pt: "Testar grátis", es: "Probar gratis" },
    href: "https://www.beehiiv.com/?via=heymilhao",
    gradient: "emerald",
  },
  {
    id: "cursor",
    badge: { pt: "Patrocinado", es: "Patrocinado" },
    title: {
      pt: "Cursor — código com IA",
      es: "Cursor — código con IA",
    },
    description: {
      pt: "O editor que dobrou a produtividade da maioria dos devs LatAm em 2026.",
      es: "El editor que duplicó la productividad de la mayoría de los devs LatAm en 2026.",
    },
    cta: { pt: "Baixar", es: "Descargar" },
    href: "https://cursor.com/?ref=heymilhao",
    gradient: "blue",
  },
];

/**
 * Pseudo-random rotation. Uses slug + slot id as seed so the same page
 * shows different ads in different slots, but the choice is deterministic
 * within a single render (no hydration mismatch).
 */
export function pickAds(seed: string, count: number): AffiliateAd[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const ads = [...AFFILIATE_ADS];
  // Fisher–Yates with seeded RNG
  let state = hash || 1;
  for (let i = ads.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [ads[i], ads[j]] = [ads[j], ads[i]];
  }
  return ads.slice(0, Math.min(count, ads.length));
}

export function pickAd(seed: string): AffiliateAd {
  return pickAds(seed, 1)[0];
}
