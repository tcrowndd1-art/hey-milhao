import { Redis } from "@upstash/redis";

let cached: Redis | null = null;

export function getRedis(): Redis | null {
  if (cached) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cached = new Redis({ url, token });
  return cached;
}

/* ─── Views ────────────────────────────────────────────────────── */

const VIEW_KEY = (slug: string) => `views:${slug}`;
const SEEN_KEY = (ipHash: string, slug: string) => `seen:${ipHash}:${slug}`;
const SEEN_TTL_SECONDS = 60 * 60 * 24;

export async function getViews(slug: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  const v = await redis.get<number>(VIEW_KEY(slug));
  return typeof v === "number" ? v : 0;
}

/** Batch-fetch views for multiple slugs using Redis MGET. */
export async function getManyViews(
  slugs: string[],
): Promise<Record<string, number>> {
  const redis = getRedis();
  if (!redis || slugs.length === 0) return {};
  const keys = slugs.map(VIEW_KEY) as [string, ...string[]];
  const values = await redis.mget<(number | null)[]>(...keys);
  const result: Record<string, number> = {};
  slugs.forEach((slug, i) => {
    const v = values[i];
    result[slug] = typeof v === "number" ? v : 0;
  });
  return result;
}

export async function incrementViewIfNew(
  slug: string,
  ipHash: string,
): Promise<{ count: number; counted: boolean }> {
  const redis = getRedis();
  if (!redis) return { count: 0, counted: false };

  const seenKey = SEEN_KEY(ipHash, slug);
  const wasSet = await redis.set(seenKey, 1, { nx: true, ex: SEEN_TTL_SECONDS });
  const counted = wasSet === "OK";

  let count: number;
  if (counted) {
    count = await redis.incr(VIEW_KEY(slug));
  } else {
    count = (await redis.get<number>(VIEW_KEY(slug))) ?? 0;
  }
  return { count, counted };
}

/* ─── Comments ──────────────────────────────────────────────────── */

export type Comment = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

const COMMENT_KEY = (slug: string) => `comments:${slug}`;
const CLIMIT_KEY = (ipHash: string) => `climit:${ipHash}`;
const CLIMIT_TTL = 30; // seconds between comments per IP
const MAX_COMMENTS = 200;

export async function getComments(slug: string): Promise<Comment[]> {
  const redis = getRedis();
  if (!redis) return [];
  const raw = await redis.lrange<string>(COMMENT_KEY(slug), 0, MAX_COMMENTS - 1);
  return raw
    .map((item) => {
      try {
        return JSON.parse(item) as Comment;
      } catch {
        return null;
      }
    })
    .filter((c): c is Comment => c !== null);
}

/** Returns null on success, or an error string if rate-limited or invalid. */
export async function addComment(
  slug: string,
  ipHash: string,
  name: string,
  message: string,
): Promise<{ comment: Comment } | { error: string }> {
  const redis = getRedis();
  if (!redis) return { error: "unavailable" };

  // Rate limit
  const limitKey = CLIMIT_KEY(ipHash);
  const blocked = await redis.set(limitKey, 1, { nx: true, ex: CLIMIT_TTL });
  if (blocked !== "OK") return { error: "too_fast" };

  const comment: Comment = {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 40),
    message: message.trim().slice(0, 500),
    createdAt: new Date().toISOString(),
  };

  // Prepend (newest first), trim to MAX_COMMENTS
  await redis.lpush(COMMENT_KEY(slug), JSON.stringify(comment));
  await redis.ltrim(COMMENT_KEY(slug), 0, MAX_COMMENTS - 1);

  return { comment };
}
