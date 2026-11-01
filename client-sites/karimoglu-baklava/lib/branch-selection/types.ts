import type { BranchSummary, CartItem, DeliveryMethod } from "@/lib/types";

/**
 * ماژول مستقل «انتخاب هوشمند شعبه و تأمین سفارش» (Prompt 8).
 * این فایل فقط مدل‌های دامنه را تعریف می‌کند؛ منطق در سرویس‌های مجاور
 * (workingHoursService، inventoryService، distanceService، feasibilityService،
 * deliveryFeeFormula، rankingService، branchSelectionService) پیاده می‌شود.
 */

export type RejectionReason =
  | "inactive"
  | "closed"
  | "delivery_method_unsupported"
  | "out_of_service_area"
  | "online_orders_disabled"
  | "cart_not_fully_available"
  | "customer_location_missing";

export interface DistanceResult {
  distanceKm: number;
  durationMinutes: number;
}

export interface DeliveryFeeResult {
  fee: number | null;
  isEstimate: boolean;
  /** اگر fee قابل محاسبه نبود، دلیل آن (مثلاً فاصله نامشخص یا فرمول تنظیم‌نشده) */
  reason?: "distance_unknown" | "formula_not_configured";
}

export interface CustomerLocationInput {
  /** مختصات واقعی — فقط اگر واقعاً از GPS/نقشه دریافت شده باشد؛ هرگز حدس زده نمی‌شود */
  coordinates: { lat: number; lng: number } | null;
  /** شهر — از روی آدرس متنی مشتری (فعلاً تنها سیگنال مکانی قابل‌اتکا، چون Geocoding واقعی TODO است) */
  city: "تهران" | "همدان" | null;
}

export interface BranchSelectionInput {
  cartItems: CartItem[];
  customerLocation: CustomerLocationInput;
  deliveryMethod: DeliveryMethod;
  /** انتخاب دستی مشتری (بخش «انتخاب دستی شعبه») — در صورت وجود، فقط همین شعبه ارزیابی می‌شود */
  preferredBranchId?: string;
  /** برای تست‌پذیری قطعی (Deterministic) — پیش‌فرض: لحظه واقعی درخواست */
  now?: Date;
}

export interface CandidateEvaluation {
  branchId: string;
  branchName: string;
  passed: boolean;
  rejectionReason?: RejectionReason;
  missingProductIds: string[];
  distance: DistanceResult | null;
  deliveryFee: DeliveryFeeResult | null;
  prepMinutes: number;
}

export interface SelectedBranchInfo {
  branchId: string;
  branchName: string;
  distanceKm: number | null;
  prepMinutes: number;
  etaMinutesMin: number;
  etaMinutesMax: number;
  deliveryFee: DeliveryFeeResult;
  reason: string;
}

export type BranchSelectionStatus = "selected" | "no_branch_available" | "manual_branch_rejected";

export interface BranchSelectionResult {
  status: BranchSelectionStatus;
  selected: SelectedBranchInfo | null;
  /** پیام غیرفنی مناسب برای نمایش به کاربر در صورت عدم موفقیت */
  userMessage?: string;
  /** فقط برای لاگ/دیباگ داخلی — هرگز عیناً به کاربر نهایی نمایش داده نمی‌شود */
  evaluations: CandidateEvaluation[];
}

/** ترتیب اولویت رتبه‌بندی — طبق بخش ۷ Prompt، در آینده قابل تغییر بدون دست‌زدن به الگوریتم اصلی */
export type RankingCriterion = "delivery_time" | "distance";
export const DEFAULT_RANKING_ORDER: RankingCriterion[] = ["delivery_time", "distance"];

export function getBranchPrepMinutes(_branch: BranchSummary): number {
  // طبق Blueprint/Prompt: «زمان آماده‌سازی حدود ۳۰ دقیقه» برای همه شعب یکسان اعلام شده
  return 30;
}
