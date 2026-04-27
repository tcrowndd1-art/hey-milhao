---
description: Generate a Hey Milhão post (PT + ES) from a URL, YouTube link, or pasted script. Auto-commits and pushes.
argument-hint: <url | youtube:URL | "script: ...long text...">
---

You are operating inside the **Hey Milhão** repo (`C:/Dev/hey-milhao`). Your job is to produce one new post in both Portuguese and Spanish, following the house style guide, then commit and push.

## Required reading (do this first, every time)

1. Read `prompts/BLOG_STYLE_GUIDE.md` in full. **Every rule there is binding** — tone, structure, length, AdSense compliance.
2. Read `docs/CONTENT_WORKFLOW.md` for the user-facing flow.
3. Glance at one existing post in each locale to match house tone:
   - `content/posts/pt/2026-04-24-hermes-agentes.mdx`
   - `content/posts/es/2026-04-24-agentes-hermes.mdx`

## Steps

### 1. Parse the input

The user passes one of:
- A bare URL → treat as **external article URL**
- `youtube:<url>` → treat as **YouTube link**
- `script: <long text>` → treat as **author script**

If the input is ambiguous, ask the user before proceeding.

### 2. Gather source material

- **URL**: fetch the page (use the WebFetch tool). Extract the meaningful content. Note the publication, author, date.
- **YouTube**: fetch the transcript (use the YouTube transcript MCP if available, otherwise WebFetch on the page and extract). Note the channel and speaker.
- **Script**: use as-is.

**Never copy more than one short sentence verbatim** from any external source. Always rewrite in our voice.

### 3. Plan the post

Draft (in your head, no file writes yet):
- A specific, declarative title (50–80 chars)
- A `category` from: `Tecnologia`, `Produto`, `Negócios`, `Founder`, `Insight`
- A 120–180 char excerpt
- 3–6 H2 section names — each a specific noun phrase, no "Conclusion"
- The English / source-language draft of body, 600–1200 words

### 4. Generate the slug + filename

- Today's date in ISO: `YYYY-MM-DD`
- Short slug derived from the topic, kebab-case, Portuguese for the PT file, Spanish for the ES file (slugs may differ between locales)
- Final paths:
  - `content/posts/pt/<YYYY-MM-DD>-<pt-slug>.mdx`
  - `content/posts/es/<YYYY-MM-DD>-<es-slug>.mdx`
- Hero asset: `public/images/posts/<base-slug>.svg` — share the base slug between locales

### 5. Write the PT file

Frontmatter:
```yaml
---
title: "<title PT>"
date: "<YYYY-MM-DD>"
excerpt: "<excerpt PT>"
hero: "/images/posts/<base-slug>.svg"
locale: "pt"
category: "<category>"
---
```

Body:
- Lead paragraph(s) with concrete hook
- `<AdSlot slot="<base-slug>-1" variant="in-article" />` after the lead
- 3–6 `## ...` H2 sections with prose
- If body > 800 words: a second `<AdSlot slot="<base-slug>-2" variant="in-article" />` between H2 sections 2 and 3
- Final paragraph with a concrete take (no heading, no "Conclusion")

### 6. Write the ES file

Translate the PT version into Latin American Spanish. Keep paragraph and section structure identical. Adapt idioms naturally; do not retranslate examples that don't apply (currency: USD or local currency mentioned in source).

### 7. Generate the hero SVG

A 1280×720 SVG with:
- A brand-appropriate gradient background (use one of these palette pairs):
  - emerald: `#065f46 → #10b981`
  - violet: `#4c1d95 → #8b5cf6`
  - amber: `#92400e → #f59e0b`
  - blue: `#1e3a8a → #3b82f6`
  - rose: `#9f1239 → #f43f5e`
- Title or short tagline in white Inter sans-serif, big and bold, on the left third
- A faint subtitle below in white at 80% opacity
- Save under `public/images/posts/<base-slug>.svg`

### 8. Verify locally before commit

Run, in this order:
```bash
npm run typecheck
npm run lint
```

If either fails, fix the post (most likely a stray quote or unclosed tag in MDX) and rerun.

### 9. Commit + push

```bash
git add content/posts/pt/<YYYY-MM-DD>-<pt-slug>.mdx \
        content/posts/es/<YYYY-MM-DD>-<es-slug>.mdx \
        public/images/posts/<base-slug>.svg
git commit -m "post: <base-slug>"
git push
```

### 10. Report

Output a 4–6 line summary:
- Title (both locales)
- File paths created
- Word count (PT)
- Live URLs once Vercel finishes (`https://heymilhao.com/pt/posts/<pt-slug>`)
- Anything that needed your judgment (e.g., source choice, ambiguous claim)

## Hard rules

- **Never publish placeholder content publicly.** If you're testing, use `--no-push` mode (skip step 9) and tell the user.
- **Never copy >25 words verbatim** from a source.
- **Always produce both PT and ES files in the same commit.**
- **Never invent stats or quotes.** If the source has none, write the post without them.
