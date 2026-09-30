import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { getProductById, softDeleteProduct, updateProduct, type ProductInput } from "@/lib/server/productsRepo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(request, "products.manage");
  if ("error" in auth) return auth.error;

  const product = getProductById(params.id);
  if (!product) return jsonError("محصول یافت نشد.", 404);
  return NextResponse.json({ product });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = requirePermission(request, "products.manage");
  if ("error" in auth) return auth.error;

  let body: ProductInput;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  const result = updateProduct(params.id, body, auth.actor);
  if (!result.success) return jsonError(result.error, 422);
  revalidatePath("/", "layout");
  return NextResponse.json({ success: true });
}

/** حذف منطقی (Soft Delete) — طبق الزام صریح Prompt 11، هرگز DELETE فیزیکی نیست */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = requirePermission(request, "products.manage");
  if ("error" in auth) return auth.error;

  softDeleteProduct(params.id, auth.actor);
  revalidatePath("/", "layout");
  return NextResponse.json({ success: true });
}
