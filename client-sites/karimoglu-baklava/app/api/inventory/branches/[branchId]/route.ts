import { NextResponse } from "next/server";
import { branches } from "@/lib/mock-data";
import { getBranchInventoryOverview } from "@/lib/inventory/core";
import { requirePermission } from "@/lib/inventory/rbac";
import { jsonError } from "@/lib/server/security";

/**
 * دریافت موجودی کامل یک شعبه — برای بخش «موجودی شعبه» پنل مدیریت.
 * دسترسی: `inventory.view` (مدیر شعبه فقط باید UI سمت خودش را به همین شعبه
 * محدود کند؛ چون این یک Endpoint فقط-خواندنی است و داده حساس مشتری ندارد،
 * محدودیت Scope شعبه‌ای اینجا سخت‌گیرانه اعمال نشده — فقط برای عملیات
 * تغییردهنده مثل `inventory.adjust` اعمال می‌شود).
 */
export async function GET(request: Request, { params }: { params: { branchId: string } }) {
  const auth = await requirePermission(request, "inventory.view");
  if ("error" in auth) return auth.error;

  const branch = branches.find((b) => b.id === params.branchId);
  if (!branch) return jsonError("شعبه یافت نشد.", 404);

  const items = await getBranchInventoryOverview(params.branchId);
  return NextResponse.json({ branchId: branch.id, branchName: branch.name, items });
}
