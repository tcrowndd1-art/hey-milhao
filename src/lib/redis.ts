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

export async function getManyViews(slugs: string[]): Promise<Record<string, number>> {
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
  message: string;
  createdAt: string;
  likes: number;
  replyCount: number;
};

export type Reply = {
  id: string;
  message: string;
  createdAt: string;
  likes: number;
};

const COMMENT_KEY = (slug: string) => `comments:${slug}`;
const LIKES_KEY   = (slug: string) => `likes:${slug}`;
const REPLY_KEY   = (commentId: string) => `replies:${commentId}`;
const REPLY_LIKES = (commentId: string) => `replylikes:${commentId}`;
const CLIMIT_KEY  = (ipHash: string) => `climit:${ipHash}`;
const CLIMIT_TTL  = 30;
const MAX_COMMENTS = 200;
const MAX_REPLIES  = 50;

export async function getComments(slug: string): Promise<Comment[]> {
  const redis = getRedis();
  if (!redis) return [];

  const raw = await redis.lrange<string>(COMMENT_KEY(slug), 0, MAX_COMMENTS - 1);
  const parsed = raw
    .map((item) => { try { return JSON.parse(item) as { id: string; message: string; createdAt: string }; } catch { return null; } })
    .filter((c): c is { id: string; message: string; createdAt: string } => c !== null);

  if (parsed.length === 0) return [];

  // Batch-fetch likes
  const likesRaw = await redis.hgetall(LIKES_KEY(slug)).catch(() => ({}));
  const likesMap: Record<string, number> = {};
  if (likesRaw) {
    for (const [k, v] of Object.entries(likesRaw)) {
      likesMap[k] = Number(v) || 0;
    }
  }

  // Batch-fetch reply counts using pipeline
  const replyCounts: number[] = await Promise.all(
    parsed.map((c) => redis.llen(REPLY_KEY(c.id)).catch(() => 0))
  );

  return parsed.map((c, i) => ({
    ...c,
    likes: likesMap[c.id] ?? 0,
    replyCount: replyCounts[i] ?? 0,
  }));
}

export async function addComment(
  slug: string,
  ipHash: string,
  message: string,
): Promise<{ comment: Comment } | { error: string }> {
  const redis = getRedis();
  if (!redis) return { error: "unavailable" };

  const limitKey = CLIMIT_KEY(ipHash);
  const blocked = await redis.set(limitKey, 1, { nx: true, ex: CLIMIT_TTL });
  if (blocked !== "OK") return { error: "too_fast" };

  const comment = {
    id: crypto.randomUUID(),
    message: message.trim().slice(0, 500),
    createdAt: new Date().toISOString(),
  };

  await redis.lpush(COMMENT_KEY(slug), JSON.stringify(comment));
  await redis.ltrim(COMMENT_KEY(slug), 0, MAX_COMMENTS - 1);

  return { comment: { ...comment, likes: 0, replyCount: 0 } };
}

export async function likeComment(slug: string, commentId: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  return await redis.hincrby(LIKES_KEY(slug), commentId, 1);
}

export async function getReplies(commentId: string): Promise<Reply[]> {
  const redis = getRedis();
  if (!redis) return [];

  const raw = await redis.lrange<string>(REPLY_KEY(commentId), 0, MAX_REPLIES - 1);
  const parsed = raw
    .map((item) => { try { return JSON.parse(item) as { id: string; message: string; createdAt: string }; } catch { return null; } })
    .filter((r): r is { id: string; message: string; createdAt: string } => r !== null);

  if (parsed.length === 0) return [];

  const likesRaw = await redis.hgetall(REPLY_LIKES(commentId)).catch(() => ({}));
  const likesMap: Record<string, number> = {};
  if (likesRaw) {
    for (const [k, v] of Object.entries(likesRaw)) {
      likesMap[k] = Number(v) || 0;
    }
  }

  return parsed.map((r) => ({ ...r, likes: likesMap[r.id] ?? 0 }));
}

export async function addReply(
  commentId: string,
  ipHash: string,
  message: string,
): Promise<{ reply: Reply } | { error: string }> {
  const redis = getRedis();
  if (!redis) return { error: "unavailable" };

  const limitKey = CLIMIT_KEY(`r:${ipHash}`);
  const blocked = await redis.set(limitKey, 1, { nx: true, ex: CLIMIT_TTL });
  if (blocked !== "OK") return { error: "too_fast" };

  const reply = {
    id: crypto.randomUUID(),
    message: message.trim().slice(0, 500),
    createdAt: new Date().toISOString(),
  };

  await redis.lpush(REPLY_KEY(commentId), JSON.stringify(reply));
  await redis.ltrim(REPLY_KEY(commentId), 0, MAX_REPLIES - 1);

  return { reply: { ...reply, likes: 0 } };
}

export async function likeReply(commentId: string, replyId: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  return await redis.hincrby(REPLY_LIKES(commentId), replyId, 1);
}
