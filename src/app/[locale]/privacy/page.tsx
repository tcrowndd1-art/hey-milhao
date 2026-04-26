import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStrings } from "@/i18n";
import { isLocale } from "@/lib/locale";

const copy = {
  pt: {
    title: "Política de Privacidade",
    intro:
      "Esta página explica como o {site} (\u201cnós\u201d, \u201cnosso\u201d ou \u201co site\u201d) lida com informações quando você visita nosso site.",
    h2_collect: "O que coletamos",
    collect_lead: "Coletamos dados mínimos e anônimos para operar o site:",
    views_li: "Contagem de leituras: contamos quantas vezes cada edição é lida. Para evitar inflar a contagem, fazemos um hash de uma via (one-way) do seu endereço IP e armazenamos apenas esse hash curto por 24 horas.",
    logs_li: "Logs padrão de servidor (endereço IP, user agent, timestamp) mantidos temporariamente para segurança e prevenção de abuso.",
    h2_cookies: "Cookies e publicidade",
    cookies_p:
      "Usamos o Google AdSense para exibir publicidade. O Google e seus parceiros podem usar cookies para servir anúncios com base em suas visitas anteriores a este e a outros sites. Você pode optar por não receber publicidade personalizada visitando ",
    h2_third: "Serviços de terceiros",
    adsense_li: "Google AdSense — publicidade.",
    upstash_li: "Upstash Redis — armazena apenas contagens anônimas de leituras.",
    vercel_li: "Vercel — hospedagem e logs padrão de servidor.",
    h2_contact: "Contato",
    contact_p: "Dúvidas? Escreva para",
  },
  es: {
    title: "Política de Privacidad",
    intro:
      "Esta página explica cómo {site} (\u201cnosotros\u201d, \u201cnuestro\u201d o \u201cel sitio\u201d) maneja la información cuando visitas nuestro sitio web.",
    h2_collect: "Qué recopilamos",
    collect_lead: "Recopilamos datos mínimos y anónimos para operar el sitio:",
    views_li: "Lecturas: contamos cuántas veces se lee cada edición. Para evitar inflar la cuenta, hashazmos en un sentido (one-way) tu dirección IP y guardamos solo ese hash corto durante 24 horas.",
    logs_li: "Registros estándar del servidor (IP, user agent, timestamp) guardados temporalmente para seguridad y prevención de abuso.",
    h2_cookies: "Cookies y publicidad",
    cookies_p:
      "Usamos Google AdSense para mostrar publicidad. Google y sus socios pueden usar cookies para servir anuncios basados en tus visitas anteriores a este y otros sitios. Puedes optar por no recibir publicidad personalizada visitando ",
    h2_third: "Servicios de terceros",
    adsense_li: "Google AdSense — publicidad.",
    upstash_li: "Upstash Redis — almacena solo conteos anónimos de lecturas.",
    vercel_li: "Vercel — hosting y registros estándar de servidor.",
    h2_contact: "Contacto",
    contact_p: "¿Preguntas? Escribe a",
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

export default async function PrivacyPage({
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
      <h1>{c.title}</h1>
      <p>{c.intro.replace("{site}", t.site.name)}</p>

      <h2>{c.h2_collect}</h2>
      <p>{c.collect_lead}</p>
      <ul>
        <li>{c.views_li}</li>
        <li>{c.logs_li}</li>
      </ul>

      <h2>{c.h2_cookies}</h2>
      <p>
        {c.cookies_p}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer">
          Google Ads Settings
        </a>
        .
      </p>

      <h2>{c.h2_third}</h2>
      <ul>
        <li>{c.adsense_li}</li>
        <li>{c.upstash_li}</li>
        <li>{c.vercel_li}</li>
      </ul>

      <h2>{c.h2_contact}</h2>
      <p>
        {c.contact_p}{" "}
        <a href={`mailto:${t.site.email}`}>{t.site.email}</a>.
      </p>
    </div>
  );
}
