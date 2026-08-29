import { cookies } from "next/headers";
import { getUserById, getUserPermissions } from "@/lib/db";
import { createSessionToken, verifySessionToken } from "@/lib/auth";

export const USER_COOKIE_NAME = "webpikaso_user_session";

/** Reads the session cookie and returns the logged-in user, or null.
 *  Safe to call from Server Components (read-only cookie access). Async
 *  because it looks the user up in MongoDB — every caller must `await` it. */
export async function getCurrentUser() {
  const token = cookies().get(USER_COOKIE_NAME)?.value;
  const userId = verifySessionToken(token);
  if (!userId) return null;
  const user = await getUserById(userId);
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    createdAt: user.created_at,
    role: user.role,
    title: user.title,
    isAdmin: user.role === "admin",
    isStaff: user.role === "admin" || user.role === "developer",
    // For 'developer' accounts, controls which /dashboard tabs they see
    // (set by an admin from the "تیم برنامه‌نویسی" tab). Always full
    // access for 'admin'.
    permissions: getUserPermissions(user),
  };
}

export function setSessionCookie(userId: number) {
  cookies().set(USER_COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}
