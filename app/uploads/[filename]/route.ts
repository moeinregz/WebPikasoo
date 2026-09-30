import { readUploadedImage } from "@/lib/server/uploads";

export const dynamic = "force-dynamic";

/** سرو عکس‌های آپلودشده (نام فایل UUID است و هرگز تغییر نمی‌کند، پس Cache طولانی امن است) */
export async function GET(_request: Request, { params }: { params: { filename: string } }) {
  const file = await readUploadedImage(params.filename);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(file.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
