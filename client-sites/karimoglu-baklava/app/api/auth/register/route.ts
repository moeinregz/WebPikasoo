import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth/service";
import { createSession, sessionCookieHeader } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/server/rateLimit";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

interface RegisterBody {
  mobile?: string;
  password?: string;
  name?: string;
}

/**
 * ثبت‌نام مشتری با موبایل+رمز عبور — طبق توضیح صریح در `lib/auth/service.ts`
 * درباره این‌که چرا صرفِ شماره موبایل (بدون OTP) برای احراز هویت کافی نیست.
 * این کاربر عادی است، نه ادمین — هیچ ردیفی در `user_roles` برایش ساخته
 * نمی‌شود (بنابراین به هیچ بخش پنل مدیریت دسترسی ندارد).
 */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  // جلوگیری از ساخت انبوه حساب کاربری از یک IP
  const limited = enforceRateLimit(request, { key: "auth:register", limit: 5, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  let body: RegisterBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (!body.mobile || !body.password) {
    return jsonError("شماره موبایل و رمز عبور الزامی است.", 400);
  }

  const result = await registerUser(body.mobile, body.password, body.name);
  if (!result.success) return jsonError(result.error, 422);

  const session = await createSession(result.user.id);
  const response = NextResponse.json({ user: result.user });
  response.headers.append("Set-Cookie", sessionCookieHeader(session.rawToken, session.expiresAt));
  return response;
}
