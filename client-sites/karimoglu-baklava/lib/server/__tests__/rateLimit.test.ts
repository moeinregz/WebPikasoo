import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, __resetRateLimitsForTest } from "../rateLimit";

function requestFrom(ip: string): Request {
  return new Request("http://localhost/api/auth/login", { method: "POST", headers: { "x-forwarded-for": ip } });
}

beforeEach(() => {
  __resetRateLimitsForTest();
});

describe("rate limiting (Prompt 11 §18 — brute force protection)", () => {
  it("allows requests up to the limit", () => {
    for (let i = 0; i < 3; i += 1) {
      expect(checkRateLimit(requestFrom("1.1.1.1"), { key: "test", limit: 3, windowMs: 60_000 }).limited).toBe(false);
    }
  });

  it("blocks the request that exceeds the limit", () => {
    const options = { key: "test", limit: 3, windowMs: 60_000 };
    for (let i = 0; i < 3; i += 1) checkRateLimit(requestFrom("2.2.2.2"), options);
    const blocked = checkRateLimit(requestFrom("2.2.2.2"), options);
    expect(blocked.limited).toBe(true);
    if (blocked.limited) expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks each client IP independently", () => {
    const options = { key: "test", limit: 2, windowMs: 60_000 };
    checkRateLimit(requestFrom("3.3.3.3"), options);
    checkRateLimit(requestFrom("3.3.3.3"), options);
    expect(checkRateLimit(requestFrom("3.3.3.3"), options).limited).toBe(true);
    // یک IP دیگر نباید تحت تأثیر باشد
    expect(checkRateLimit(requestFrom("4.4.4.4"), options).limited).toBe(false);
  });

  it("tracks separate limit keys independently", () => {
    const ip = "5.5.5.5";
    checkRateLimit(requestFrom(ip), { key: "login", limit: 1, windowMs: 60_000 });
    expect(checkRateLimit(requestFrom(ip), { key: "login", limit: 1, windowMs: 60_000 }).limited).toBe(true);
    expect(checkRateLimit(requestFrom(ip), { key: "register", limit: 1, windowMs: 60_000 }).limited).toBe(false);
  });

  it("resets the counter after the window expires", () => {
    const options = { key: "test", limit: 1, windowMs: 1 }; // پنجره ۱ میلی‌ثانیه‌ای
    checkRateLimit(requestFrom("6.6.6.6"), options);
    // صبر کوتاه تا پنجره منقضی شود
    const start = Date.now();
    while (Date.now() - start < 5) {
      /* busy wait — عمداً سینک، چون تست باید قطعی باشد */
    }
    expect(checkRateLimit(requestFrom("6.6.6.6"), options).limited).toBe(false);
  });
});
