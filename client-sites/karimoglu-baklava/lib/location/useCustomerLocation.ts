"use client";

import { useCallback, useEffect, useState } from "react";
import {
  detectCityFromCoordinates,
  loadLocation,
  requestBrowserLocation,
  saveLocation,
  type Coordinates,
  type CustomerCity,
  type StoredLocation,
} from "./customerLocation";

/** وضعیت موقعیت مشتری + عملیات تغییر شهر، «استفاده از موقعیت من» و انتخاب نقطه روی نقشه (ذخیره در مرورگر) */
export function useCustomerLocation() {
  const [location, setLocation] = useState<StoredLocation>({ city: null, coordinates: null });
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    setLocation(loadLocation());
    setIsHydrated(true);
  }, []);

  const selectCity = useCallback((city: CustomerCity) => {
    const next: StoredLocation = { city, coordinates: null }; // انتخاب دستی، مختصات قبلی را بی‌اعتبار می‌کند
    setLocation(next);
    saveLocation(next);
    setMessage(null);
  }, []);

  const detect = useCallback(async () => {
    setIsDetecting(true);
    setMessage(null);
    const result = await requestBrowserLocation();
    setIsDetecting(false);
    if (result.ok) {
      const next: StoredLocation = { city: result.city, coordinates: result.coordinates };
      setLocation(next);
      saveLocation(next);
      setMessage({ kind: "success", text: `موقعیت شما تشخیص داده شد: ${result.city}` });
    } else {
      setMessage({ kind: "error", text: result.message });
    }
  }, []);

  /** ثبت نقطه‌ای که مشتری روی نقشه انتخاب کرده. اگر خارج از محدوده خدمات باشد false برمی‌گرداند و چیزی ذخیره نمی‌شود. */
  const setPoint = useCallback((coordinates: Coordinates): boolean => {
    const detected = detectCityFromCoordinates(coordinates);
    if (!detected) {
      setMessage({ kind: "error", text: "این نقطه خارج از محدوده فعلی خدمات (تهران و همدان) است. نقطه دیگری انتخاب کنید." });
      return false;
    }
    const next: StoredLocation = { city: detected.city, coordinates };
    setLocation(next);
    saveLocation(next);
    setMessage({ kind: "success", text: `موقعیت روی نقشه ثبت شد (${detected.city}).` });
    return true;
  }, []);

  return { location, isHydrated, isDetecting, message, selectCity, detect, setPoint };
}
