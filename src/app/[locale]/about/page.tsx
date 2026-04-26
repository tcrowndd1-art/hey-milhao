import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStrings } from "@/i18n";
import { isLocale } from "@/lib/locale";

const copy = {
  pt: {
    title: "Sobre",
    body: [
      "Hey Milhão é construída para a próxima geração de operadores, fundadores e construtores de produto da América Latina. Cada edição destila uma história relevante de IA, negócios ou produto em uma leitura rápida e afiada.",
      "Quer entrar em contato? Escreva para",
    ],
  },
  es: {
    title: "Acerca de",
    body: [
      "Hey Milhao está hecha para la próxima generación de operadores, fundadores y product builders de Latinoamérica. Cada edición destila una historia relevante de IA, negocios o producto en una lectura rápida y filosa.",
      "¿Quieres contactarnos? Escribe a",
    ],
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: copy[locale].title };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getStrings(locale);
  const c = copy[locale];

  return (
    <div className="prose-hey mx-auto max-w-prose px-4 py-16">
      <h1>
        {c.title} {t.site.name}
      </h1>
      <p>{t.site.description}</p>
      <p>{c.body[0]}</p>
      <p>
        {c.body[1]} <a href={`mailto:${t.site.email}`}>{t.site.email}</a>.
      </p>
    </div>
  );
}
