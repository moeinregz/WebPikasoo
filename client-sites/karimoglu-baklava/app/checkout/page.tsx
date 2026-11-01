"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { apiPost } from "@/lib/apiClient";
import { formatToman } from "@/lib/format";
import { track } from "@/lib/analytics";
import { branches } from "@/lib/mock-data";
import { useCustomerLocation } from "@/lib/location/useCustomerLocation";
import { LocationMap } from "@/components/cart/LocationMap";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import type { CartValidationResult, DeliveryMethod, PaymentMethod } from "@/lib/types";
import type { BranchSelectionResult } from "@/lib/branch-selection/types";

type Step = "customer" | "address" | "delivery" | "payment" | "review";
const STEPS: { key: Step; label: string }[] = [
  { key: "customer", label: "اطلاعات مشتری" },
  { key: "address", label: "آدرس" },
  { key: "delivery", label: "ارسال و شعبه" },
  { key: "payment", label: "پرداخت" },
  { key: "review", label: "بازبینی نهایی" },
];

function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex]!.key;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState<"تهران" | "همدان" | "">("");
  const [address, setAddress] = useState("");

  // شهر/موقعیتی که مشتری در سبد خرید مشخص کرده بود، اینجا هم اعمال می‌شود
  const loc = useCustomerLocation();
  useEffect(() => {
    if (loc.isHydrated && loc.location.city) setCity(loc.location.city);
  }, [loc.isHydrated, loc.location.city]);
  // مختصات فقط وقتی معتبر است که با شهر انتخاب‌شده هم‌خوان باشد (انتخاب دستی شهر، مختصات قبلی را پاک می‌کند)
  const coordinates = loc.location.city === city ? loc.location.coordinates : null;
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("express");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");

  const [branchSelection, setBranchSelection] = useState<BranchSelectionResult | null>(null);
  const [isResolvingBranch, setIsResolvingBranch] = useState(false);
  const [, setValidation] = useState<CartValidationResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey] = useState(generateIdempotencyKey);

  useEffect(() => {
    track({ name: "begin_checkout" });
  }, []);

  // هر بار سبد یا شهر تغییر کند، شعبه دوباره از سرور استعلام می‌شود — طبق
  // بخش «حالت‌های خاص» Prompt 8: «مشتری آدرس را تغییر می‌دهد / سبد را تغییر
  // می‌دهد» باید سیستم را وادار به تصمیم‌گیری مجدد کند.
  useEffect(() => {
    if (!city || cart.items.length === 0) {
      setBranchSelection(null);
      return;
    }
    let cancelled = false;
    setIsResolvingBranch(true);
    apiPost<BranchSelectionResult>("/api/cart/resolve-branch", {
      items: cart.items,
      city,
      coordinates,
      deliveryMethod,
    })
      .then(({ data }) => {
        if (!cancelled) {
          setBranchSelection(data);
          if (data.status === "selected" && data.selected) {
            track({ name: "branch_selection", branchId: data.selected.branchId, deliveryMethod });
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsResolvingBranch(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, deliveryMethod, cart.items, coordinates?.lat, coordinates?.lng]);

  const resolvedBranch = branches.find((b) => b.id === branchSelection?.selected?.branchId);
  const availablePaymentMethods = useMemo<PaymentMethod[]>(() => {
    const methods: PaymentMethod[] = ["online", "card-to-card"];
    if (resolvedBranch?.hasPos) methods.push("in-branch-pos");
    // اطلاعات جدید: فعلاً فقط شعبه تجریش «پرداخت درب منزل» را پشتیبانی می‌کند
    if (resolvedBranch?.supportsCashOnDelivery) methods.push("cash-on-delivery");
    return methods;
  }, [resolvedBranch]);

  // اگر با تغییر شعبه (مثلاً کاربر آدرس را عوض کرد) روش پرداخت قبلاً
  // انتخاب‌شده دیگر در دسترس نباشد (مثلاً از تجریش به شعبه دیگر)، انتخاب را
  // بی‌صدا به یک گزینه همیشه‌در‌دسترس برمی‌گردانیم — قبل از این هم همین
  // نقص برای «کارت‌خوان در شعبه» وجود داشت، اینجا برای هر دو یک‌جا رفع شد.
  useEffect(() => {
    if (!availablePaymentMethods.includes(paymentMethod)) {
      setPaymentMethod("online");
    }
  }, [availablePaymentMethods, paymentMethod]);

  if (cart.items.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-4 py-20 text-center">
        <h1 className="text-h2 text-text-primary">سبد خرید شما خالی است</h1>
        <Link href="/shop">
          <Button variant="primary">بازگشت به فروشگاه</Button>
        </Link>
      </Container>
    );
  }

  function goNext() {
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
    if (step === "address") track({ name: "add_shipping_info", deliveryMethod });
  }
  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  const canProceedFromCustomer = name.trim().length > 1 && phone.trim().length >= 10;
  const canProceedFromAddress = Boolean(city) && address.trim().length > 5;
  const canProceedFromDelivery = branchSelection?.status === "selected";

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);
    track({ name: "add_payment_info", paymentMethod });

    // اعتبارسنجی نهایی سمت سرور پیش از ایجاد سفارش (بخش ۳ Prompt 7) — حتی
    // اگر مراحل قبلی UI موفق بودند، وضعیت می‌تواند در همین فاصله تغییر کرده باشد.
    const { data: finalValidation } = await apiPost<CartValidationResult>("/api/cart/validate", {
      items: cart.items,
      city,
      coordinates,
      deliveryMethod,
    });
    setValidation(finalValidation);
    if (!finalValidation.isValid) {
      setSubmitError("سبد خرید شما نیاز به اصلاح دارد. لطفاً موارد مشخص‌شده را بررسی کنید.");
      track({ name: "checkout_error", reason: "cart_invalid" });
      setIsSubmitting(false);
      return;
    }

    const { ok, data, status } = await apiPost<{
      order?: { id: string; total: number };
      payment?: { redirectUrl: string | null };
      error?: string;
    }>("/api/orders", {
      items: cart.items,
      customer: { name, phone },
      address: { fullAddress: address, city, latitude: coordinates?.lat ?? null, longitude: coordinates?.lng ?? null },
      deliveryMethod,
      paymentMethod,
      idempotencyKey,
    });

    if (!ok || !data.order) {
      setSubmitError(
        status === 409
          ? (data.error ?? "امکان ثبت سفارش وجود ندارد. لطفاً دوباره تلاش کنید.")
          : "خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.",
      );
      track({ name: "checkout_error", reason: data.error ?? "unknown" });
      setIsSubmitting(false);
      return;
    }

    track({ name: "purchase", orderId: data.order.id, total: data.order.total });
    cart.clearCart();

    if (data.payment?.redirectUrl) {
      router.push(data.payment.redirectUrl);
    } else {
      router.push(`/order/${data.order.id}/confirmation`);
    }
  }

  return (
    <Container className="flex flex-col gap-8 py-8 tablet:py-10">
      <h1 className="text-h1Mobile tablet:text-h1 text-text-primary">تسویه‌حساب</h1>

      <nav aria-label="مراحل تسویه‌حساب" className="flex flex-wrap gap-2 text-caption">
        {STEPS.map((s, i) => (
          <span
            key={s.key}
            className={`rounded-full px-3 py-1 ${
              i === stepIndex
                ? "bg-brand-black text-text-inverse"
                : i < stepIndex
                  ? "bg-state-successBg text-state-success"
                  : "bg-bg-secondary text-text-muted"
            }`}
          >
            {(i + 1).toLocaleString("fa-IR")}. {s.label}
          </span>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-8 desktop:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6 rounded-lg bg-surface p-5 shadow-sm">
          {step === "customer" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-h4 text-text-primary">اطلاعات مشتری</h2>
              <label className="flex flex-col gap-1 text-bodySm">
                نام و نام خانوادگی
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-md border border-border-strong px-3"
                />
              </label>
              <label className="flex flex-col gap-1 text-bodySm">
                شماره موبایل
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="numeric"
                  placeholder="09xxxxxxxxx"
                  className="h-11 rounded-md border border-border-strong px-3"
                />
              </label>
              <p className="text-caption text-text-muted">
                خرید شما به‌صورت مهمان ثبت می‌شود؛ نیازی به رمز عبور یا کد تأیید نیست.
              </p>
            </div>
          )}

          {step === "address" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-h4 text-text-primary">آدرس تحویل</h2>
              <div className="flex gap-2">
                {(["تهران", "همدان"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCity(c);
                      loc.selectCity(c);
                    }}
                    className={`rounded-full border px-4 py-2 text-bodySm ${
                      city === c ? "border-brand-black bg-brand-black text-text-inverse" : "border-border-strong"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={loc.detect}
                  disabled={loc.isDetecting}
                  className="w-fit rounded-full border border-brand-red px-4 py-2 text-bodySm text-brand-red transition-colors duration-hover hover:bg-brand-redLight disabled:cursor-wait disabled:opacity-60"
                >
                  {loc.isDetecting ? "در حال دریافت موقعیت..." : "📍 استفاده از موقعیت من"}
                </button>
                {loc.message && (
                  <p
                    role={loc.message.kind === "error" ? "alert" : "status"}
                    className={`text-caption ${loc.message.kind === "error" ? "text-state-error" : "text-text-secondary"}`}
                  >
                    {loc.message.text}
                  </p>
                )}
                {coordinates && (
                  <p className="text-caption text-text-secondary">موقعیت شما برای انتخاب نزدیک‌ترین شعبه ثبت شد.</p>
                )}
                <LocationMap state={loc} />
              </div>
              <label className="flex flex-col gap-1 text-bodySm">
                آدرس کامل
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="rounded-md border border-border-strong p-3"
                />
              </label>
              <p className="text-caption text-text-muted">
                چون مختصات دقیق هنوز به سیستم متصل نشده، آدرس متنی برای هماهنگی نهایی توسط شعبه استفاده می‌شود.
              </p>
            </div>
          )}

          {step === "delivery" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-h4 text-text-primary">روش ارسال و شعبه تأمین‌کننده</h2>
              <div className="flex gap-2">
                {(
                  [
                    { value: "express", label: "ارسال فوری" },
                    { value: "same-day", label: "ارسال همان‌روز" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDeliveryMethod(opt.value)}
                    className={`rounded-full border px-4 py-2 text-bodySm ${
                      deliveryMethod === opt.value
                        ? "border-brand-black bg-brand-black text-text-inverse"
                        : "border-border-strong"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="rounded-md border border-border bg-bg-secondary p-4">
                {isResolvingBranch && <p className="text-bodySm text-text-secondary">در حال بررسی نزدیک‌ترین شعبه...</p>}
                {!isResolvingBranch && branchSelection?.status === "selected" && branchSelection.selected && (
                  <div className="flex flex-col gap-1 text-bodySm">
                    <p className="text-text-primary">
                      <span className="text-state-success">✓</span> سفارش شما از شعبه{" "}
                      <strong>{branchSelection.selected.branchName}</strong> ارسال می‌شود.
                    </p>
                    <p className="text-text-secondary">
                      زمان تقریبی تحویل: {branchSelection.selected.etaMinutesMin.toLocaleString("fa-IR")} تا{" "}
                      {branchSelection.selected.etaMinutesMax.toLocaleString("fa-IR")} دقیقه
                    </p>
                    <p className="text-caption text-text-muted">
                      {branchSelection.selected.deliveryFee.fee !== null
                        ? `هزینه ارسال: ${formatToman(branchSelection.selected.deliveryFee.fee)}`
                        : "هزینه ارسال پس از هماهنگی شعبه اعلام می‌شود."}
                    </p>
                  </div>
                )}
                {!isResolvingBranch && branchSelection && branchSelection.status !== "selected" && (
                  <p className="text-bodySm text-state-warning">
                    {branchSelection.userMessage ?? "در حال حاضر شعبه‌ای برای تأمین این سفارش در دسترس نیست."}
                  </p>
                )}
                {!isResolvingBranch && !branchSelection && (
                  <p className="text-bodySm text-text-muted">برای بررسی شعبه، ابتدا شهر خود را در مرحله قبل انتخاب کنید.</p>
                )}
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-h4 text-text-primary">روش پرداخت</h2>
              <div className="flex flex-col gap-2">
                {availablePaymentMethods.map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-3 rounded-md border p-3 text-bodySm ${
                      paymentMethod === method ? "border-brand-red bg-brand-redLight" : "border-border-strong"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    {method === "online" && "پرداخت آنلاین"}
                    {method === "card-to-card" && "کارت‌به‌کارت (با هماهنگی)"}
                    {method === "in-branch-pos" && "کارت‌خوان در شعبه"}
                    {method === "cash-on-delivery" && "پرداخت درب منزل"}
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-h4 text-text-primary">بازبینی نهایی</h2>
              <ul className="flex flex-col gap-2 text-bodySm">
                {cart.items.map((item) => (
                  <li key={item.lineId} className="flex justify-between">
                    <span className="text-text-secondary">
                      {item.productName} × {item.quantity.toLocaleString("fa-IR")}
                    </span>
                    <span>{formatToman(item.unitPriceSnapshot * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-md bg-bg-secondary p-3 text-bodySm text-text-secondary">
                <p>{name} — {phone}</p>
                <p>{city} — {address}</p>
              </div>
              {submitError && (
                <p role="alert" className="rounded-md bg-state-errorBg px-3 py-2 text-caption text-state-error">
                  {submitError}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
              مرحله قبل
            </Button>
            {step !== "review" ? (
              <Button
                variant="primary"
                onClick={goNext}
                disabled={
                  (step === "customer" && !canProceedFromCustomer) ||
                  (step === "address" && !canProceedFromAddress) ||
                  (step === "delivery" && !canProceedFromDelivery)
                }
              >
                مرحله بعد
              </Button>
            ) : (
              <Button variant="accent" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "در حال ثبت سفارش..." : "ثبت نهایی سفارش"}
              </Button>
            )}
          </div>
        </div>

        <aside className="flex h-fit flex-col gap-3 rounded-lg bg-surface p-5 shadow-sm">
          <h2 className="text-h4 text-text-primary">خلاصه سفارش</h2>
          <div className="flex justify-between text-bodySm">
            <span className="text-text-secondary">جمع کالاها</span>
            <span>{formatToman(cart.optimisticSubtotal)}</span>
          </div>
          <div className="flex justify-between text-bodySm">
            <span className="text-text-secondary">هزینه ارسال</span>
            <span>
              {branchSelection?.selected?.deliveryFee.fee !== undefined &&
              branchSelection?.selected?.deliveryFee.fee !== null
                ? formatToman(branchSelection.selected.deliveryFee.fee)
                : "در انتظار تعیین"}
            </span>
          </div>
        </aside>
      </div>
    </Container>
  );
}
