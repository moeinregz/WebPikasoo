import { NextResponse } from "next/server";
import { getActorFromRequest, getSessionUserIdFromRequest } from "@/lib/auth/rbac";
import { getUserById } from "@/lib/auth/service";

/**
 * وضعیت کاربر فعلی. نکته مهم (باگی که در تست Prompt 11 پیدا و رفع شد):
 * «لاگین بودن» و «داشتن نقش ادمین» دو چیز متفاوت‌اند. نسخه قبلی این Route
 * از `getActorFromRequest` استفاده می‌کرد که فقط برای کاربرانِ دارای نقش
 * ادمین مقدار برمی‌گرداند — در نتیجه یک مشتری عادیِ کاملاً لاگین‌شده
 * اشتباهاً `authenticated: false` می‌گرفت. حالا احراز هویت از خود Session
 * خوانده می‌شود و نقش (در صورت وجود) جداگانه اضافه می‌شود.
 */
export async function GET(request: Request) {
  const userId = await getSessionUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ authenticated: false });

  const user = await getUserById(userId);
  const actor = await getActorFromRequest(request); // فقط اگر نقش ادمین داشته باشد، مقدار دارد

  return NextResponse.json({
    authenticated: true,
    userId,
    mobile: user?.mobile ?? null,
    name: user?.name ?? null,
    role: actor?.role ?? null,
    branchId: actor?.branchId ?? null,
  });
}
