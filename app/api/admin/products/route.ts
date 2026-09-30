import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { createProduct, listProducts, type ProductInput } from "@/lib/server/productsRepo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";

export async function GET(request: Request) {
  const auth = requirePermission(request, "products.manage");
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const result = listProducts({
    search: url.searchParams.get("q") ?? undefined,
    categoryId: url.searchParams.get("categoryId") ?? undefined,
    status: (url.searchParams.get("status") as "active" | "inactive" | "deleted" | "all" | null) ?? undefined,
    page: Number(url.searchParams.get("page")) || 1,
  });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
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

  const result = createProduct(body, auth.actor);
  if (!result.success) return jsonError(result.error, 422);
  revalidatePath("/", "layout"); // تا صفحه‌های استاتیک فروشگاه فوراً عکس/تغییر جدید را نشان بدهند
  return NextResponse.json({ id: result.id });
}
