"use server";

import { insertInquiry } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { allowAndCooldown } from "@/lib/redis";

export type InquiryFormState = {
  ok: boolean;
  message: string;
} | null;

export type PlanOrderState = {
  ok: boolean;
  message: string;
} | null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimum gap between two project-request submissions from the same
// account — stops the "submit the same order 100 times in a row" case
// without needing a captcha. Backed by Redis (lib/redis.ts) so the limit
// is shared across every serverless instance; falls back to a local
// in-memory check with the same effect when REDIS_URL isn't configured.
const SUBMIT_COOLDOWN_MS = 60_000;

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
  const allowed = await allowAndCooldown(`inquiry:${currentUser.id}`, SUBMIT_COOLDOWN_MS);
  if (!allowed) {
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

// Same per-account cooldown idea as submitInquiry above, kept as a
// separate key/window since this is a different, much lighter-weight
// action (one click on a plan card, no form to fill) — stops a
// double-click (or someone mashing the button) from creating duplicate
// orders without blocking a legitimate second order a few seconds later
// being confused with a stuck request. Backed by Redis, same as above.
const PLAN_ORDER_COOLDOWN_MS = 10_000;

/** Fired straight from a plan card's "سفارش این پلن" button (see
 *  PricingPlans.tsx) — no form to fill. Requires login (checked here,
 *  server-side, same as submitInquiry) and, when logged in, builds the
 *  order entirely from the account's own name/phone plus the clicked
 *  plan's details, then saves it as a normal inquiry so it shows up
 *  under "سفارش‌ها" in /dashboard exactly like a contact-form submission
 *  would. */
export async function submitPlanOrder(input: {
  categoryLabel: string;
  categoryProjectType: string;
  planName: string;
  planPrice: string;
  planUnit: string;
  planFeatures: string[];
}): Promise<PlanOrderState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return {
      ok: false,
      message: "برای ثبت سفارش اول باید وارد حساب کاربریت بشی.",
    };
  }

  // A double-click (or a resubmit while the first request is still in
  // flight) hits this before the insert below — we pretend success
  // instead of erroring, since the first click already placed the order.
  const allowed = await allowAndCooldown(`plan-order:${currentUser.id}`, PLAN_ORDER_COOLDOWN_MS);
  if (!allowed) {
    return { ok: true, message: "خرید شما با موفقیت انجام شد." };
  }

  const { categoryLabel, categoryProjectType, planName, planPrice, planUnit, planFeatures } = input;
  const budget = `${planPrice} ${planUnit}`.trim();
  const message = [
    `سفارش پلن «${planName}» از دسته‌ی «${categoryLabel}»`,
    "",
    "امکانات پلن:",
    ...planFeatures.map((f) => `- ${f}`),
  ].join("\n");

  try {
    await insertInquiry({
      name: currentUser.name,
      phone: currentUser.phone,
      projectType: categoryProjectType,
      budget,
      message,
      userId: currentUser.id,
    });
    return { ok: true, message: "خرید شما با موفقیت انجام شد." };
  } catch (err) {
    console.error("submitPlanOrder failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد. دوباره امتحان کن یا از واتساپ پیام بده." };
  }
}
