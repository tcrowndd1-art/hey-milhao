#!/usr/bin/env node
/**
 * Hey Milhão — AI Content Pipeline
 *
 * Execution modes (auto-detected in priority order):
 *   1. ANTHROPIC_API_KEY set → Anthropic SDK (CI/GitHub Actions)
 *   2. OPENROUTER_API_KEY set → OpenRouter API, free models (Hermes/local)
 *   3. fallback → `claude -p` CLI (Claude Code subscription, has monthly limit)
 *
 * ENV vars:
 *   ANTHROPIC_API_KEY   — triggers Anthropic SDK mode
 *   OPENROUTER_API_KEY  — triggers OpenRouter mode (free, recommended for local)
 *   OPENROUTER_MODEL    — optional model override (default: google/gemma-4-31b-it:free)
 *   INPUT_URL           — article URL to fetch and transform
 *   INPUT_CONTENT       — raw text / notes to transform
 *   INPUT_TOPIC         — topic / angle
 *   INPUT_CATEGORY      — optional category override
 */

/* global require, process, __dirname */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { jsonrepair } = require("jsonrepair");

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

/* ─── Style guide ──────────────────────────────────────────────── */
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

/* ─── Build the user prompt ────────────────────────────────────── */
function buildPrompt(rawMaterial) {
  return `${STYLE_GUIDE}

---

Transform the following material into TWO newsletter posts — Brazilian Portuguese (PT) and Latin American Spanish (ES) — following the style guide above exactly.

MATERIAL:
${rawMaterial}

CRITICAL OUTPUT RULES:
- Return ONLY a raw JSON object. No markdown fences. No text before or after.
- In the "body" field: use \\n for newlines, escape any double-quotes as \\". Do NOT use actual newlines inside JSON string values.
- Body should use ## and ### for headings (written as literal text inside the JSON string).
- Keep body under 900 words total.

JSON shape (fill in the actual content):
{"pt":{"title":"...","excerpt":"one-sentence teaser max 160 chars","category":"...","slug":"url-safe-lowercase-hyphens-no-accents-max-50-chars","body":"paragraph\\n\\n## Heading\\n\\n### Sub\\n\\nparagraph\\n\\n<AdSlot slot=\\"ADSLOT_ID\\" variant=\\"in-article\\" />\\n\\n## Heading2\\n\\n### Sub2\\n\\nparagraph\\n\\n## O que eu faria\\n\\nparagraph"},"es":{"title":"...","excerpt":"...","category":"...","slug":"...","body":"..."}}`;
}

/* ─── Claude via SDK (CI/GitHub Actions) ──────────────────────── */
async function callClaudeSDK(rawMaterial) {
  const Anthropic = require("@anthropic-ai/sdk");
  const client = new Anthropic();
  console.log("🤖 Calling Claude via SDK…");

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    system: [{ type: "text", text: STYLE_GUIDE, cache_control: { type: "ephemeral" } }],
    messages: [{
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
    }],
  });

  return response.content[0].text.trim();
}

/* ─── OpenRouter API (free models, no Claude subscription needed) ── */
async function callOpenRouter(rawMaterial) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  // Try models in order until one works
  // deepseek-chat = paid but ~$0.001/post — uses existing OpenRouter credits
  const models = process.env.OPENROUTER_MODEL
    ? [process.env.OPENROUTER_MODEL]
    : [
        "deepseek/deepseek-chat",
        "google/gemma-4-26b-a4b-it:free",
        "minimax/minimax-m2.5:free",
        "google/gemma-4-31b-it:free",
      ];

  const userPrompt = buildPrompt(rawMaterial).split("---\n\n").slice(1).join("---\n\n");

  for (const model of models) {
    console.log(`[hey-milhao] Trying OpenRouter model: ${model}...`);
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://heymilhao.com",
        "X-Title": "Hey Milhao Pipeline",
      },
      body: JSON.stringify({
        model,
        max_tokens: 8192,
        messages: [
          { role: "system", content: STYLE_GUIDE },
          { role: "user",   content: userPrompt },
        ],
      }),
    });

    if (res.status === 429) {
      console.log(`[hey-milhao] ${model} rate-limited, trying next...`);
      continue;
    }
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter error ${res.status}: ${err}`);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.log(`[hey-milhao] ${model} returned empty content, trying next...`);
      continue;
    }
    return content.trim();
  }
  throw new Error("All OpenRouter free models rate-limited or unavailable. Try again in a few minutes.");
}

/* ─── Claude via CLI (local terminal, free) ────────────────────── */
function callClaudeCLI(rawMaterial) {
  console.log("🤖 Calling Claude via `claude` CLI (local mode, no API cost)…");
  const fullPrompt = buildPrompt(rawMaterial);

  // Pass prompt via stdin to avoid shell-escaping issues with long text
  const result = spawnSync("claude", ["-p", "--output-format", "text"], {
    input: fullPrompt,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    timeout: 180_000,
    shell: true,
  });

  if (result.error) {
    throw new Error(
      `Failed to run claude CLI: ${result.error.message}\n` +
      `Make sure 'claude' is installed and you're logged in (run: claude login)`
    );
  }
  if (result.status !== 0) {
    throw new Error(`claude CLI exited with status ${result.status}:\n${result.stderr}`);
  }

  return result.stdout.trim();
}

