# Hey Milhao — Requirements (하네스 1단계)

> **Source of truth for what we are building and what we are NOT building.**
> Every later doc and code change must be consistent with this file.

## Project Identity

- **Name**: Hey Milhao
- **Reference design**: https://maily.so/josh
- **Target market**: Latin America (LATAM)
- **V1 language**: English only. i18n-ready structure (es / pt added later without refactor).
- **Type**: Static newsletter-style blog with view counters and Google AdSense.

## In Scope (V1 — what we build now)

1. Home / profile page in maily.so/josh layout (hero + post list).
2. Individual post pages (MDX content, view counter, ad slots).
3. Per-post view counter via Upstash Redis (no DB install).
4. Google AdSense embed: script in `<head>` + in-article ad slot components.
5. SEO basics: Open Graph metadata, sitemap.xml, robots.txt.
6. Privacy + About pages (required for AdSense submission).
7. Responsive (mobile-first, parity with maily.so look).
8. i18n-ready folder/route structure (English live; locales added later).

## Out of Scope (V1 — explicitly NOT built now)

- User signup / authentication
- Email subscription form (visual disabled-button placeholder is fine)
- Newsletter email delivery (Resend etc.)
- Comments / reactions
- Stripe / crypto payments / "support" donations
- Database for posts/users (use MDX files)
- Multi-author support
- Search bar
- WhatsApp delivery, AI translation, audio TTS — postponed to later phases

## Hard Constraints

- **No DB** for posts/users. View counter uses Upstash Redis only.
- **No auth**. Public read-only site.
- **Free tiers only** during dev: Vercel free, Upstash free, AdSense free.
- **English only** content; route shape supports future `/es` / `/pt`.
- **Custom domain** (heymilhao.com) deferred but reserved — required before AdSense submission.

## Content Strategy

- **Dev placeholder**: Copy posts from https://maily.so/josh/posts/* into `content/posts/` so layout/typography can be tuned against realistic length and rhythm.
- **Pre-launch**: Replace 100% of placeholder content with original English posts. Required for AdSense approval (originality check).
- **Never deploy public** with copied placeholder content.

## Acceptance Criteria (V1 done = all true)

- `npm run lint` → 0 errors
- `npm run typecheck` → 0 errors
- `npm run build` → succeeds
- Lighthouse on prod build: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95
- Visual side-by-side with maily.so/josh: recognizable parity (typography, spacing, hero, post-list)
- View counter increments per visit, dedupes same IP within 24h
- AdSense script loads in `<head>`; in-article ad slot present on post template

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| AdSense rejects copied content | Replace all placeholder content before submission |
| AdSense rejects subdomain | Buy heymilhao.com before submitting |
| Upstash free tier hit | Cache view count client-side; dedupe via 24h SET |
| LATAM users see English only | i18n shape ready from day 1 — locales drop in cleanly |
| Copyright issue from copied dev content | NEVER deploy with placeholder; replace 100% before launch |
