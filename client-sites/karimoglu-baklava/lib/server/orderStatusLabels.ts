import type { OrderStatus } from "@/lib/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "در انتظار",
  payment_pending: "منتظر پرداخت",
  paid: "پرداخت‌شده",
  processing: "در حال پردازش",
  preparing: "در حال آماده‌سازی",
  ready: "آماده تحویل",
  out_for_delivery: "ارسال‌شده",
  delivered: "تکمیل‌شده",
  cancelled: "لغوشده",
  failed: "ناموفق",
};

/** ترتیب منطقی پیشرفت سفارش — برای Dropdown تغییر وضعیت در پنل مدیریت */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "payment_pending",
  "paid",
  "processing",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "failed",
];

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  not_required: "نیاز نیست (نقدی)",
  pending: "در انتظار پرداخت",
  succeeded: "پرداخت‌شده",
  failed: "ناموفق",
  cancelled: "لغوشده",
};
