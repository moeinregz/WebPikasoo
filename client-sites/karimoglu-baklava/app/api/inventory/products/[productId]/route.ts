import { NextResponse } from "next/server";
import { getProductDetailById } from "@/lib/server/catalog";
import { getProductStockAcrossBranches } from "@/lib/inventory/core";
import { requirePermission } from "@/lib/inventory/rbac";
import { jsonError } from "@/lib/server/security";

/** خلاصه موجودی یک محصول در تمام شعب — برای «خلاصه موجودی محصول» */
export async function GET(request: Request, { params }: { params: { productId: string } }) {
  const auth = await requirePermission(request, "inventory.view");
  if ("error" in auth) return auth.error;

  const product = await getProductDetailById(params.productId);
  if (!product) return jsonError("محصول یافت نشد.", 404);

  const url = new URL(request.url);
  const variantId = url.searchParams.get("variantId") ?? undefined;

  const byBranch = await getProductStockAcrossBranches(params.productId, variantId);
  const totalAvailable = byBranch.reduce((sum, r) => sum + r.available, 0);

  return NextResponse.json({
    productId: product.id,
    productName: product.name,
    totalAvailable,
    byBranch,
  });
}
