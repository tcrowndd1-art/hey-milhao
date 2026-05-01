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

/* ─── SVG hero generator ───────────────────────────────────────── */
function generateSVG(titlePt, category, colorSeed) {
  const PALETTES = [
    ["#059669", "#2dd4bf", "#064e3b"],
    ["#7c3aed", "#a78bfa", "#2e1065"],
    ["#0284c7", "#38bdf8", "#0c4a6e"],
    ["#d97706", "#fbbf24", "#78350f"],
    ["#dc2626", "#f87171", "#7f1d1d"],
  ];
  const [c1, c2, bg] = PALETTES[colorSeed % PALETTES.length];
  const short = (titlePt || "Post").slice(0, 55);
  const line1 = short.slice(0, 28);
  const line2 = short.length > 28 ? short.slice(28) : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <g stroke="rgba(255,255,255,0.05)" stroke-width="1">
    ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 63}" y1="0" x2="${i * 63}" y2="630"/>`).join("\n    ")}
    ${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${i * 63}" x2="1200" y2="${i * 63}"/>`).join("\n    ")}
  </g>
  <rect x="80" y="260" width="160" height="4" rx="2" fill="url(#g2)"/>
  <text x="80" y="240" font-family="Inter,system-ui,sans-serif" font-size="22" font-weight="600" fill="${c1}" letter-spacing="3">${(category || "IA").toUpperCase()}</text>
  <text x="80" y="320" font-family="Inter,system-ui,sans-serif" font-size="48" font-weight="800" fill="white" opacity="0.95">${line1}</text>
  ${line2 ? `<text x="80" y="380" font-family="Inter,system-ui,sans-serif" font-size="48" font-weight="800" fill="white" opacity="0.95">${line2}</text>` : ""}
  <text x="80" y="560" font-family="Inter,system-ui,sans-serif" font-size="20" fill="rgba(255,255,255,0.4)">hey-milhao.vercel.app</text>
  <circle cx="1050" cy="120" r="200" fill="${c1}" opacity="0.08"/>
  <circle cx="1050" cy="120" r="120" fill="${c2}" opacity="0.06"/>
</svg>`;
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
  const colorSeed = Math.floor(Math.random() * 5);

  for (const lang of ["pt", "es"]) {
    const post = parsed[lang];
    if (!post) throw new Error(`Missing "${lang}" in Claude response`);

    const postSlug = `${date}-${slugify(post.slug || post.title)}`;
    const imageName = `${postSlug}.svg`;
    const imagePath = `/images/posts/${imageName}`;

    // Write SVG
    const svgDir = path.join(ROOT, "public", "images", "posts");
    fs.mkdirSync(svgDir, { recursive: true });
    fs.writeFileSync(path.join(svgDir, imageName), generateSVG(post.title, post.category, colorSeed));
    console.log(`🖼️  SVG: ${imagePath}`);

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
