import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { assertSameOrigin, jsonError } from "@/lib/server/security";
import { MAX_UPLOAD_BYTES, saveUploadedImage } from "@/lib/server/uploads";

export const dynamic = "force-dynamic";

/** آپلود یک یا چند عکس محصول (فیلد `files` در multipart/form-data) */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = requirePermission(request, "products.manage");
  if ("error" in auth) return auth.error;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("درخواست آپلود نامعتبر است.", 400);
  }

  const files = form.getAll("files").filter((f): f is File => typeof f !== "string");
  if (files.length === 0) return jsonError("هیچ فایلی انتخاب نشده است.", 400);
  if (files.length > 10) return jsonError("در هر بار حداکثر ۱۰ عکس می‌توانید آپلود کنید.", 400);

  const urls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_UPLOAD_BYTES) return jsonError(`«${file.name}» بیشتر از ۵ مگابایت است.`, 413);
    const result = await saveUploadedImage(Buffer.from(await file.arrayBuffer()));
    if ("error" in result) return jsonError(`«${file.name}»: ${result.error}`, 422);
    urls.push(result.url);
  }
  return NextResponse.json({ urls });
}
