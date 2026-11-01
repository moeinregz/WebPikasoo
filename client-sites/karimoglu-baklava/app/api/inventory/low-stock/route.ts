import { NextResponse } from "next/server";
import { getLowStockItems } from "@/lib/inventory/core";
import { requirePermission } from "@/lib/inventory/rbac";

/** محصولات کم‌موجودی/ناموجود — برای «نمای کلی موجودی» پنل مدیریت */
export async function GET(request: Request) {
  const auth = await requirePermission(request, "inventory.view");
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const branchId = url.searchParams.get("branchId") ?? undefined;

  const items = await getLowStockItems(branchId);
  return NextResponse.json({ items });
}
