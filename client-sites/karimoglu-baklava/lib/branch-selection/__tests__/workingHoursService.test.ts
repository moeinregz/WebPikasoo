import { describe, expect, it } from "vitest";
import { isBranchActive, isBranchOpenNow } from "../workingHoursService";
import type { BranchSummary } from "@/lib/types";

function makeBranch(overrides: Partial<BranchSummary> = {}): BranchSummary {
  return {
    id: "test-branch",
    slug: "test-branch",
    name: "شعبه تست",
    city: "تهران",
    shortArea: null,
    phone: "021",
    openingHours: "۰۸:۰۰ تا ۲۴:۰۰",
    hasCafeService: true,
    hasPos: false,
    supportsCashOnDelivery: false,
    coordinates: null,
    serviceRadiusKm: null,
    acceptsOnlineOrders: true,
    supportedDeliveryMethods: ["express", "same-day"],
    status: "active",
    ...overrides,
  };
}

describe("workingHoursService", () => {
  // سناریو ۶: شعبه بسته است
  // نکته: زمان‌ها عمداً با `Date.UTC` و افست ثابت ایران (+۰۳:۳۰) ساخته می‌شوند
  // تا تست مستقل از Timezone محیط اجرا (CI/Local) همیشه یک نتیجه ثابت بدهد —
  // دقیقاً همان تضمینی که خود `isBranchOpenNow` با Asia/Tehran فراهم می‌کند.
  it("branch is closed outside working hours (03:00 Tehran time)", () => {
    const branch = makeBranch();
    const threeAmTehran = new Date(Date.UTC(2026, 0, 1, 23, 30, 0)); // = ۰۳:۰۰ به وقت تهران (۲ ژانویه)
    expect(isBranchOpenNow(branch, threeAmTehran)).toBe(false);
  });

  it("branch is open during working hours (14:00 Tehran time)", () => {
    const branch = makeBranch();
    const noonTehran = new Date(Date.UTC(2026, 0, 1, 10, 30, 0)); // = ۱۴:۰۰ به وقت تهران
    expect(isBranchOpenNow(branch, noonTehran)).toBe(true);
  });

  it("inactive branch is correctly flagged", () => {
    const branch = makeBranch({ status: "inactive" });
    expect(isBranchActive(branch)).toBe(false);
  });
});
