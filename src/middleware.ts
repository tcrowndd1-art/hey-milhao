import { NextResponse, type NextRequest } from "next/server";
import { SUPPORTED_LOCALES, pickLocaleFromCountry } from "@/lib/locale";

const STATIC_PREFIXES = ["/api", "/_next", "/sitemap", "/robots", "/images", "/favicon"];

function pathHasLocale(pathname: string): boolean {
  return SUPPORTED_LOCALES.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`),
  );
}

function isStaticPath(pathname: string): boolean {
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (pathname.includes(".")) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isStaticPath(pathname)) return;
  if (pathHasLocale(pathname)) return;

  const country =
    req.headers.get("x-vercel-ip-country") ??
    (req as unknown as { geo?: { country?: string } }).geo?.country ??
    null;
  const locale = pickLocaleFromCountry(country);

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/((?!_next|api).*)"],
};
