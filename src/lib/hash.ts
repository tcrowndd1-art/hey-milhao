import { createHash } from "node:crypto";

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "hey-milhao";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 16);
}
