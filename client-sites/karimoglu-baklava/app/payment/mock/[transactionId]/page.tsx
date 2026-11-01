"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

/**
 * ⚠️ این یک درگاه پرداخت واقعی نیست. چون درگاه نهایی هنوز انتخاب نشده
 * (Blueprint، بخش ۳۰)، این صفحه صرفاً جریان Redirect → Verify را شبیه‌سازی
 * می‌کند تا کل مسیر Checkout قابل تست باشد. تأیید نهایی همیشه سمت سرور
 * (`/api/payments/verify`) انجام می‌شود، نه این صفحه.
 */
export default function MockPaymentGatewayPage({ params }: { params: { transactionId: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleOutcome(outcome: "success" | "fail") {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
        body: JSON.stringify({ transactionId: params.transactionId, simulatedOutcome: outcome }),
      });
      const data = await res.json();
      const orderId = data.order?.id;
      if (orderId) {
        router.push(`/order/${orderId}/confirmation`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center">
      <span aria-hidden="true" className="text-h1">
        💳
      </span>
      <h1 className="text-h2 text-text-primary">شبیه‌ساز درگاه پرداخت</h1>
      <p className="max-w-[40ch] text-bodySm text-text-secondary">
        این یک درگاه واقعی نیست. برای تست جریان Checkout، یکی از دو حالت زیر را انتخاب کنید.
      </p>
      <div className="flex gap-3">
        <Button variant="primary" disabled={isSubmitting} onClick={() => handleOutcome("success")}>
          شبیه‌سازی پرداخت موفق
        </Button>
        <Button variant="secondary" disabled={isSubmitting} onClick={() => handleOutcome("fail")}>
          شبیه‌سازی پرداخت ناموفق
        </Button>
      </div>
    </Container>
  );
}
