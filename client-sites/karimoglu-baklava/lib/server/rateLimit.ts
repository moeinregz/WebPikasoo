import { jsonError } from "./security";

/**
 * ===== Rate Limiting (Prompt 11، بخش ۱۸) =====
 *
 * این یکی از TODOهای صریح گزارش Prompt 10 بود («Rate Limiting روی
 * /api/auth/login هنوز پیاده نشده — باید قبل از Production اضافه شود»).
 * اینجا پیاده می‌شود.
 *
 * ⚠️ محدودیت صادقانه: پیاده‌سازی در حافظه همین پروسه است. برای استقرار
 * تک‌سروری (وضعیت فعلی پروژه) کاملاً مؤثر است، اما اگر روزی چند Instance
 * پشت Load Balancer اجرا شود، هر Instance شمارنده خودش را دارد و سقف
 * مؤثر چند برابر می‌شود. راهکار درست برای آن حالت، یک Store مشترک
 * (Redis) است — تا آن زمان، این نسخه از «هیچ محافظتی» به‌مراتب بهتر است
 * و رفتار Brute-force ساده را متوقف می‌کند.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __karimoglu_rate_limit__: Map<string, Bucket> | undefined;
}

const buckets: Map<string, Bucket> = globalThis.__karimoglu_rate_limit__ ?? new Map();
if (process.env.NODE_ENV !== "production") {
  globalThis.__karimoglu_rate_limit__ = buckets;
}

export interface RateLimitOptions {
  /** شناسه منطقی محدودیت — مثلاً "auth:login" */
  key: string;
  /** حداکثر تعداد درخواست مجاز در بازه */
  limit: number;
  /** طول بازه به میلی‌ثانیه */
  windowMs: number;
}

/**
 * شناسه درخواست‌کننده. پشت Proxy/CDN واقعی باید `x-forwarded-for` مقدار
 * درست داشته باشد؛ در نبود آن، همه درخواست‌ها زیر یک سطل مشترک می‌افتند
 * (محافظه‌کارانه — یعنی سخت‌گیرتر، نه شل‌تر).
 */
function clientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(request: Request, options: RateLimitOptions): { limited: false } | { limited: true; retryAfterSeconds: number } {
  const identifier = `${options.key}:${clientIdentifier(request)}`;
  const now = Date.now();
  const bucket = buckets.get(identifier);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + options.windowMs });
    return { limited: false };
  }

  if (bucket.count >= options.limit) {
    return { limited: true, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { limited: false };
}

/** محافظ آماده برای Route Handlerها — در صورت عبور از سقف، پاسخ 429 برمی‌گرداند */
export function enforceRateLimit(request: Request, options: RateLimitOptions): Response | null {
  const result = checkRateLimit(request, options);
  if (!result.limited) return null;
  const response = jsonError(`تعداد درخواست‌ها بیش از حد مجاز است. لطفاً ${result.retryAfterSeconds} ثانیه دیگر تلاش کنید.`, 429);
  response.headers.set("Retry-After", String(result.retryAfterSeconds));
  return response;
}

/** فقط برای تست */
export function __resetRateLimitsForTest(): void {
  buckets.clear();
}
