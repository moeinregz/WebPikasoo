import { beforeEach, describe, expect, it } from "vitest";
import { __resetDbForTest, db } from "@/lib/db/client";
import { seedDatabaseIfEmpty } from "@/lib/db/seed";
import { canActOnBranch, getActorFromRequest, getSessionUserIdFromRequest, hasPermission, requirePermission } from "../rbac";
import { registerUser, authenticateUser, assignRole } from "../service";
import { createSession, sessionCookieHeader } from "../session";

function requestWithSession(rawToken?: string): Request {
  const headers: Record<string, string> = {};
  if (rawToken) headers["cookie"] = `komoglu_session=${rawToken}`;
  return new Request("http://localhost/api/inventory/adjust", { method: "POST", headers });
}

beforeEach(async () => {
  await __resetDbForTest();
  await seedDatabaseIfEmpty();
});

describe("role → permission mapping", () => {
  it("cashier can view but cannot adjust stock", () => {
    expect(hasPermission("cashier", "inventory.view")).toBe(true);
    expect(hasPermission("cashier", "inventory.adjust")).toBe(false);
  });

  it("warehouse staff can receive/transfer but not adjust branch stock directly", () => {
    expect(hasPermission("warehouse_staff", "inventory.receive")).toBe(true);
    expect(hasPermission("warehouse_staff", "inventory.transfer")).toBe(true);
    expect(hasPermission("warehouse_staff", "inventory.adjust")).toBe(false);
  });

  it("site_admin and ceo have full permissions", () => {
    for (const permission of ["inventory.view", "inventory.adjust", "settings.manage", "audit.view"] as const) {
      expect(hasPermission("site_admin", permission)).toBe(true);
      expect(hasPermission("ceo", permission)).toBe(true);
    }
  });

  it("branch_manager can only act on their own branch", () => {
    const manager = { id: "m1", role: "branch_manager" as const, branchId: "branch-a" };
    expect(canActOnBranch(manager, "branch-a")).toBe(true);
    expect(canActOnBranch(manager, "branch-b")).toBe(false);
  });
});

// سناریو ۱۵ (Prompt 9) و بخش ۱۱/۱۲ Prompt 10: احراز هویت واقعی + RBAC واقعی
describe("session-based actor resolution (real auth, not client-trusted headers)", () => {
  it("rejects a request with no session cookie", async () => {
    const request = requestWithSession();
    expect(await getActorFromRequest(request)).toBeNull();
    const result = await requirePermission(request, "inventory.adjust");
    expect("error" in result).toBe(true);
  });

  it("rejects a forged/unknown session token", async () => {
    const request = requestWithSession("this-token-does-not-exist");
    expect(await getActorFromRequest(request)).toBeNull();
  });

  it("a client can no longer claim a role via headers — only a real session determines it", async () => {
    // ثبت‌نام یک کاربر عادی (بدون هیچ نقش ادمینی)
    const registration = await registerUser("09121234567", "SuperSecret123");
    expect(registration.success).toBe(true);
    if (!registration.success) return;

    const session = await createSession(registration.user.id);
    const request = new Request("http://localhost/api/inventory/adjust", {
      method: "POST",
      // مهاجم سعی می‌کند با هدر جعلی خودش را site_admin معرفی کند —
      // این هدرها دیگر اصلاً خوانده نمی‌شوند.
      headers: {
        cookie: `komoglu_session=${session.rawToken}`,
        "x-actor-role": "site_admin",
        "x-actor-id": "attacker-controlled",
      },
    });

    // کاربر واقعی است (Session معتبر) اما هیچ نقشی در user_roles ندارد
    expect(await getActorFromRequest(request)).toBeNull();
    const result = await requirePermission(request, "inventory.adjust");
    expect("error" in result).toBe(true);
  });

  it("resolves the real role from the database once a role is assigned", async () => {
    const registration = await registerUser("09121234568", "SuperSecret123");
    if (!registration.success) throw new Error("setup failed");
    await assignRole(registration.user.id, "branch_manager", "satarkhan");

    const session = await createSession(registration.user.id);
    const request = new Request("http://localhost/api/inventory/adjust", {
      method: "POST",
      headers: { cookie: `komoglu_session=${session.rawToken}` },
    });

    const actor = await getActorFromRequest(request);
    expect(actor).toEqual({ id: registration.user.id, role: "branch_manager", branchId: "satarkhan" });

    const result = await requirePermission(request, "inventory.adjust");
    expect("actor" in result).toBe(true);
  });

  it("an expired session is treated as unauthenticated", async () => {
    const registration = await registerUser("09121234569", "SuperSecret123");
    if (!registration.success) throw new Error("setup failed");
    await assignRole(registration.user.id, "site_admin");
    const session = await createSession(registration.user.id);

    // شبیه‌سازی انقضا: مستقیماً expires_at را به گذشته می‌بریم
    await db.prepare("UPDATE sessions SET expires_at = ? WHERE token_hash = (SELECT token_hash FROM sessions WHERE user_id = ?)").run(
      new Date(Date.now() - 1000).toISOString(),
      registration.user.id,
    );

    const request = new Request("http://localhost/", { headers: { cookie: `komoglu_session=${session.rawToken}` } });
    expect(await getActorFromRequest(request)).toBeNull();
  });

  it("logging in with the wrong password fails", async () => {
    await registerUser("09121234570", "CorrectPassword1");
    const attempt = await authenticateUser("09121234570", "WrongPassword");
    expect(attempt.success).toBe(false);
  });

  /**
   * تست رگرسیون برای باگی که در تست دستی Prompt 11 پیدا شد: «لاگین بودن» با
   * «داشتن نقش ادمین» یکی نیست. یک مشتری عادی (بدون نقش) باید Session
   * معتبر داشته باشد — حتی اگر `getActorFromRequest` برای او (به‌درستی)
   * null برگرداند.
   */
  it("a logged-in customer without an admin role still has a valid session (but no actor)", async () => {
    const registration = await registerUser("09121234571", "SuperSecret123");
    if (!registration.success) throw new Error("setup failed");
    const session = await createSession(registration.user.id);
    const request = new Request("http://localhost/api/auth/me", {
      headers: { cookie: `komoglu_session=${session.rawToken}` },
    });

    expect(await getSessionUserIdFromRequest(request)).toBe(registration.user.id); // لاگین هست
    expect(await getActorFromRequest(request)).toBeNull(); // ولی نقش ادمین ندارد
  });

  it("the seeded default admin can authenticate and has site_admin permissions", async () => {
    const attempt = await authenticateUser("09120000000", "ChangeMe123!");
    expect(attempt.success).toBe(true);
  });
});
