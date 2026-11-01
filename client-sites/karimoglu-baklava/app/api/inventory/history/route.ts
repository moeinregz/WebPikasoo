import { NextResponse } from "next/server";
import { getTransactionHistory } from "@/lib/inventory/core";
import { requirePermission } from "@/lib/inventory/rbac";
import type { InventoryTransactionType } from "@/lib/inventory/types";

/**
 * تاریخچه/Audit موجودی — دسترسی: `inventory.history.view`.
 * فیلترها طبق بخش «فیلترها» Prompt 9: شعبه، محصول، Variant، سفارش، نوع
 * تراکنش، بازیگر، بازه تاریخ.
 */
export async function GET(request: Request) {
  const auth = await requirePermission(request, "inventory.history.view");
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");

  const transactions = await getTransactionHistory({
    branchId: url.searchParams.get("branchId") ?? undefined,
    productId: url.searchParams.get("productId") ?? undefined,
    variantId: url.searchParams.get("variantId") ?? undefined,
    orderId: url.searchParams.get("orderId") ?? undefined,
    type: (url.searchParams.get("type") as InventoryTransactionType | null) ?? undefined,
    actorId: url.searchParams.get("actorId") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    limit: limitParam ? Number(limitParam) : 100,
  });

  return NextResponse.json({ transactions });
}
