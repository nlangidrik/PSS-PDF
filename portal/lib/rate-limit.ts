/**
 * Simple in-memory rate limiter for Next.js API routes
 * For production, consider using Redis-based rate limiting
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = "Too many requests, please try again later." } = options;

  return (identifier: string): { success: boolean; message?: string; remaining?: number; resetTime?: number } => {
    const now = Date.now();
    const key = identifier;
    const record = store[key];

    // Clean up expired entries periodically (every 1000 requests)
    if (Math.random() < 0.001) {
      Object.keys(store).forEach((k) => {
        if (store[k].resetTime < now) {
          delete store[k];
        }
      });
    }

    if (!record || record.resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return {
        success: true,
        remaining: max - 1,
        resetTime: now + windowMs,
      };
    }

    if (record.count >= max) {
      return {
        success: false,
        message,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    record.count++;
    return {
      success: true,
      remaining: max - record.count,
      resetTime: record.resetTime,
    };
  };
}

/**
 * Get client identifier from request
 * In production, use a more sophisticated method (IP + user agent hash, etc.)
 */
export function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  return `${ip}-${userAgent}`.slice(0, 100);
}

