import { randomUUID } from "crypto";
import { db } from "@/lib/server/db";
import type { PaymentProvider } from "./types";

/**
 * درگاه واقعی هنوز انتخاب نشده (Blueprint، بخش ۳۰ — Open Requirement).
 * این Provider صرفاً برای نمایش کامل جریان Initiate → Redirect → Verify
 * بدون وابستگی به سرویس خارجی واقعی است. جایگزینی با درگاه واقعی یعنی
 * ساخت یک Provider جدید با همین Interface (`lib/payment/types.ts`) و
 * افزودن آن به `lib/payment/registry.ts` — هیچ کد دیگری نیاز به تغییر ندارد.
 */
export const mockProvider: PaymentProvider = {
  name: "mock-gateway",

  async initiate({ orderId, amount }) {
    const transactionId = randomUUID();
    await db.payments.set(transactionId, {
      id: transactionId,
      orderId,
      provider: "mock-gateway",
      method: "online",
      amount,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return {
      transactionId,
      redirectUrl: `/payment/mock/${transactionId}`,
      status: "pending",
    };
  },

  async verify({ transactionId, simulatedOutcome }) {
    const transaction = await db.payments.get(transactionId);
    if (!transaction) {
      return { status: "failed" };
    }

    // Idempotency: اگر قبلاً تأیید نهایی شده، همان نتیجه قبلی برگردانده می‌شود
    // (نه پردازش دوباره) — طبق بخش ۷ Prompt: «جلوگیری از پرداخت تکراری»
    if (transaction.status === "succeeded" || transaction.status === "failed") {
      return { status: transaction.status, referenceId: transaction.referenceId };
    }

    const status = simulatedOutcome === "success" ? "succeeded" : "failed";
    const referenceId = status === "succeeded" ? `MOCK-${transactionId.slice(0, 8).toUpperCase()}` : undefined;

    await db.payments.set(transactionId, {
      ...transaction,
      status,
      verifiedAt: new Date().toISOString(),
      referenceId,
    });

    return { status, referenceId };
  },
};
