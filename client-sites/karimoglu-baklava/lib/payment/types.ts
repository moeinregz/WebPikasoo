import type { PaymentStatus } from "@/lib/types";

/**
 * طبق تاکید صریح Prompt 7 (بخش ۷): «سیستم پرداخت را به یک درگاه خاص وابسته
 * نکن». هر Provider واقعی (زرین‌پال، آیدی‌پی، ملت و ...) باید این Interface
 * را پیاده‌سازی کند. مصرف‌کننده (Route Handler ها) فقط با این Interface کار
 * می‌کنند، نه با جزئیات هیچ درگاه خاصی.
 */
export interface PaymentInitiateResult {
  transactionId: string;
  /** آدرس درگاه خارجی برای Redirect؛ برای روش‌های غیرآنلاین (کارت‌به‌کارت/نقدی) همیشه null */
  redirectUrl: string | null;
  status: PaymentStatus;
}

export interface PaymentVerifyResult {
  status: PaymentStatus;
  referenceId?: string;
}

export interface PaymentProvider {
  name: string;
  initiate(params: { orderId: string; amount: number }): Promise<PaymentInitiateResult>;
  /**
   * تأیید همیشه باید با یک فراخوانی سرور‌به‌سرور به درگاه واقعی انجام شود
   * (با استفاده از transactionId/referenceId ذخیره‌شده سمت ما) — هرگز فقط بر
   * اساس پارامترهای برگشتی از مرورگر کاربر. برای MockProvider (که درگاه
   * خارجی واقعی ندارد)، `simulatedOutcome` جایگزین آن فراخوانی واقعی است.
   */
  verify(params: { transactionId: string; simulatedOutcome?: "success" | "fail" }): Promise<PaymentVerifyResult>;
}
