import type { BranchSelectionInput, BranchSelectionResult } from "./types";

export interface BranchSelectionLogEntry {
  timestamp: string;
  cartProductIds: string[];
  city: string | null;
  hasCoordinates: boolean;
  deliveryMethod: string;
  preferredBranchId?: string;
  status: string;
  selectedBranchId: string | null;
  candidates: {
    branchId: string;
    passed: boolean;
    rejectionReason?: string;
    missingProductCount: number;
  }[];
}

const MAX_LOG_ENTRIES = 200;
const logStore: BranchSelectionLogEntry[] = [];

/**
 * طبق بخش «لاگ و مشاهده‌پذیری» Prompt 8: تصمیم باید قابل بررسی باشد اما
 * «اطلاعات حساس مشتری را بی‌دلیل لاگ نکن». به همین دلیل فقط شهر (نه آدرس
 * دقیق)، وجود/عدم‌وجود مختصات (نه مقدار خام GPS)، و شناسه محصولات (نه نام
 * مشتری/شماره تماس) ثبت می‌شوند. این لاگ در حافظه نگه داشته می‌شود (In-memory)
 * و صرفاً برای مشاهده‌پذیری MVP/پنل مدیریت داخلی است؛ در تولید واقعی باید به
 * یک سیستم Logging متمرکز (طبق Blueprint بخش ۲۴) منتقل شود.
 */
export function logBranchSelectionDecision(input: BranchSelectionInput, result: BranchSelectionResult): void {
  const entry: BranchSelectionLogEntry = {
    timestamp: new Date().toISOString(),
    cartProductIds: input.cartItems.map((i) => i.productId),
    city: input.customerLocation.city,
    hasCoordinates: input.customerLocation.coordinates !== null,
    deliveryMethod: input.deliveryMethod,
    preferredBranchId: input.preferredBranchId,
    status: result.status,
    selectedBranchId: result.selected?.branchId ?? null,
    candidates: result.evaluations.map((e) => ({
      branchId: e.branchId,
      passed: e.passed,
      rejectionReason: e.rejectionReason,
      missingProductCount: e.missingProductIds.length,
    })),
  };

  logStore.push(entry);
  if (logStore.length > MAX_LOG_ENTRIES) logStore.shift();

  // eslint-disable-next-line no-console
  console.debug("[branch-selection]", entry);
}

export function getRecentBranchSelectionLogs(limit = 50): BranchSelectionLogEntry[] {
  return logStore.slice(-limit).reverse();
}
