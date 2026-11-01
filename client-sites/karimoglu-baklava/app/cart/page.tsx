"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { apiPost } from "@/lib/apiClient";
import { formatToman } from "@/lib/format";
import { track } from "@/lib/analytics";
import { useCustomerLocation } from "@/lib/location/useCustomerLocation";
import { LocationPicker } from "@/components/cart/LocationPicker";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import type { CartValidationResult } from "@/lib/types";

export default function CartPage() {
  const cart = useCart();
  const [validation, setValidation] = useState<CartValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const locationState = useCustomerLocation();
  const { city, coordinates } = locationState.location;
  const locationReady = locationState.isHydrated;

  useEffect(() => {
    track({ name: "view_cart" });
  }, []);

  useEffect(() => {
    if (cart.items.length === 0) {
      setValidation(null);
      return;
    }
    if (!locationReady) return; // تا خوانده شدن شهر ذخیره‌شده صبر می‌کنیم تا اعتبارسنجی بیهوده با «بدون شهر» اجرا نشود
    let cancelled = false;
    setIsValidating(true);
    apiPost<CartValidationResult>("/api/cart/validate", { items: cart.items, city, coordinates })
      .then(({ data }) => {
        if (!cancelled) setValidation(data);
      })
      .finally(() => {
        if (!cancelled) setIsValidating(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.items, city, coordinates?.lat, coordinates?.lng, locationReady]);

  if (cart.items.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-4 py-20 text-center">
        <span aria-hidden="true" className="text-h1">
          🛍
        </span>
        <h1 className="text-h2 text-text-primary">سبد خرید شما خالی است</h1>
        <p className="text-bodySm text-text-secondary">محصولی هنوز به سبد اضافه نکرده‌اید.</p>
        <Link href="/shop">
          <Button variant="primary">مشاهده فروشگاه</Button>
        </Link>
      </Container>
    );
  }

  const issueByLineId = new Map((validation?.issues ?? []).map((i) => [i.lineId, i]));
  const cartIssue = issueByLineId.get("__cart__");
  const hasBlockingIssues = Boolean(validation && !validation.isValid);
  // بدون شهر، «شعبه‌ای پیدا نشد» خطای واقعی نیست؛ فقط باید موقعیت را مشخص کند (پایین‌تر راهنما نشان داده می‌شود)
  const needsLocation = !city;
  const resolvedBranchName = validation?.branchResolution.branchName ?? null;

  return (
    <Container className="flex flex-col gap-8 py-8 tablet:py-10">
      <h1 className="text-h1Mobile tablet:text-h1 text-text-primary">سبد خرید</h1>

      <div className="grid grid-cols-1 gap-8 desktop:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          {cart.items.map((item) => {
            const issue = issueByLineId.get(item.lineId);
            return (
              <div key={item.lineId} className="flex flex-col gap-3 rounded-lg bg-surface p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-h4 text-text-primary">{item.productName}</p>
                    <p className="text-bodySm text-text-muted">
                      {item.variantLabel} · {item.packagingLabel}
                    </p>
                  </div>
                  <span className="text-price text-text-primary">
                    {formatToman(item.unitPriceSnapshot * item.quantity)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex h-9 items-center rounded-md border border-border-strong">
                    <button
                      type="button"
                      aria-label="کاهش تعداد"
                      onClick={() => cart.setQuantity(item.lineId, item.quantity - 1)}
                      className="flex h-full w-9 items-center justify-center text-text-secondary"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-bodySm">{item.quantity.toLocaleString("fa-IR")}</span>
                    <button
                      type="button"
                      aria-label="افزایش تعداد"
                      onClick={() => cart.setQuantity(item.lineId, item.quantity + 1)}
                      className="flex h-full w-9 items-center justify-center text-text-secondary"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      cart.removeItem(item.lineId);
                      track({ name: "remove_from_cart", productId: item.productId });
                    }}
                    className="text-caption text-text-muted hover:text-state-error"
                  >
                    حذف
                  </button>
                </div>

                {issue && (
                  <p role="alert" className="text-caption text-state-error">
                    {issue.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <aside className="flex h-fit flex-col gap-4 rounded-lg bg-surface p-5 shadow-sm">
          <h2 className="text-h4 text-text-primary">خلاصه سبد</h2>
          <div className="flex justify-between text-bodySm">
            <span className="text-text-secondary">جمع تقریبی</span>
            <span className="text-price text-text-primary">{formatToman(cart.optimisticSubtotal)}</span>
          </div>
          <p className="text-caption text-text-muted">
            هزینه ارسال و مبلغ نهایی دقیق در مرحله تسویه‌حساب، پس از تعیین شعبه محاسبه می‌شود.
          </p>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <h3 className="text-label text-text-primary">موقعیت تحویل</h3>
            <p className="text-caption text-text-muted">
              شهر خود را انتخاب کنید یا از موقعیت‌یابی استفاده کنید تا شعبه مناسب برای سفارشتان پیدا شود.
            </p>
            <LocationPicker state={locationState} />
            {city === "تهران" && !coordinates && (
              <p className="text-caption text-text-muted">
                برای انتخاب «نزدیک‌ترین» شعبه، دکمه موقعیت من را بزنید؛ در غیر این صورت اولین شعبه‌ای که کل سبد را دارد انتخاب می‌شود.
              </p>
            )}
            {city && resolvedBranchName && !cartIssue && (
              <p className="text-caption text-text-secondary">شعبه تأمین‌کننده: {resolvedBranchName}</p>
            )}
          </div>

          {cartIssue && !needsLocation && (
            <p role="alert" className="rounded-md bg-state-errorBg px-3 py-2 text-caption text-state-error">
              {cartIssue.message}
            </p>
          )}

          <Link href="/checkout">
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              disabled={isValidating || (!needsLocation && Boolean(validation) && hasBlockingIssues && Boolean(cartIssue))}
            >
              ادامه به تسویه‌حساب
            </Button>
          </Link>
        </aside>
      </div>
    </Container>
  );
}
