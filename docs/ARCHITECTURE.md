# Hey Milhao — Architecture (하네스 4단계)

> **How the code is structured.**
> Read with PLAN.md (what) and PRD.md (why).

## Stack

| Layer | Tool | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSG + ISR + API routes in one toolchain |
| Language | TypeScript (strict) | Catches errors at build (linter requirement) |
| Styling | Tailwind CSS + `@tailwindcss/typography` | Fast iteration; `prose` matches maily.so density |
| Content | MDX via `@next/mdx` + `gray-matter` | File-based, no DB, supports React in markdown |
| View counter | `@upstash/redis` (REST) | Free tier, no DB install, single INCR call |
| Ads | Google AdSense `<script>` + `<ins>` | Standard embed |
| SEO | `next-sitemap` + Next.js metadata API | Auto sitemap + Open Graph |
| Hosting | Vercel | Free, zero-config Next.js, auto deploy |
| Lint / Format | ESLint + Prettier | Harness "linter" requirement |
| Type check | `tsc --noEmit` | Harness "linter" requirement |

## Folder Structure

```
hey-milhao/
├── docs/
│   ├── REQUIREMENTS.md
│   ├── PLAN.md
│   ├── PRD.md
│   └── ARCHITECTURE.md
├── content/
│   └── posts/
│       ├── 2026-04-25-first-post.mdx
│       └── ...
├── public/
│   ├── images/posts/...
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # html/body shell, AdSense script tag
│   │   ├── page.tsx                   # home (Hero + PostList)
│   │   ├── posts/[slug]/page.tsx      # post detail
│   │   ├── about/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── api/
│   │       └── views/[slug]/route.ts  # GET (read) + POST (increment)
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── PostCard.tsx
│   │   ├── PostList.tsx
│   │   ├── PostHeader.tsx
│   │   ├── MDXContent.tsx
│   │   ├── ViewCounter.tsx            # client
│   │   ├── AdSlot.tsx                 # client (needs window.adsbygoogle)
│   │   ├── SubscribeButton.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   ├── posts.ts                   # MDX file reader (fs, build-time)
│   │   ├── redis.ts                   # Upstash client wrapper
│   │   └── format.ts                  # number formatter ("1.2k")
│   ├── i18n/
│   │   └── en.ts                      # all UI strings (single source for V1)
│   └── styles/
│       └── globals.css                # Tailwind base + prose tweaks
├── .env.example
├── .env.local                         # gitignored
├── .eslintrc.json
├── .prettierrc
├── next.config.mjs
├── next-sitemap.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Data Model (no DB — derived from files + Redis)

### MDX frontmatter

```yaml
---
title: "Post title"
date: "2026-04-25"
excerpt: "Short summary, ~150 chars"
hero: "/images/posts/slug.jpg"
locale: "en"
---
```

### Upstash Redis schema

| Key | Op | TTL | Purpose |
|---|---|---|---|
| `views:{slug}` | INCR / GET | none | Total view count |
| `seen:{ipHash}:{slug}` | SET EX 86400 | 24h | Dedupe per IP per day |

IPs are SHA-256 hashed (first 16 hex chars) before storage — no raw PII in Redis.

## Key Modules

### `src/lib/posts.ts`
- `getAllPosts()` — read `content/posts/*.mdx`, parse frontmatter, sort by `date` desc.
- `getPostBySlug(slug)` — return frontmatter + raw MDX source.
- Synchronous, build-time only — no runtime FS access.

### `src/lib/redis.ts`
- Initializes Upstash REST client from env vars.
- Exports `incrementView(slug, ipHash)` and `getViews(slug)`.

### `src/app/api/views/[slug]/route.ts`
- `GET` → `{ count: number }`
- `POST` body `{ ipHash }` → checks `seen:{ipHash}:{slug}`; if absent, sets it (24h) and INCRs `views:{slug}`. Returns new count.

### `src/components/AdSlot.tsx`
- Renders `<ins class="adsbygoogle" data-ad-client={CLIENT_ID} data-ad-slot={slotId} />`.
- On mount: `(window.adsbygoogle = window.adsbygoogle || []).push({})`.
- Renders `null` if `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is missing.

### `src/components/ViewCounter.tsx`
- Client component.
- On mount: hashes IP via server endpoint or uses anon token, POSTs to `/api/views/{slug}`.
- Displays formatted count via `format.ts`. Optionally re-fetches every 60s (SWR).

## i18n Strategy

- V1 is English only; **no `[locale]` route segment yet** to keep code simple.
- All UI strings are centralized in `src/i18n/en.ts`. V2 adds `es.ts`, `pt.ts` and a `[locale]` segment without rewriting components.
- Posts are organized as `content/posts/{slug}.mdx` with `locale: "en"` in frontmatter — V2 adds `content/posts/es/...` etc.

## Build & Verify Pipeline

```
local:
  npm run dev          # hot reload
  npm run lint         # ESLint
  npm run typecheck    # tsc --noEmit
  npm run build        # Next prod build (must pass before deploy)

CI (Vercel):
  push → install → lint → typecheck → build → deploy
```

## Continuous Evaluation (하네스 6단계)

V1 is "done" only when every check below passes:

1. `npm run lint` — 0 errors
2. `npm run typecheck` — 0 errors
3. `npm run build` — succeeds; initial JS bundle <200KB
4. Manual: `/` shows post list
5. Manual: post page increments view counter
6. Lighthouse (prod build): Perf ≥90, A11y ≥95, SEO ≥95
7. View source: AdSense script in `<head>`
8. View source: `<ins class="adsbygoogle">` slots present on post pages
9. `/sitemap.xml` returns valid XML
10. Mobile 375×667: no horizontal scroll
