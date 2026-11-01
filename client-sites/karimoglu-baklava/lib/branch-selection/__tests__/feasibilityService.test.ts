import { describe, expect, it } from "vitest";
import { checkDeliveryFeasibility } from "../feasibilityService";
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

describe("feasibilityService", () => {
  // سناریو ۷: مشتری خارج از محدوده ارسال (شهر متفاوت با شعبه) است
  it("rejects when customer city differs from branch city", () => {
    const branch = makeBranch({ city: "تهران" });
    const result = checkDeliveryFeasibility(branch, { coordinates: null, city: "همدان" }, "express");
    expect(result.feasible).toBe(false);
    expect(result.reason).toBe("out_of_service_area");
  });

  it("accepts when customer city matches branch city", () => {
    const branch = makeBranch({ city: "تهران" });
    const result = checkDeliveryFeasibility(branch, { coordinates: null, city: "تهران" }, "express");
    expect(result.feasible).toBe(true);
  });

  // سناریو ۱۶/۱۷: پشتیبانی روش ارسال (ارسال فوری/همان‌روز)
  it("rejects unsupported delivery method", () => {
    const branch = makeBranch({ supportedDeliveryMethods: ["express"] });
    const result = checkDeliveryFeasibility(branch, { coordinates: null, city: "تهران" }, "same-day");
    expect(result.feasible).toBe(false);
    expect(result.reason).toBe("delivery_method_unsupported");
  });

  it("accepts supported delivery method (same-day)", () => {
    const branch = makeBranch({ supportedDeliveryMethods: ["express", "same-day"] });
    const result = checkDeliveryFeasibility(branch, { coordinates: null, city: "تهران" }, "same-day");
    expect(result.feasible).toBe(true);
  });

  it("rejects a customer farther than the branch service radius, and accepts one inside it", () => {
    const branch = makeBranch({ coordinates: { lat: 35.7219, lng: 51.3475 }, serviceRadiusKm: 5 });
    const far = checkDeliveryFeasibility(branch, { coordinates: { lat: 35.8054, lng: 51.432 }, city: "تهران" }, "express");
    expect(far.feasible).toBe(false);
    expect(far.reason).toBe("out_of_service_area");

    const near = checkDeliveryFeasibility(branch, { coordinates: { lat: 35.7075, lng: 51.3754 }, city: "تهران" }, "express");
    expect(near.feasible).toBe(true);
  });
});
