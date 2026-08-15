/**
 * Minimal in-memory rate limiter, keyed by IP, for the AI endpoint.
 *
 * This protects against a single runaway browser tab or basic abuse
 * during normal operation. It is intentionally simple: state lives in
 * the Node process, so it resets on redeploy and is NOT shared across
 * multiple serverless instances. If you outgrow that (e.g. you're
 * scaling across many concurrent Vercel function instances and see
 * abuse), swap this for a shared store such as Upstash Redis
 * (`@upstash/ratelimit`) — the call site in the route handler is the
 * only place that needs to change.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;

const hits = new Map<string, number[]>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const existing = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (existing.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldestInWindow = existing[0];
    const retryAfterSeconds = Math.ceil((oldestInWindow + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  existing.push(now);
  hits.set(key, existing);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => t <= windowStart)) hits.delete(k);
    }
  }

  return { allowed: true };
}
