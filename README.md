# Hey Milhao

> A maily.so-style English newsletter blog for the LatAm market. Static MDX content, Upstash Redis view counters, Google AdSense integration.

This is the V1 build. Refer to the four documents in `docs/` (the harness) for what is and is not in scope:

- [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) — what we are building, hard constraints, acceptance criteria.
- [`docs/PLAN.md`](docs/PLAN.md) — pages, components, build phases.
- [`docs/PRD.md`](docs/PRD.md) — page-by-page specs and acceptance criteria.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — folder layout, modules, build pipeline.

## Stack

- **Next.js 15** (App Router) + TypeScript (strict)
- **Tailwind CSS** + `@tailwindcss/typography` for prose
- **next-mdx-remote** + `gray-matter` — file-based posts in `content/posts/*.mdx`
- **@upstash/redis** — anonymous per-post view counter
- **Google AdSense** — embedded via `<Script>` and `<AdSlot />` components
- **Vercel** — recommended host (zero-config)

## Run locally

```bash
# 1. install
npm install

# 2. copy env vars
cp .env.example .env.local
# (fill in Upstash + AdSense values, or leave blank for placeholder behavior)

# 3. dev server
npm run dev
# -> http://localhost:3000
```

If `.env.local` is empty:
- View counters silently no-op (counter shows `0`).
- AdSense slots render dashed placeholder boxes labeled `Ad placeholder (in-article)`.
- Everything else works.

## Add a post

Create a new `.mdx` file under `content/posts/`:

```
content/posts/2026-05-01-my-new-post.mdx
```

Frontmatter must contain `title`, `date` (ISO), `excerpt`. Optional: `hero` (path under `/public`), `locale` (defaults to `"en"`).

```mdx
---
title: "My new post"
date: "2026-05-01"
excerpt: "One-sentence teaser, ~150 chars."
hero: "/images/posts/my-new-post.svg"
locale: "en"
---

Body in MDX. You can drop `<AdSlot slot="my-slug-1" variant="in-article" />`
anywhere inside.
```

Push to `main` → Vercel rebuilds → live in ~30s.

## Verification (harness step 6)

Before considering V1 done, all of these must pass:

```bash
npm run lint        # 0 errors
npm run typecheck   # 0 errors
npm run build       # succeeds
```

Plus manual:

- Lighthouse on production build: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95
- Mobile (375 × 667): no horizontal scroll on any page
- AdSense `<script>` loads in `<head>` when `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is set
- View counter increments on first visit; same IP within 24h does not double-count
- `/sitemap.xml` returns valid XML

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import in Vercel.
3. Set environment variables (the same ones in `.env.example`).
4. Buy a custom domain (`heymilhao.com` or similar) before submitting to AdSense.
5. Replace ALL placeholder MDX in `content/posts/` with original English posts before submitting.

## Pre-launch checklist

- [ ] Replace all placeholder posts in `content/posts/` with original content
- [ ] Replace `/public/images/avatar.svg` with the real avatar
- [ ] Replace per-post hero SVGs with real assets
- [ ] Update `t.site.email` in `src/i18n/en.ts` to the real contact email
- [ ] Buy custom domain and point DNS to Vercel
- [ ] Sign up for Upstash Redis, paste keys into Vercel env vars
- [ ] Submit to Google AdSense (after ≥15 original posts and 1–2 weeks live)
- [ ] After approval, paste publisher ID into `NEXT_PUBLIC_ADSENSE_CLIENT_ID`

## License / Content notice

Placeholder MDX in `content/posts/` is dev scaffolding only. Replace 100% with original content before going public — it must not be deployed publicly as-is.