/* ─── main ─────────────────────────────────────────────────────── */
async function main() {
  const inputUrl      = (process.env.INPUT_URL      || "").trim();
  const inputContent  = (process.env.INPUT_CONTENT  || "").trim();
  const inputTopic    = (process.env.INPUT_TOPIC    || "").trim();
  const inputCategory = (process.env.INPUT_CATEGORY || "").trim();

  if (!inputUrl && !inputContent && !inputTopic) {
    throw new Error(
      "Set at least one of: INPUT_URL, INPUT_CONTENT, INPUT_TOPIC\n\n" +
      "Examples:\n" +
      "  INPUT_URL=https://example.com/article node scripts/generate-post.js\n" +
      "  INPUT_TOPIC=\"OpenAI lança GPT-5\" node scripts/generate-post.js"
    );
  }

  // 1. Gather raw material
  let rawMaterial = "";
  if (inputUrl) {
    console.log(`⬇️  Fetching ${inputUrl}…`);
    rawMaterial += `SOURCE URL: ${inputUrl}\n\nCONTENT:\n${await fetchUrl(inputUrl)}\n\n`;
  }
  if (inputContent)  rawMaterial += `RAW CONTENT / NOTES:\n${inputContent}\n\n`;
  if (inputTopic)    rawMaterial += `TOPIC / ANGLE:\n${inputTopic}\n\n`;
  if (inputCategory) rawMaterial += `CATEGORY: ${inputCategory}\n\n`;

  // 2. Call AI — priority: Anthropic SDK → Claude CLI → OpenRouter fallback
  let rawText;
  if (process.env.ANTHROPIC_API_KEY) {
    rawText = await callClaudeSDK(rawMaterial);
  } else {
    // Try Claude CLI first (free subscription)
    try {
      rawText = callClaudeCLI(rawMaterial);
      console.log("[hey-milhao] Engine: Claude CLI (subscription)");
    } catch (cliErr) {
      // CLI failed — check if OpenRouter fallback available
      if (!process.env.OPENROUTER_API_KEY) throw cliErr;

      const reason = cliErr.message.includes("monthly") ? "monthly limit reached"
        : cliErr.message.includes("ENOENT")             ? "claude CLI not found"
        : "CLI error";

      console.log(`[hey-milhao] Claude CLI unavailable (${reason})`);
      console.log("[hey-milhao] >> Falling back to OpenRouter...");
      rawText = await callOpenRouter(rawMaterial);
    }
  }

  // 3. Parse response — with auto-repair for common LLM JSON issues
  let parsed;
  try {
    let cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // Extract first {...} block if there's preamble text
    if (!cleaned.startsWith("{")) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) cleaned = match[0];
    }

    // Try direct parse first, then auto-repair (handles unescaped quotes, truncation etc.)
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.log("[hey-milhao] JSON malformed, attempting auto-repair...");
      parsed = JSON.parse(jsonrepair(cleaned));
    }
  } catch (err) {
    console.error("[hey-milhao] Response could not be parsed as JSON:\n", rawText.slice(0, 500));
    throw err;
  }

  // 4. Write files
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

  console.log("\n🎉 Done! Commit and push to deploy:");
  console.log(`   git add content/posts public/images/posts && git commit -m "post: ${todayISO()}" && git push`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
