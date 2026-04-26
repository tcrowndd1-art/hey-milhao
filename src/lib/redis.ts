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

const VIEW_KEY = (slug: string) => `views:${slug}`;
const SEEN_KEY = (ipHash: string, slug: string) => `seen:${ipHash}:${slug}`;
const SEEN_TTL_SECONDS = 60 * 60 * 24;

export async function getViews(slug: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  const v = await redis.get<number>(VIEW_KEY(slug));
  return typeof v === "number" ? v : 0;
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
