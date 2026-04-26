# Hey Milhao — PRD (하네스 3단계)

> **Detailed product specs per page and per feature.**
> Read with REQUIREMENTS.md (scope) and ARCHITECTURE.md (how).

## 1. Personas

### P1 — LATAM Reader (primary)
- 25–40 yo, LATAM-based, English-comfortable.
- Discovers posts via Twitter / LinkedIn share.
- ≥70% on mobile (LATAM mobile-heavy).
- Anonymous, returns sometimes.

### P2 — AdSense Reviewer (gatekeeper)
- Visits home + sample posts to verify originality, layout, ad placement, privacy policy, contact info.
- Failure mode = monetization blocked.

### P3 — Author / Operator (= the user)
- Writes English posts.
- Drops `.mdx` file in `content/posts/` and `git push` → auto-publish.
- Watches view counter for traction.

## 2. User Flows

### F1 — Read a post (P1)
1. Lands on home or post URL.
2. Loads with AdSense script (live ads only post-approval).
3. Counter increments once per IP+slug per 24h.
4. Sees disabled "Subscribe (coming soon)" CTA at footer.
5. Optional: clicks related post → loop.

### F2 — Author publishes (P3)
1. Author creates `content/posts/{slug}.mdx` with frontmatter.
2. `git push` → Vercel rebuild → live in ~30s.
3. Home auto-includes new post (sorted by date desc).

### F3 — AdSense approval (P2)
1. Site has ≥15 original posts, custom domain, privacy + contact pages.
2. Author submits AdSense application.
3. Reviewer checks site.
4. On approval → real ads render in existing `AdSlot` components.

## 3. Page Specs

### `/` (Home / Profile)

**Above the fold:**
- Avatar (96px circle)
- Author/site name "Hey Milhao"
- One-liner bio (≤120 chars)
- Disabled subscribe button: "Subscribe (coming soon)"
- Social links (X, LinkedIn) — optional

**Below:**
- Heading: "Latest Posts"
- Card per post: hero image, title (h2), excerpt (~150 chars), date, est. read time
- No pagination in V1 (post count <20)

**Footer:**
- "© 2026 Hey Milhao"
- Privacy / About links

### `/posts/[slug]`

**Header:**
- Hero image (full-width, 16:9)
- Title (h1)
- Byline: author + date + view count + read time

**Body:**
- MDX rendered with Tailwind `prose`
- After 1st paragraph: `AdSlot variant="in-article"`
- After ~50% scroll point: a second `AdSlot variant="in-article"`
- End: `AdSlot variant="footer"`

**Footer:**
- 2 related posts ("Continue reading")
- Disabled subscribe CTA

### `/about`
- Static MDX. Bio, mission, contact email.

### `/privacy`
- Boilerplate covering AdSense + cookies + analytics. Required for AdSense.

## 4. Acceptance Criteria (per feature)

| Feature | Pass Criterion |
|---|---|
| Home post list | All MDX files in `content/posts/` render as cards, sorted by date desc |
| Post page MDX | Frontmatter (title/date/hero) + body render with prose styling |
| View counter | Displays "1.2k" format; dedupes same IP within 24h via `seen:{ipHash}:{slug}` |
| AdSense script | Loads in `<head>` ONLY when `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is set |
| AdSlot component | Renders `<ins class="adsbygoogle">` with correct slot IDs; no-op when env var missing |
| Sitemap | `/sitemap.xml` lists `/`, every post, `/about`, `/privacy` |
| Mobile (375px) | No horizontal scroll; body text ≥16px |
| Lighthouse (prod build) | Performance ≥90, A11y ≥95, SEO ≥95 |

## 5. Non-functional

- **Deploy time**: <1 min from push to live.
- **TTFB on Vercel**: <500ms cold start.
- **No tracking** beyond AdSense + view counter in V1 (no GA4 etc.).
- **Cookie banner**: not required in V1 unless AdSense forces it on submission.

## 6. Open Questions

(none currently — all defaults chosen; raise here only if a real fork emerges during code phase)
