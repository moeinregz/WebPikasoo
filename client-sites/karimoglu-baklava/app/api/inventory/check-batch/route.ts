import { NextResponse } from "next/server";
import { branches } from "@/lib/mock-data";
import { checkCartAvailabilityForBranches } from "@/lib/inventory/core";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

interface CheckBatchBody {
  branchIds?: string[];
  items?: { productId: string; variantId: string; quantity: number }[];
}

/**
 * بررسی Batch موجودی چند شعبه هم‌زمان برای یک سبد — طبق الزام صریح
 * «سرویس مناسب برای بررسی Batch موجودی، بدون N+1». عمدتاً برای مصرف داخلی
 * (ابزار پشتیبانی/دیباگ پنل مدیریت)؛ مسیر اصلی انتخاب شعبه (Checkout واقعی)
 * مستقیماً از `checkCartAvailabilityForBranches` در `branchSelectionService`
 * استفاده می‌کند، نه از این Route. داده حساس داخلی ندارد؛ فقط از Same-origin
 * محافظت شده، بدون نیاز به RBAC.
 */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  let body: CheckBatchBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return jsonError("لیست اقلام سبد الزامی است.", 400);
  }

  const branchIds = body.branchIds?.length ? body.branchIds : branches.map((b) => b.id);
  const resultMap = await checkCartAvailabilityForBranches(branchIds, body.items);

  const results = Object.fromEntries(resultMap.entries());
  return NextResponse.json({ results });
}
