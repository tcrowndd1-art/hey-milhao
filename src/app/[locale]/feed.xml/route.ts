import { getAllPosts } from "@/lib/posts";
import { getStrings } from "@/i18n";
import { isLocale } from "@/lib/locale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
    }
    return c;
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return new Response("Not found", { status: 404 });
  }

  const t = getStrings(locale);
  const posts = getAllPosts(locale);
  const feedUrl = `${SITE_URL}/${locale}/feed.xml`;
  const homeUrl = `${SITE_URL}/${locale}`;

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/${locale}/posts/${p.slug}`;
      const pub = new Date(p.frontmatter.date).toUTCString();
      return `    <item>
      <title>${escapeXml(p.frontmatter.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(p.frontmatter.excerpt)}</description>
      <pubDate>${pub}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(t.site.name)}</title>
    <link>${homeUrl}</link>
    <description>${escapeXml(t.site.description)}</description>
    <language>${locale === "pt" ? "pt-BR" : "es"}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
