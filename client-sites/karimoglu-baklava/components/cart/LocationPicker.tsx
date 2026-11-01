"use client";

import type { CustomerCity } from "@/lib/location/customerLocation";
import type { useCustomerLocation } from "@/lib/location/useCustomerLocation";
import { LocationMap } from "./LocationMap";

type LocationState = ReturnType<typeof useCustomerLocation>;

const CITIES: CustomerCity[] = ["تهران", "همدان"];

/** انتخاب شهر (دستی)، تشخیص خودکار با «استفاده از موقعیت من»، یا انتخاب نقطه روی نقشه نشان */
export function LocationPicker({ state }: { state: LocationState }) {
  const { location, isDetecting, message, selectCity, detect } = state;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="انتخاب شهر">
        {CITIES.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => selectCity(city)}
            aria-pressed={location.city === city}
            className={`rounded-full border px-4 py-2 text-bodySm transition-colors duration-hover ${
              location.city === city
                ? "border-brand-black bg-brand-black text-text-inverse"
                : "border-border-strong text-text-secondary hover:border-brand-black"
            }`}
          >
            {city}
          </button>
        ))}
        <button
          type="button"
          onClick={detect}
          disabled={isDetecting}
          className="rounded-full border border-brand-red px-4 py-2 text-bodySm text-brand-red transition-colors duration-hover hover:bg-brand-redLight disabled:cursor-wait disabled:opacity-60"
        >
          {isDetecting ? "در حال دریافت موقعیت..." : "📍 استفاده از موقعیت من"}
        </button>
      </div>

      <LocationMap state={state} />

      {message && (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={`text-caption ${message.kind === "error" ? "text-state-error" : "text-text-secondary"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
