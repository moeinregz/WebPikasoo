import { randomUUID } from "crypto";
import { db } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "./passwords";
import type { Role } from "./rbac";

/**
 * ===== احراز هویت با موبایل (Prompt 10، بخش ۱۱) =====
 *
 * ⚠️ تناقض صریحی که باید قبل از پیاده‌سازی توضیح داده شود (طبق قانون ۱۷
 * Prompt ۱: «اگر تناقض داشت، بدون تصمیم‌گیری کورکورانه توضیح بده»):
 * «ورود با موبایل» طبق تعریف معمول یعنی احراز هویت با شماره موبایل +
 * کدی که برای همان شماره ارسال می‌شود (OTP). اما همین Prompt صریحاً می‌گوید
 * «فعلاً OTP را فعال نکن». بدون OTP، «ورود با موبایل» به‌تنهایی هیچ اثبات
 * مالکیت شماره را تضمین نمی‌کند — یعنی اگر فقط با وارد کردن یک شماره
 * موبایل Login انجام شود، هرکسی می‌تواند با شماره موبایل شخص دیگری وارد
 * حساب او شود (Account Takeover). این یک حفره امنیتی است، نه یک جزئیات کوچک.
 *
 * راهکار انتخاب‌شده (مستند و توضیح داده‌شده، نه حدس بی‌دلیل): شماره موبایل
 * به‌عنوان «نام کاربری» استفاده می‌شود، اما ورود همچنان به یک Password نیاز
 * دارد (دقیقاً طبق بخش ۱۱ که می‌گوید «اگر Password وجود دارد باید Hash شود»
 * — یعنی خود Prompt امکان وجود Password را پیش‌بینی کرده است). وقتی OTP در
 * آینده فعال شود، می‌تواند به‌عنوان یک روش ورود جایگزین (نه جایگزین کامل)
 * در کنار Password اضافه شود، بدون تغییر در ساختار جدول `users`.
 */

export interface AuthUser {
  id: string;
  mobile: string;
  name: string | null;
}

interface UserRow {
  id: string;
  mobile: string;
  name: string | null;
  password_hash: string | null;
}

export async function findUserByMobile(mobile: string): Promise<UserRow | undefined> {
  return await db.prepare("SELECT * FROM users WHERE mobile = ?").get(mobile) as UserRow | undefined;
}

export async function registerUser(mobile: string, password: string, name?: string): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  if (!/^09\d{9}$/.test(mobile)) {
    return { success: false, error: "شماره موبایل نامعتبر است (فرمت مورد انتظار: 09xxxxxxxxx)." };
  }
  if (password.length < 8) {
    return { success: false, error: "رمز عبور باید حداقل ۸ کاراکتر باشد." };
  }
  if (await findUserByMobile(mobile)) {
    return { success: false, error: "کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است." };
  }

  const id = randomUUID();
  await db.prepare("INSERT INTO users (id, mobile, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)").run(
    id,
    mobile,
    name ?? null,
    hashPassword(password),
    new Date().toISOString(),
  );

  return { success: true, user: { id, mobile, name: name ?? null } };
}

export async function authenticateUser(mobile: string, password: string): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  const row = await findUserByMobile(mobile);
  if (!row || !row.password_hash) {
    return { success: false, error: "شماره موبایل یا رمز عبور اشتباه است." };
  }
  if (!verifyPassword(password, row.password_hash)) {
    return { success: false, error: "شماره موبایل یا رمز عبور اشتباه است." };
  }
  return { success: true, user: { id: row.id, mobile: row.mobile, name: row.name } };
}

export async function getUserById(userId: string): Promise<AuthUser | undefined> {
  const row = await db.prepare("SELECT id, mobile, name FROM users WHERE id = ?").get(userId) as AuthUser | undefined;
  return row;
}

/** انتساب نقش ادمین به یک کاربر — عملیاتی حساس، فقط باید توسط site_admin/ceo فراخوانی شود (کنترل دسترسی در Route Handler) */
export async function assignRole(userId: string, role: Role, branchId?: string | null): Promise<void> {
  await db.prepare("INSERT INTO user_roles (user_id, role_id, branch_id) VALUES (?, ?, ?) ON CONFLICT (user_id, role_id) DO UPDATE SET branch_id = EXCLUDED.branch_id").run(
    userId,
    role,
    branchId ?? null,
  );
}

export async function getUserRole(userId: string): Promise<{ role: Role; branchId: string | null } | undefined> {
  return await db.prepare("SELECT role_id as role, branch_id as \"branchId\" FROM user_roles WHERE user_id = ?").get(userId) as
    | { role: Role; branchId: string | null }
    | undefined;
}
