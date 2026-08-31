"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createUser, getUserByPhone, createTicket, getTicketById, addTicketMessage, reopenTicket } from "@/lib/db";
import { hashPassword, verifyPassword, isValidPhone, normalizePhone } from "@/lib/auth";
import { isStrongPassword, missingPasswordRequirements } from "@/lib/passwordPolicy";
import { USER_COOKIE_NAME, setSessionCookie, getCurrentUser } from "@/lib/session";

export type AccountFormState = {
  ok: boolean;
  message: string;
} | null;

/** فقط مسیرهای داخلی نسبی (با یه اسلش شروع بشن، نه «//» یا «/\») رو به
 *  عنوان مقصد ریدایرکت بعد از ورود/ثبت‌نام قبول می‌کنیم — تا کسی نتونه
 *  با دستکاری فیلد «next» کاربر رو به یه سایت بیرونی بفرسته. */
function safeNextPath(raw: FormDataEntryValue | null): string | null {
  const value = (raw ?? "").toString();
  return /^\/(?!\/|\\)/.test(value) ? value : null;
}

export async function signup(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const name = (formData.get("name") ?? "").toString().trim();
  const phoneRaw = (formData.get("phone") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();
  const confirmPassword = (formData.get("confirmPassword") ?? "").toString();

  if (!name || !phoneRaw || !password || !confirmPassword) {
    return { ok: false, message: "لطفاً همه‌ی فیلدها رو پر کن." };
  }
  if (name.length > 120) {
    return { ok: false, message: "نام خیلی طولانیه." };
  }
  if (!isValidPhone(phoneRaw)) {
    return { ok: false, message: "شماره موبایل معتبر نیست — مثل ۰۹۱۲۳۴۵۶۷۸۹ وارد کن." };
  }
  if (password !== confirmPassword) {
    return { ok: false, message: "رمز عبور و تکرار آن یکسان نیستند." };
  }
  if (!isStrongPassword(password)) {
    const missing = missingPasswordRequirements(password);
    return {
      ok: false,
      message: `رمز عبور باید این موارد رو داشته باشه: ${missing.join("، ")}.`,
    };
  }

  const phone = normalizePhone(phoneRaw);

  if (await getUserByPhone(phone)) {
    return { ok: false, message: "این شماره قبلاً ثبت‌نام کرده — از فرم ورود استفاده کن." };
  }

  const next = safeNextPath(formData.get("next"));

  try {
    const { hash, salt } = hashPassword(password);
    const userId = await createUser({ name, phone, passwordHash: hash, passwordSalt: salt });
    setSessionCookie(userId);
  } catch (err) {
    console.error("signup failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }

  // اگه از یه صفحه‌ی دیگه (مثلاً سفارش) به فرم ثبت‌نام اومده، بعد از
  // ساخت حساب برش می‌گردونیم همونجا؛ وگرنه مثل قبل می‌ره به /account.
  redirect(next ?? "/account");
}

export async function login(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const phoneRaw = (formData.get("phone") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();

  if (!phoneRaw || !password) {
    return { ok: false, message: "شماره تماس و رمز عبور رو وارد کن." };
  }

  const phone = normalizePhone(phoneRaw);
  const user = await getUserByPhone(phone);

  if (!user || !verifyPassword(password, user.password_salt, user.password_hash)) {
    return { ok: false, message: "شماره یا رمز عبور اشتباهه." };
  }

  setSessionCookie(user.id);
  // Admins and developers land straight in /dashboard (their real
  // workspace); this login form doubles as the staff login too — there's
  // no separate admin password anymore.
  if (user.role === "admin" || user.role === "developer") {
    redirect("/dashboard");
  }
  // اگه از یه صفحه‌ی دیگه (مثلاً سفارش) اومده، بعد از ورود برش می‌گردونیم
  // همونجا؛ وگرنه مثل قبل می‌ره به /account.
  const next = safeNextPath(formData.get("next"));
  redirect(next ?? "/account");
}

export async function logout() {
  cookies().delete(USER_COOKIE_NAME);
  redirect("/account");
}

export async function createSupportTicket(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "برای ثبت تیکت اول باید وارد حساب بشی." };
  }

  const subject = (formData.get("subject") ?? "").toString().trim();
  const message = (formData.get("message") ?? "").toString().trim();

  if (!subject || !message) {
    return { ok: false, message: "موضوع و متن تیکت رو پر کن." };
  }
  if (subject.length > 150) {
    return { ok: false, message: "موضوع خیلی طولانیه." };
  }
  if (message.length > 4000) {
    return { ok: false, message: "متن تیکت خیلی طولانیه." };
  }

  try {
    await createTicket({ userId: user.id, subject, message });
  } catch (err) {
    console.error("createSupportTicket failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }

  // Deliberately NOT calling revalidatePath here (this used to call
  // revalidatePath("/account")) — that was the actual cause of the classic
  // "first ticket submitted from /contact shows no confirmation" bug.
  // Any revalidatePath() call inside a Server Action makes Next.js
  // auto-refresh whatever route the user is CURRENTLY on too, not just the
  // path you named. The first time that happens to a given route in a
  // session, the refresh replaces the Client Component tree instead of
  // patching it in place, which throws away whatever local React state
  // (useFormState or plain useState — both) that component had just set
  // in the same tick. TicketForm and the modal it renders got wiped out
  // right as they were about to show. Confirmed end-to-end with a
  // scripted browser submission before/after this change. sendTeamMessage
  // (dashboard/actions.ts) never had this problem because it never calls
  // revalidatePath either — it just re-fetches its own data manually,
  // which is the safe pattern.
  // The only cost of not revalidating: someone's own ticket list on
  // /account can be up to ~30s stale after submitting from elsewhere
  // (Next's default client router-cache window for dynamic routes) —
  // trivial next to a confirmation that silently failed 100% of the time.
  return { ok: true, message: "تیکتت ثبت شد — به‌زودی جواب می‌دیم." };
}

/** A customer adding a follow-up message to their own (already-open or
 *  already-closed) ticket — makes it a real back-and-forth instead of a
 *  one-shot question. Sending a message on a closed ticket reopens it, so
 *  the team notices it needs another look. */
export async function sendTicketMessageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const ticketId = Number(formData.get("ticketId"));
  const message = (formData.get("message") ?? "").toString().trim();
  if (!ticketId || !message || message.length > 4000) return;

  const ticket = await getTicketById(ticketId);
  if (!ticket || ticket.user_id !== user.id) return; // not your ticket

  await addTicketMessage({
    ticketId,
    senderId: user.id,
    senderName: user.name,
    senderRole: "customer",
    message,
  });
  if (ticket.status === "closed") {
    await reopenTicket(ticketId);
  }
  revalidatePath("/account");
  revalidatePath(`/account/tickets/${ticketId}`);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/tickets/${ticketId}`);
}
