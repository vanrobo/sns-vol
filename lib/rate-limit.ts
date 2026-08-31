import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitPreset = "auth" | "signup" | "grievance";

const limiters = new Map<RateLimitPreset, Ratelimit>();

function getLimiter(preset: RateLimitPreset): Ratelimit | null {
  if (limiters.has(preset)) return limiters.get(preset)!;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  const config: Record<RateLimitPreset, Ratelimit> = {
    auth: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "15 m"),
      prefix: "sns:rl:auth",
    }),
    signup: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "sns:rl:signup",
    }),
    grievance: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "sns:rl:grievance",
    }),
  };

  limiters.set(preset, config[preset]);
  return config[preset];
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/** Returns an error message when limited, or null when allowed. */
export async function enforceRateLimit(
  preset: RateLimitPreset,
  identifier: string,
): Promise<string | null> {
  const limiter = getLimiter(preset);
  if (!limiter) return null;

  const { success } = await limiter.limit(`${preset}:${identifier}`);
  if (!success) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  return null;
}

export function isRateLimitConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}
