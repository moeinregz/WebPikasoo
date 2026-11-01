import { describe, expect, it } from "vitest";
import { detectCityFromCoordinates, haversineKm } from "../customerLocation";

describe("customerLocation", () => {
  it("measures the distance between two Tehran branches (about 3 km)", () => {
    const aria = { lat: 35.721900305922844, lng: 51.347495725159206 };
    const satarkhan = { lat: 35.707522848391676, lng: 51.375353343799986 };
    const km = haversineKm(aria, satarkhan);
    expect(km).toBeGreaterThan(2.5);
    expect(km).toBeLessThan(3.5);
  });

  it("detects the customer's city from coordinates", () => {
    expect(detectCityFromCoordinates({ lat: 35.7219, lng: 51.3475 })?.city).toBe("تهران");
    expect(detectCityFromCoordinates({ lat: 34.8, lng: 48.51 })?.city).toBe("همدان");
  });

  it("returns null for a point outside the service area (e.g. Isfahan)", () => {
    expect(detectCityFromCoordinates({ lat: 32.6546, lng: 51.668 })).toBeNull();
  });
});
