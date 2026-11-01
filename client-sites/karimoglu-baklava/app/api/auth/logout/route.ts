import { NextResponse } from "next/server";
import { destroySessionByRawToken, SESSION_COOKIE_NAME, clearSessionCookieHeader } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/server/security";

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const token = readCookie(request, SESSION_COOKIE_NAME);
  if (token) await destroySessionByRawToken(token);

  const response = NextResponse.json({ success: true });
  response.headers.append("Set-Cookie", clearSessionCookieHeader());
  return response;
}
