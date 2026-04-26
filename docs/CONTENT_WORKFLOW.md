# Content Workflow — How a post gets published

> Read with [`prompts/BLOG_STYLE_GUIDE.md`](../prompts/BLOG_STYLE_GUIDE.md) for the actual writing rules. This file describes **the human-side flow** (what you do, what the system does in response).

---

## The three input types

You pick **one** of these per post and submit it via a GitHub Issue:

| Input type | What you provide | What the agent does |
|---|---|---|
| **1. Article URL** | A link to a news article, blog post, or essay | Fetches the article, rewrites in Hey Milhão voice, translates PT + ES |
| **2. YouTube link** | A video URL | Pulls the transcript, summarizes key points, embeds the video, translates PT + ES |
| **3. Script** | Your own draft, in any language, pasted into the issue body | Translates and lightly edits, preserving your voice |

You never need to write code or open a terminal — everything happens through the GitHub web UI.

## Step-by-step (your side)

### 1. Open a new GitHub Issue

Go to https://github.com/tcrowndd1-art/hey-milhao/issues/new and use this template:

```
Title: [POST] <short topic>

Body:
INPUT_TYPE: url | youtube | script
SOURCE: <paste URL or paste full script>
NOTES: (optional — angle to emphasize, target length, etc.)
```

### 2. Wait ~2–3 minutes

The GitHub Action fires automatically when an issue is created.
- It reads the issue body.
- It calls the Claude API with `prompts/BLOG_STYLE_GUIDE.md` as the system prompt and your input as the user prompt.
- It produces TWO MDX files (PT + ES) plus a hero SVG.
- It commits the new files to `main` and closes the issue with a link to the published post.

### 3. Vercel rebuilds + deploys

Vercel sees the new commit on `main` and rebuilds the site. ~30 seconds later the post is live at:

- `https://heymilhao.com/pt/posts/<slug>`
- `https://heymilhao.com/es/posts/<slug>`

Visitors are routed to the matching locale automatically based on their IP (Spanish-speaking countries → `/es`, others → `/pt`).

## Editing an existing post

You can edit a published post from any browser:

1. Go to `https://github.com/tcrowndd1-art/hey-milhao/tree/main/content/posts/pt`.
2. Click the `.mdx` file you want to change.
3. Click the **pencil icon** (top right of the file view).
4. Edit the markdown directly.
5. Scroll down, write a short commit message, click **Commit changes**.
6. Vercel rebuilds in ~30s. The change is live.

Make sure to also edit the matching file under `content/posts/es/` if the change is content-relevant (typos in PT only need PT).

## Where things live

| You want to change… | Edit this file |
|---|---|
| How AI writes posts (style, length, structure) | `prompts/BLOG_STYLE_GUIDE.md` |
| The site's UI text in PT / ES | `src/i18n/pt.ts` / `src/i18n/es.ts` |
| Site name / tagline / contact email | `src/i18n/pt.ts` `site` block + `es.ts` |
| Sidebar / Hero / Footer layout | `src/components/*.tsx` |
| Post content | `content/posts/pt/<slug>.mdx`, `content/posts/es/<slug>.mdx` |
| Privacy policy or About page wording | `src/app/[locale]/privacy/page.tsx`, `about/page.tsx` |

## What if the AI gets a post wrong?

You have two ways to fix it:

1. **Quick fix**: edit the `.mdx` file via the GitHub web UI (instructions above).
2. **Re-generate**: delete both `.mdx` files for that post + reopen the issue with a corrected note. The action will run again.

To prevent the same mistake on future posts, edit `prompts/BLOG_STYLE_GUIDE.md` and add a rule.
