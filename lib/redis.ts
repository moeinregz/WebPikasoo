import Redis from "ioredis";

// -----------------------------------------------------------------------
// Redis — shared cache + cross-instance rate limiting.
// -----------------------------------------------------------------------
// Required environment variable:
//   REDIS_URL — a full Redis connection string, e.g.
//   redis://default:<password>@<host>:<port>
//   or rediss://... for a TLS endpoint (Upstash, Redis Cloud, etc.)
//
// Set it in .env.local for local development and in your hosting
// provider's project settings for production/preview deployments.
//
// Everything in this file degrades gracefully when REDIS_URL is not set:
// rate limiting falls back to a per-process in-memory Map (same behavior
// the app had before Redis existed — fine for a single instance, just not
// shared across serverless instances) and cacheWrap simply calls the
// underlying function on every request instead of caching it. Nothing
// throws or breaks local `next dev` with zero setup.

let client: Redis | null | undefined; // undefined = not attempted yet

function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.REDIS_URL;
  if (!url) {
    client = null;
    return client;
  }

  client = new Redis(url, {
    // Keep serverless functions from hanging forever if Redis is
    // unreachable — better to fall back to "no cache" than to error the
    // whole request.
    connectTimeout: 3000,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // don't keep retrying inside one request
    lazyConnect: true,
  });
  client.on("error", (err) => {
    console.error("Redis connection error:", err.message);
  });
  client.connect().catch((err) => {
    console.error("Redis connect failed:", err.message);
  });

  return client;
}

// -----------------------------------------------------------------------
// Rate limiting / cooldowns
// -----------------------------------------------------------------------
// In-memory fallback so behavior stays identical to before Redis existed
// when REDIS_URL isn't configured.
const memoryFallback = new Map<string, number>();

/** Returns true if the action tied to `key` is allowed right now, and
 *  atomically starts a new cooldown window of `windowMs` if so. Returns
 *  false if a previous call is still inside its cooldown window.
 *
 *  Backed by Redis `SET key 1 PX windowMs NX` when available (atomic,
 *  works across many serverless instances); falls back to a local Map
 *  otherwise. Used for the signup/login/contact-form/plan-order cooldowns
 *  in app/actions.ts and app/account/actions.ts. */
export async function allowAndCooldown(key: string, windowMs: number): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    try {
      const result = await redis.set(`cooldown:${key}`, "1", "PX", windowMs, "NX");
      return result === "OK";
    } catch (err) {
      console.error("Redis rate-limit check failed, allowing request:", (err as Error).message);
      return true; // fail open — a Redis hiccup shouldn't block real users
    }
  }

  const now = Date.now();
  const last = memoryFallback.get(key);
  if (last && now - last < windowMs) return false;
  memoryFallback.set(key, now);
  return true;
}

// -----------------------------------------------------------------------
// Read-through cache
// -----------------------------------------------------------------------

/** Returns the cached JSON value for `key` if present, otherwise calls
 *  `load()`, caches its result for `ttlSeconds`, and returns it. If Redis
 *  isn't configured (or errors), just calls `load()` directly — the page
 *  still works, it just always hits the database. */
export async function cacheWrap<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
  const redis = getRedis();
  if (!redis) return load();

  try {
    const cached = await redis.get(`cache:${key}`);
    if (cached != null) return JSON.parse(cached) as T;
  } catch (err) {
    console.error(`Redis cache read failed for "${key}":`, (err as Error).message);
  }

  const fresh = await load();

  try {
    await redis.set(`cache:${key}`, JSON.stringify(fresh), "EX", ttlSeconds);
  } catch (err) {
    console.error(`Redis cache write failed for "${key}":`, (err as Error).message);
  }

  return fresh;
}

/** Deletes one or more cache keys — call after any write that would make
 *  a cacheWrap()'d read stale (e.g. publishing a blog post). Safe to call
 *  even when Redis isn't configured. */
export async function invalidateCache(...keys: string[]): Promise<void> {
  const redis = getRedis();
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys.map((k) => `cache:${k}`));
  } catch (err) {
    console.error("Redis cache invalidation failed:", (err as Error).message);
  }
}
