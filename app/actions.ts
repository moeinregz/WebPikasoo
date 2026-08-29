"use server";

import { insertInquiry } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export type InquiryFormState = {
  ok: boolean;
  message: string;
} | null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimum gap between two project-request submissions from the same
// account — stops the "submit the same order 100 times in a row" case
// without needing a captcha. In-memory, so it resets on a server restart
// and is per-process; fine for this scale, and cheap to swap for a
// DB/Redis-backed limiter later if this ever runs across many instances.
const SUBMIT_COOLDOWN_MS = 60_000;
const lastSubmitByUser = new Map<number, number>();

export async function submitInquiry(
  _prevState: InquiryFormState,
  formData: FormData
): Promise<InquiryFormState> {
  // Honeypot: a real user never fills this (it's visually hidden). Bots
  // that blindly fill every field will trip it — we pretend success so
  // they don't know to try something else, but we don't save anything.
  const honeypot = (formData.get("company") ?? "").toString();
  if (honeypot.trim() !== "") {
    return { ok: true, message: "درخواستت با موفقیت ثبت شد — به‌زودی جواب می‌دیم." };
  }

  // Submitting a project request requires an account — this is enforced
  // here server-side (not just hidden in the UI) so the form can't be
  // posted to directly while logged out.
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return {
      ok: false,
      message: "برای ثبت درخواست پروژه اول باید وارد حساب کاربریت بشی.",
    };
  }

  // Stops someone (or a stuck double-click) from firing the same request
  // over and over — one project request per account per minute.
  const now = Date.now();
  const lastSubmit = lastSubmitByUser.get(currentUser.id);
  if (lastSubmit && now - lastSubmit < SUBMIT_COOLDOWN_MS) {
    return {
      ok: false,
      message: "همین الان یه درخواست ثبت کردی — یه دقیقه صبر کن و دوباره امتحان کن.",
    };
  }

  const name = (formData.get("name") ?? "").toString().trim();
  const email = (formData.get("email") ?? "").toString().trim();
  const phone = (formData.get("phone") ?? "").toString().trim();
  const projectType = (formData.get("projectType") ?? "").toString().trim();
  const budgetOption = (formData.get("budget") ?? "").toString().trim();
  const budgetCustom = (formData.get("budgetCustom") ?? "").toString().trim();
  const budget = budgetOption === "دلخواه" && budgetCustom ? `دلخواه — ${budgetCustom}` : budgetOption;
  const message = (formData.get("message") ?? "").toString().trim();

  // Email is optional now — only validated (not required) if provided.
  if (!name || !message) {
    return { ok: false, message: "لطفاً نام و توضیح پروژه رو پر کن." };
  }
  if (email && !EMAIL_PATTERN.test(email)) {
    return { ok: false, message: "ایمیلی که وارد کردی معتبر نیست." };
  }
  if (name.length > 120 || email.length > 160 || message.length > 4000 || budget.length > 120) {
    return { ok: false, message: "یکی از فیلدها خیلی طولانیه." };
  }

  try {
    // Link the request to their account so it shows up under
    // "پروژه‌های درخواستی" on their /account dashboard.
    await insertInquiry({ name, email, phone, projectType, budget, message, userId: currentUser.id });
    return {
      ok: true,
      message: "درخواستت با موفقیت ثبت شد — به‌زودی جواب می‌دیم.",
    };
  } catch (err) {
    console.error("submitInquiry failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد. می‌تونی از واتساپ هم پیام بدی." };
  }
}
