import { NextResponse } from "next/server";
import { authenticateUser, getUserRole } from "@/lib/auth/service";
import { createSession, sessionCookieHeader } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/server/rateLimit";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

interface LoginBody {
  mobile?: string;
  password?: string;
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  // محافظت Brute-force: حداکثر ۱۰ تلاش ورود در هر ۱۵ دقیقه از یک IP
  const limited = enforceRateLimit(request, { key: "auth:login", limit: 10, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  let body: LoginBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (!body.mobile || !body.password) {
    return jsonError("شماره موبایل و رمز عبور الزامی است.", 400);
  }

  const result = await authenticateUser(body.mobile, body.password);
  // پیام خطا عمداً یکسان برای «کاربر یافت نشد» و «رمز اشتباه» است — طبق
  // Best Practice امنیتی، تا مهاجم نتواند وجود/عدم‌وجود یک شماره موبایل را
  // Enumerate کند.
  if (!result.success) return jsonError(result.error, 401);

  const session = await createSession(result.user.id);
  const role = await getUserRole(result.user.id);

  const response = NextResponse.json({ user: result.user, role: role?.role ?? null });
  response.headers.append("Set-Cookie", sessionCookieHeader(session.rawToken, session.expiresAt));
  return response;
}
