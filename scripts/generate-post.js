#!/usr/bin/env node
/**
 * Hey Milhão — AI Content Pipeline
 *
 * Reads input from env vars (set by GitHub Actions), calls Claude API,
 * and writes MDX files + SVG hero images to content/posts/{pt,es}/.
 *
 * ENV vars expected:
 *   ANTHROPIC_API_KEY   — required
 *   INPUT_URL           — article URL to fetch and transform
 *   INPUT_CONTENT       — raw text / notes to transform
 *   INPUT_TOPIC         — topic / angle (used as supplement or sole input)
 *   INPUT_CATEGORY      — optional category override
 */

/* global require, process, __dirname */
const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

/* ─── helpers ─────────────────────────────────────────────────── */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchUrl(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HeyMilhaoBot/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const html = await res.text();
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 12000);
}

/* ─── Pollinations.ai image generator (free, no API key) ──────── */
async function generateImage(title, category, excerpt, outputPath) {
  const prompt = [
    title,
    category,
    excerpt ? excerpt.slice(0, 80) : "",
    "cinematic photography, high quality, 4k, editorial style, dark moody",
  ].filter(Boolean).join(", ");

  const url =
    "https://image.pollinations.ai/prompt/" +
    encodeURIComponent(prompt) +
    "?width=1200&height=630&nologo=true&seed=" +
    Math.floor(Math.random() * 9999);

  console.log(`🎨 Generating image via Pollinations.ai…`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pollinations failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buf);
  console.log(`🖼️  Image saved: ${outputPath} (${(buf.length / 1024).toFixed(0)}KB)`);
}

/* ─── Style guide (cached by Claude) ──────────────────────────── */
const STYLE_GUIDE = `STYLE GUIDE — Hey Milhão newsletter (maily.so/josh style):

STRUCTURE:
- Punchy opener paragraph (no heading), then H2 section chapters, each with H3 sub-sections
- H2: bold, journalistic, counterintuitive framing
- H3: descriptive, neutral sub-headings
- End with "O que eu faria" (PT) / "Lo que haría" (ES) — short practical takeaway

TONE & RHYTHM:
- Journalistic + explanatory. Smart generalist audience, not just devs.
- Short paragraphs: 2-4 sentences max. One idea per paragraph.
- No filler, no "in this article we will..." preamble.
- Counterintuitive opening angle per section.
- Concrete numbers, named companies, specific dates — no vague claims.
- Bold only for key terms used sparingly.

FORMAT:
- 600-800 words per language version.
- Insert exactly ONE <AdSlot slot="ADSLOT_ID" variant="in-article" /> after the first H2 section.
  Replace ADSLOT_ID with the post slug.
- Bullet/numbered lists: max twice, only when truly listing items.

LANGUAGES:
- PT: Brazilian Portuguese — informal but smart. "você", not "tu".
- ES: Latin American Spanish — same register. Avoid Spain-specific slang.`;

/* ─── main ─────────────────────────────────────────────────────── */
async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const inputUrl = (process.env.INPUT_URL || "").trim();
  const inputContent = (process.env.INPUT_CONTENT || "").trim();
  const inputTopic = (process.env.INPUT_TOPIC || "").trim();
  const inputCategory = (process.env.INPUT_CATEGORY || "").trim();

  if (!inputUrl && !inputContent && !inputTopic) {
    throw new Error("Set at least one of: INPUT_URL, INPUT_CONTENT, INPUT_TOPIC");
  }

  // 1. Gather raw material
  let rawMaterial = "";
  if (inputUrl) {
    console.log(`⬇️  Fetching ${inputUrl}…`);
    rawMaterial += `SOURCE URL: ${inputUrl}\n\nCONTENT:\n${await fetchUrl(inputUrl)}\n\n`;
  }
  if (inputContent) rawMaterial += `RAW CONTENT / NOTES:\n${inputContent}\n\n`;
  if (inputTopic) rawMaterial += `TOPIC / ANGLE:\n${inputTopic}\n\n`;
  if (inputCategory) rawMaterial += `CATEGORY: ${inputCategory}\n\n`;

  // 2. Call Claude with prompt caching
  const client = new Anthropic();
  console.log("🤖 Calling Claude…");

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: STYLE_GUIDE,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Transform the following material into TWO newsletter posts — Brazilian Portuguese (PT) and Latin American Spanish (ES) — following the style guide exactly.

MATERIAL:
${rawMaterial}

Return ONLY a raw JSON object (no markdown fences) with this exact shape:
{
  "pt": {
    "title": "...",
    "excerpt": "one-sentence teaser, max 160 chars",
    "category": "...",
    "slug": "url-safe-lowercase-hyphens-no-accents-max-50-chars",
    "body": "full MDX body with H2/H3 and one AdSlot"
  },
  "es": {
    "title": "...",
    "excerpt": "...",
    "category": "...",
    "slug": "...",
    "body": "..."
  }
}`,
      },
    ],
  });

  // 3. Parse response
  const rawText = response.content[0].text.trim();
  let parsed;
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Claude response is not valid JSON:\n", rawText.slice(0, 500));
    throw err;
  }

  const date = todayISO();

  for (const lang of ["pt", "es"]) {
    const post = parsed[lang];
    if (!post) throw new Error(`Missing "${lang}" in Claude response`);

    const postSlug = `${date}-${slugify(post.slug || post.title)}`;
    const imageName = `${postSlug}.jpg`;
    const imagePath = `/images/posts/${imageName}`;

    // Generate AI image via Pollinations.ai
    const imgDir = path.join(ROOT, "public", "images", "posts");
    fs.mkdirSync(imgDir, { recursive: true });
    await generateImage(post.title, post.category, post.excerpt, path.join(imgDir, imageName));

    // Inject real adslot ID
    const body = (post.body || "").replace(/ADSLOT_ID/g, postSlug);

    // Build MDX
    const mdx = `---
title: "${post.title.replace(/"/g, '\\"')}"
date: "${date}"
excerpt: "${post.excerpt.replace(/"/g, '\\"')}"
hero: "${imagePath}"
locale: "${lang}"
category: "${post.category}"
---

${body}
`;

    const contentDir = path.join(ROOT, "content", "posts", lang);
    fs.mkdirSync(contentDir, { recursive: true });
    const mdxPath = path.join(contentDir, `${postSlug}.mdx`);
    fs.writeFileSync(mdxPath, mdx);
    console.log(`✅ ${lang.toUpperCase()}: ${mdxPath}`);
  }

  console.log("\n🎉 Done — Vercel will deploy automatically on next push.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
