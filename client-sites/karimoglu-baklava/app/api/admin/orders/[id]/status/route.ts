import { NextResponse } from "next/server";
import { canActOnBranch, requirePermission } from "@/lib/auth/rbac";
import { getOrderById, setOrderStatusWithActor } from "@/lib/server/orderRepo";
import type { OrderStatus } from "@/lib/types";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "payment_pending",
  "paid",
  "processing",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "failed",
];

// وضعیت‌های پایانی — طبق تعریف خودِ چرخه سفارش (لیست بالا، Prompt 11)، این سه
// وضعیت طبیعتاً پایان مسیر سفارش هستند. این تنها قانون Transition است که این
// مرحله (Prompt 14 — QA) اضافه می‌کند؛ چون کاملاً تعریفی/بی‌ابهام است (هیچ
// سیستم فروش واقعی سفارش تحویل‌شده/لغوشده/ناموفق را دوباره «باز» نمی‌کند) و
// نیازی به حدس زدن قوانین کسب‌وکار ندارد.
//
// ⚠️ یافته QA این مرحله (نه اصلاح‌شده، چون نیاز به تصمیم محصول دارد): این
// Route فقط بررسی می‌کند وضعیت درخواستی *یکی از مقادیر مجاز Enum* باشد، اما
// گراف کامل Transitionهای مجاز بین وضعیت‌های میانی (مثلاً آیا می‌توان از
// «آماده» مستقیم به «تحویل‌شده» پرید، یا از «در حال پردازش» به «در حال
// آماده‌سازی» برگشت؟) هیچ‌جای پروژه تعریف نشده. این تصمیم کسب‌وکار جداگانه‌ای
// است که این مرحله عمداً اختراع نکرده — در گزارش پایانی ثبت شده.
const TERMINAL_STATUSES: OrderStatus[] = ["delivered", "cancelled", "failed"];

/**
 * تغییر وضعیت سفارش — طبق الزام صریح Prompt 11 («تغییر وضعیت باید
 * Permission-based باشد»). دسترسی: `orders.update_status`. مدیر شعبه فقط
 * می‌تواند وضعیت سفارش‌های همان شعبه را تغییر دهد (Defense in Depth —
 * صرفاً مخفی‌کردن دکمه در UI کافی نیست).
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requirePermission(request, "orders.update_status");
  if ("error" in auth) return auth.error;

  const order = await getOrderById(params.id);
  if (!order) return jsonError("سفارش یافت نشد.", 404);

  if (!canActOnBranch(auth.actor, order.branchId)) {
    return jsonError("شما فقط به سفارش‌های شعبه خودتان دسترسی دارید.", 403);
  }

  let body: { status?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (!body.status || !VALID_STATUSES.includes(body.status as OrderStatus)) {
    return jsonError("وضعیت نامعتبر است.", 400);
  }

  if (TERMINAL_STATUSES.includes(order.status) && order.status !== body.status) {
    return jsonError(
      `سفارش در وضعیت پایانی «${order.status}» است و نمی‌تواند به وضعیت دیگری تغییر کند.`,
      409,
    );
  }

  await setOrderStatusWithActor(order.id, body.status as OrderStatus, { id: auth.actor.id, role: auth.actor.role }, body.note);
  const updated = await getOrderById(order.id);
  return NextResponse.json({ order: updated });
}
