import { NextResponse } from "next/server";
import { assertSameOrigin, jsonError } from "@/lib/server/security";
import { enforceRateLimit } from "@/lib/server/rateLimit";
import { createContactMessage, validateContactMessage, type ContactMessageInput } from "@/lib/server/contactRepo";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  // جلوگیری از Spam فرم تماس از یک IP
  const limited = enforceRateLimit(request, { key: "contact:submit", limit: 5, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  let body: Partial<ContactMessageInput>;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  const errors = validateContactMessage(body);
  if (errors.length > 0) {
    return jsonError("اطلاعات وارد‌شده معتبر نیست.", 422, { errors });
  }

  const { id } = await createContactMessage(body as ContactMessageInput);
  return NextResponse.json({ success: true, id });
}
