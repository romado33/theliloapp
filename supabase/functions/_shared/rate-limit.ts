/**
 * Rate Limiting for Supabase Edge Functions
 * 
 * Usage in edge function:
 * 
 * import { checkRateLimit, rateLimitResponse, getRequestIdentifier, RATE_LIMITS } from "./rate-limit.ts";
 * 
 * // In your handler:
 * const identifier = getRequestIdentifier(req, userId);
 * const rateLimit = checkRateLimit(identifier, RATE_LIMITS.standard);
 * 
 * if (!rateLimit.allowed) {
 *   return rateLimitResponse(rateLimit, corsHeaders);
 * }
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on function cold start)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export const checkRateLimit = (
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 60 }
): RateLimitResult => {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime };
  }

  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, resetTime: entry.resetTime, retryAfter };
  }

  entry.count++;
  rateLimitStore.set(identifier, entry);
  return { allowed: true, remaining: config.maxRequests - entry.count, resetTime: entry.resetTime };
};

export const rateLimitHeaders = (result: RateLimitResult): Record<string, string> => {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
  };
  if (!result.allowed && result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter);
  }
  return headers;
};

export const rateLimitResponse = (
  result: RateLimitResult,
  corsHeaders: Record<string, string> = {}
): Response => {
  return new Response(
    JSON.stringify({ error: 'Too many requests', retryAfter: result.retryAfter }),
    {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...corsHeaders, ...rateLimitHeaders(result) },
    }
  );
};

export const getRequestIdentifier = (req: Request, userId?: string): string => {
  if (userId) return `user:${userId}`;
  
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return `ip:${forwardedFor.split(',')[0].trim()}`;
  
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return `ip:${realIp}`;
  
  const userAgent = req.headers.get('user-agent') || 'unknown';
  let hash = 0;
  for (let i = 0; i < userAgent.length; i++) {
    hash = ((hash << 5) - hash) + userAgent.charCodeAt(i);
    hash = hash & hash;
  }
  return `anonymous:${Math.abs(hash).toString(36)}`;
};

export const RATE_LIMITS = {
  standard: { windowMs: 60000, maxRequests: 60 },
  auth: { windowMs: 900000, maxRequests: 10 },
  payment: { windowMs: 60000, maxRequests: 5 },
  search: { windowMs: 60000, maxRequests: 100 },
  email: { windowMs: 3600000, maxRequests: 10 },
} as const;
