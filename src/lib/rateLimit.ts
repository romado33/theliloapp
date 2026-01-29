/**
 * Rate Limiting Utility for Edge Functions
 * 
 * Provides in-memory rate limiting for Supabase Edge Functions.
 * For production, consider using Redis or Supabase-based rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on function cold start)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;  // Seconds until reset (if blocked)
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export const checkRateLimit = (
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 60 }
): RateLimitResult => {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance on each call
    cleanupExpiredEntries();
  }

  if (!entry || now > entry.resetTime) {
    // New window
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  if (entry.count >= config.maxRequests) {
    // Rate limited
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
};

/**
 * Create rate limit response headers
 */
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

/**
 * Create a rate limited error response
 */
export const rateLimitResponse = (result: RateLimitResult, corsHeaders: Record<string, string> = {}): Response => {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        ...rateLimitHeaders(result),
      },
    }
  );
};

/**
 * Get identifier from request (IP or user ID)
 */
export const getRequestIdentifier = (req: Request, userId?: string): string => {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from headers (common proxy headers)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return `ip:${forwardedFor.split(',')[0].trim()}`;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return `ip:${realIp}`;
  }

  // Fallback to a hash of user-agent and other headers
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `anonymous:${hashString(userAgent)}`;
};

/**
 * Simple string hash for anonymous identification
 */
const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Clean up expired rate limit entries
 */
const cleanupExpiredEntries = (): void => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Standard API endpoints
  standard: { windowMs: 60000, maxRequests: 60 },   // 60/min
  
  // Auth endpoints (stricter)
  auth: { windowMs: 900000, maxRequests: 10 },      // 10/15min
  
  // Payment endpoints (strictest)
  payment: { windowMs: 60000, maxRequests: 5 },     // 5/min
  
  // Search endpoints (generous)
  search: { windowMs: 60000, maxRequests: 100 },    // 100/min
  
  // Email sending (very strict)
  email: { windowMs: 3600000, maxRequests: 10 },    // 10/hour
} as const;
