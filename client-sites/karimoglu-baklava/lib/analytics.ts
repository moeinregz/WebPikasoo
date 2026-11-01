/**
 * پیاده‌سازی حداقلی و قابل‌توسعه Analytics طبق Blueprint (بخش ۲۳).
 * در فاز واقعی، بدنه `track` با فراخوانی واقعی GA4 (یا ابزار انتخابی)
 * جایگزین می‌شود؛ امضای تابع و اسم Eventها همین‌جا ثابت می‌ماند تا
 * Componentهای Product Page نیازی به تغییر نداشته باشند.
 */

export type AnalyticsEvent =
  | { name: "product_view"; productId: string; category: string }
  | { name: "category_view"; category: string }
  | { name: "search"; query: string; resultCount: number }
  | { name: "variant_select"; productId: string; saleType: string; variantId: string }
  | { name: "packaging_select"; productId: string; packagingId: string }
  | { name: "add_to_wishlist" | "remove_from_wishlist"; productId: string }
  | { name: "add_to_cart"; productId: string; variantId: string; quantity: number }
  | { name: "remove_from_cart"; productId?: string }
  | { name: "view_cart" }
  | { name: "begin_checkout" }
  | { name: "add_shipping_info"; deliveryMethod: string }
  | { name: "add_payment_info"; paymentMethod: string }
  | { name: "branch_selection"; branchId: string; deliveryMethod: string }
  | { name: "purchase"; orderId: string; total: number }
  | { name: "payment_failed"; orderId: string }
  | { name: "checkout_error"; reason: string }
  | { name: "gallery_image_view"; productId: string; imageIndex: number }
  | { name: "gallery_fullscreen_open"; productId: string }
  | { name: "review_helpful_click"; reviewId: string };

export function track(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  // TODO: جایگزینی با ابزار Analytics واقعی (مثلاً gtag/GA4) طبق تصمیم فاز DevOps
  // eslint-disable-next-line no-console
  console.debug("[analytics]", event);
}
