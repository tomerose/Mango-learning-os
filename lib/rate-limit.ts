// Simple in-memory rate limiter for API routes. For production multi-instance
// deployments, use Redis (Upstash) or Vercel Edge Config instead.
//
// Usage:
//   const limiter = createRateLimiter({ requests: 10, window: 60000 });
//   if (!limiter.check(clientId)) {
//     return new Response("Too many requests", { status: 429 });
//   }

interface RateLimiterConfig {
  requests: number; // max requests
  window: number; // time window in ms
}

interface ClientRecord {
  count: number;
  resetAt: number;
}

export function createRateLimiter(config: RateLimiterConfig) {
  const clients = new Map<string, ClientRecord>();

  // Cleanup expired entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of clients.entries()) {
      if (now > record.resetAt) {
        clients.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return {
    check(clientId: string): boolean {
      const now = Date.now();
      const record = clients.get(clientId);

      if (!record || now > record.resetAt) {
        clients.set(clientId, { count: 1, resetAt: now + config.window });
        return true;
      }

      if (record.count < config.requests) {
        record.count += 1;
        return true;
      }

      return false; // rate limit exceeded
    },
  };
}
