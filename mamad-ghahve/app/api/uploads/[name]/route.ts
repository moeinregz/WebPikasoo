import fs from "fs";
import path from "path";

const DIR = path.resolve(process.cwd(), "data/uploads");
const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif" };

export async function GET(_req: Request, { params }: { params: { name: string } }) {
  const name = path.basename(params.name);
  const ext = path.extname(name).toLowerCase();
  const file = path.join(DIR, name);
  if (!TYPES[ext] || !fs.existsSync(file)) return new Response("Not found", { status: 404 });
  return new Response(fs.readFileSync(file), {
    headers: { "Content-Type": TYPES[ext], "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
