import type { Order, PaymentTransaction } from "@/lib/types";
import { getOrderById, setOrder } from "./orderRepo";
import { getPaymentById, setPayment } from "./paymentRepo";

/**
 * ✅ Prompt 10: این دیگر یک In-memory Store نیست — `orders`/`payments` حالا
 * واقعاً روی جدول‌های SQL (`orderRepo.ts` / `paymentRepo.ts`) کار می‌کنند.
 *
 * این فایل عمداً همان شکل ظاهری (`db.orders.get(id)` / `db.orders.set(id, x)`)
 * را حفظ کرده تا Route Handlerهای موجود (`app/api/orders/*`, `app/api/payments/*`،
 * `lib/payment/mockProvider.ts`) بدون تغییر کار کنند — طبق قانون صریح Prompt
 * («تصمیمات معماری قبلی را خراب نکن مگر لازم باشد»). منطق واقعی ذخیره‌سازی
 * در Repository‌هاست، نه اینجا.
 *
 * `idempotencyKeys` دیگر یک Map جدا نیست — چون `orders.idempotency_key` خودش
 * یک ستون UNIQUE واقعی است؛ `findOrderIdByIdempotencyKey` (در `orderRepo`)
 * مستقیماً همان کار را با یک Query انجام می‌دهد. `orderService.ts` مستقیماً
 * از آن استفاده می‌کند، نه از این فایل.
 */
export const db = {
  orders: {
    get: async (id: string): Promise<Order | undefined> => await getOrderById(id),
    set: async (_id: string, order: Order): Promise<void> => await setOrder(order),
  },
  payments: {
    get: async (id: string): Promise<PaymentTransaction | undefined> => await getPaymentById(id),
    set: async (_id: string, payment: PaymentTransaction): Promise<void> => await setPayment(payment),
  },
};
