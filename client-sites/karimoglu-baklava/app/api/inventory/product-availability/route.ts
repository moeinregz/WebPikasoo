import { NextResponse } from "next/server";
import { branches } from "@/lib/mock-data";
import { isBranchActive } from "@/lib/branch-selection/workingHoursService";
import { getBranchAvailableQuantity } from "@/lib/inventory/core";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

interface AvailabilityBody {
  productId?: string;
  variantId?: string;
  city?: "تهران" | "همدان" | null;
}

/**
 * وضعیت موجودی «قابل نمایش به مشتری» برای صفحه محصول (`BranchAvailability`).
 * طبق الزام صریح «اطلاعات حساس موجودی داخلی را در اختیار کاربر قرار نده»،
 * این Route هرگز عدد دقیق موجودی را برنمی‌گرداند — فقط این‌که آیا حداقل یک
 * شعبه فعال (در صورت مشخص‌بودن شهر، محدود به همان شهر) موجودی کافی دارد یا
 * نه، به‌همراه نام همان شعبه (که خودش داده عمومی است، نه داده داخلی موجودی).
 */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  let body: AvailabilityBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (!body.productId || !body.variantId) {
    return jsonError("شناسه محصول و نوع محصول (Variant) الزامی است.", 400);
  }

  const candidateBranches = branches.filter((b) => isBranchActive(b) && (!body.city || b.city === body.city));

  let matched: (typeof candidateBranches)[number] | undefined;
  for (const b of candidateBranches) {
    if ((await getBranchAvailableQuantity(b.id, body.productId!, body.variantId!)) > 0) {
      matched = b;
      break;
    }
  }

  if (!matched) {
    return NextResponse.json({ status: "unavailable" as const, branchName: null });
  }

  return NextResponse.json({ status: "resolved" as const, branchName: matched.name });
}
