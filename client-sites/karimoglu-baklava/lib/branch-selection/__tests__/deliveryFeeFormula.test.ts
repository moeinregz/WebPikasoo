import { describe, expect, it } from "vitest";
import { calculateDeliveryFee } from "../deliveryFeeFormula";

describe("deliveryFeeFormula", () => {
  // سناریو ۱۵: هزینه ارسال محاسبه می‌شود (وقتی فرمول تنظیم شده و فاصله مشخص است)
  it("calculates fee correctly once a formula is configured and distance is known", () => {
    const result = calculateDeliveryFee(10, "express", { baseFee: 20000, perKmRate: 3000 });
    expect(result.fee).toBe(20000 + 3000 * 10);
    expect(result.isEstimate).toBe(true);
  });

  it("returns null fee with an explicit reason when the formula is not configured (current honest default)", () => {
    const result = calculateDeliveryFee(10, "express");
    expect(result.fee).toBeNull();
    expect(result.reason).toBe("formula_not_configured");
  });

  it("returns null fee with distance_unknown reason when distance is unavailable, even if formula is configured", () => {
    const result = calculateDeliveryFee(null, "express", { baseFee: 20000, perKmRate: 3000 });
    expect(result.fee).toBeNull();
    expect(result.reason).toBe("distance_unknown");
  });
});
