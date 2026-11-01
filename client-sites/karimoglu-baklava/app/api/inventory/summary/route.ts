import { NextResponse } from "next/server";
import { getInventorySummary } from "@/lib/inventory/core";
import { requirePermission } from "@/lib/inventory/rbac";

/** «نمای کلی موجودی» پنل مدیریت — Dashboard */
export async function GET(request: Request) {
  const auth = await requirePermission(request, "inventory.view");
  if ("error" in auth) return auth.error;

  return NextResponse.json(await getInventorySummary());
}
