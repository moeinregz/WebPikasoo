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

  // درخواست مشاوره‌ی رایگان نباید مشروط به داشتن حساب کاربری باشه — این
  // خودش یه مانع اضافه‌ی بی‌دلیل جلوی اولین قدم (کم‌ریسک‌ترین قدم) کاربره.
  // اگه کاربر لاگین باشه، درخواست به حسابش لینک می‌شه (برای دیدن تو
  // /account)؛ در غیر این صورت هم به‌عنوان مهمون ثبت می‌شه.
  const currentUser = await getCurrentUser();

  // Stops someone (or a stuck double-click) from firing the same request
  // over and over. Keyed by account id when logged in, otherwise by the
  // phone number they entered (falls back to name) so anonymous
  // submissions still get a per-person cooldown instead of none at all.
  const name = (formData.get("name") ?? "").toString().trim();
  const email = (formData.get("email") ?? "").toString().trim();
  const phone = (formData.get("phone") ?? "").toString().trim();
  const projectType = (formData.get("projectType") ?? "").toString().trim();
  const budgetOption = (formData.get("budget") ?? "").toString().trim();
  const budgetCustom = (formData.get("budgetCustom") ?? "").toString().trim();
  const budget = budgetOption === "دلخواه" && budgetCustom ? `دلخواه — ${budgetCustom}` : budgetOption;
  const message = (formData.get("message") ?? "").toString().trim();

  const cooldownKey = currentUser ? `inquiry:${currentUser.id}` : `inquiry:guest:${phone || name}`;
  const allowed = await allowAndCooldown(cooldownKey, SUBMIT_COOLDOWN_MS);
  if (!allowed) {
    return {
      ok: false,
      message: "همین الان یه درخواست ثبت کردی — یه دقیقه صبر کن و دوباره امتحان کن.",
    };
  }

  // نام، شماره تماس و توضیح کوتاه — کمترین اطکاک برای شروع؛ ایمیل و بودجه
  // اختیاری‌ان و فقط وقتی وارد بشن اعتبارسنجی می‌شن.
  if (!name || !phone || !message) {
    return { ok: false, message: "لطفاً نام، شماره تماس و توضیح کوتاه پروژه رو پر کن." };
  }
  if (email && !EMAIL_PATTERN.test(email)) {
    return { ok: false, message: "ایمیلی که وارد کردی معتبر نیست." };
  }
  if (name.length > 120 || email.length > 160 || message.length > 4000 || budget.length > 120) {
    return { ok: false, message: "یکی از فیلدها خیلی طولانیه." };
  }

  try {
    // وقتی لاگین باشه به حسابش لینک می‌شه (برای دیدن تو /account)،
    // وگرنه به‌عنوان درخواست مهمون ثبت می‌شه — بدون نیاز به ثبت‌نام.
    await insertInquiry({
      name,
      email,
      phone,
      projectType,
      budget,
      message,
      userId: currentUser?.id,
    });
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

/** Fired from a plan card's "درخواست مشاوره برای این پلن" button (see
 *  PricingPlans.tsx). This is a lead request, not a real checkout — so it
 *  never requires an account. When logged in, name/phone are taken from
 *  the account automatically; when logged out, the caller collects just
 *  name + phone in a tiny inline modal (no registration) and passes them
 *  in directly. Either way it's saved as a normal inquiry, same as the
 *  contact form. */
export async function submitPlanOrder(input: {
  categoryLabel: string;
  categoryProjectType: string;
  planName: string;
  planPrice: string;
  planUnit: string;
  planFeatures: string[];
  guestName?: string;
  guestPhone?: string;
}): Promise<PlanOrderState> {
  const currentUser = await getCurrentUser();
  const name = currentUser?.name || (input.guestName ?? "").trim();
  const phone = currentUser?.phone || (input.guestPhone ?? "").trim();

  if (!name || !phone) {
    return { ok: false, message: "لطفاً اسم و شماره تماس رو وارد کن." };
  }

  // A double-click (or a resubmit while the first request is still in
  // flight) hits this before the insert below — we pretend success
  // instead of erroring, since the first click already placed the order.
  const cooldownKey = currentUser ? `plan-order:${currentUser.id}` : `plan-order:guest:${phone}`;
  const allowed = await allowAndCooldown(cooldownKey, PLAN_ORDER_COOLDOWN_MS);
  if (!allowed) {
    return { ok: true, message: "درخواست شما با موفقیت ثبت شد." };
  }

  const { categoryLabel, categoryProjectType, planName, planPrice, planUnit, planFeatures } = input;
  const budget = `${planPrice} ${planUnit}`.trim();
  const message = [
    `درخواست مشاوره برای پلن «${planName}» از دسته‌ی «${categoryLabel}»`,
    "",
    "امکانات پلن:",
    ...planFeatures.map((f) => `- ${f}`),
  ].join("\n");

  try {
    await insertInquiry({
      name,
      phone,
      projectType: categoryProjectType,
      budget,
      message,
      userId: currentUser?.id,
    });
    return { ok: true, message: "درخواست شما با موفقیت ثبت شد." };
  } catch (err) {
    console.error("submitPlanOrder failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد. دوباره امتحان کن یا از واتساپ پیام بده." };
  }
}
