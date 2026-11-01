"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { branches } from "@/lib/mock-data";
import { haversineKm, MAX_CITY_DISTANCE_KM, type Coordinates } from "@/lib/location/customerLocation";
import type { useCustomerLocation } from "@/lib/location/useCustomerLocation";

type LocationState = ReturnType<typeof useCustomerLocation>;

/**
 * انتخاب موقعیت مشتری روی «نقشه وب نشان» (نسخه Leaflet).
 * - کلید نقشه از متغیر محیطی NEXT_PUBLIC_NESHAN_MAP_KEY خوانده می‌شود؛ اگر نباشد، این بخش نمایش داده نمی‌شود.
 * - SDK نشان فقط وقتی مشتری «نقشه» را باز کند (و فقط از CDN خود نشان) بارگذاری می‌شود.
 * - با کلیک روی نقشه (یا کشیدن پین) مختصات ثبت می‌شود؛ انتخاب نهایی «نزدیک‌ترین شعبه با موجودی کافی»
 *   سمت سرور و با همین مختصات انجام می‌شود.
 */

// نشان توصیه می‌کند این فایل‌ها محلی/آفلاین استفاده نشوند؛ مستقیم از CDN خودشان بارگذاری می‌شوند.
const SDK_CSS = "https://static.neshan.org/sdk/leaflet/v1.9.4/neshan-sdk/v1.0.8/index.css";
const SDK_JS = "https://static.neshan.org/sdk/leaflet/v1.9.4/neshan-sdk/v1.0.8/index.js";

const TEHRAN_CENTER: Coordinates = { lat: 35.7, lng: 51.39 };
const HAMEDAN_CENTER: Coordinates = { lat: 34.7992, lng: 48.5146 };

// فقط شعبی که فروش آنلاین دارند روی نقشه نشان داده می‌شوند
const onlineBranches = branches.filter((b) => b.acceptsOnlineOrders && b.coordinates);

let sdkPromise: Promise<void> | null = null;

function loadNeshanSdk(): Promise<void> {
  const w = window as any;
  if (w.L && w.L.Map) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${SDK_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = SDK_CSS;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = SDK_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null; // اجازه تلاش دوباره
      reject(new Error("neshan-sdk-load-failed"));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

const CUSTOMER_PIN_HTML =
  '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#c8102e;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45);transform:rotate(-45deg);"></div>';
const BRANCH_PIN_HTML =
  '<div style="width:14px;height:14px;border-radius:50%;background:#1a1a1a;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.5);"></div>';

export function LocationMap({ state }: { state: LocationState }) {
  const mapKey = process.env.NEXT_PUBLIC_NESHAN_MAP_KEY;
  const { location, setPoint } = state;

  const [open, setOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const lastValidRef = useRef<Coordinates | null>(null);
  const setPointRef = useRef(setPoint);
  useEffect(() => {
    setPointRef.current = setPoint;
  }, [setPoint]);

  /** پین مشتری را (در صورت نبودن می‌سازد و) روی نقطه می‌گذارد */
  const placeMarker = useCallback((point: Coordinates) => {
    const L = (window as any).L;
    const map = mapRef.current;
    if (!L || !map) return;
    lastValidRef.current = point;

    if (markerRef.current) {
      markerRef.current.setLatLng([point.lat, point.lng]);
      return;
    }
    const marker = L.marker([point.lat, point.lng], {
      draggable: true,
      icon: L.divIcon({ className: "", html: CUSTOMER_PIN_HTML, iconSize: [22, 22], iconAnchor: [11, 22] }),
    }).addTo(map);
    marker.on("dragend", () => {
      const p = marker.getLatLng();
      const next = { lat: p.lat as number, lng: p.lng as number };
      if (setPointRef.current(next)) {
        lastValidRef.current = next;
      } else if (lastValidRef.current) {
        marker.setLatLng([lastValidRef.current.lat, lastValidRef.current.lng]); // خارج از محدوده: برگرد به آخرین نقطه معتبر
      }
    });
    markerRef.current = marker;
  }, []);

  // ساخت نقشه وقتی مشتری آن را باز می‌کند، و پاک‌سازی هنگام بستن/ترک صفحه
  useEffect(() => {
    if (!open || !mapKey) return;
    let cancelled = false;
    setLoadError(false);

    loadNeshanSdk()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const L = (window as any).L;
        const start = location.coordinates ?? (location.city === "همدان" ? HAMEDAN_CENTER : TEHRAN_CENTER);
        const map = new L.Map(containerRef.current, {
          key: mapKey,
          maptype: "neshan",
          poi: false,
          traffic: false,
          center: [start.lat, start.lng],
          zoom: location.coordinates ? 15 : 12,
        });
        mapRef.current = map;

        for (const b of onlineBranches) {
          L.marker([b.coordinates!.lat, b.coordinates!.lng], {
            icon: L.divIcon({ className: "", html: BRANCH_PIN_HTML, iconSize: [14, 14], iconAnchor: [7, 7] }),
          })
            .addTo(map)
            .bindTooltip(b.name, { direction: "top" });
        }

        map.on("click", (e: any) => {
          const point = { lat: e.latlng.lat as number, lng: e.latlng.lng as number };
          if (setPointRef.current(point)) placeMarker(point);
        });

        if (location.coordinates) placeMarker(location.coordinates);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // فقط با باز/بسته شدن نقشه دوباره ساخته می‌شود
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mapKey]);

  // اگر موقعیت از بیرون عوض شد (مثلاً دکمه «موقعیت من»)، پین و نقشه هم‌گام می‌شوند
  const lat = location.coordinates?.lat;
  const lng = location.coordinates?.lng;
  useEffect(() => {
    if (lat === undefined || lng === undefined || !mapRef.current) return;
    placeMarker({ lat, lng });
    mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), 14));
  }, [lat, lng, placeMarker]);

  const nearest = useMemo(() => {
    if (lat === undefined || lng === undefined) return null;
    const ranked = onlineBranches
      .map((b) => ({ name: b.name, km: haversineKm({ lat, lng }, b.coordinates!) }))
      .sort((a, b) => a.km - b.km);
    const first = ranked[0];
    return first && first.km <= MAX_CITY_DISTANCE_KM ? first : null;
  }, [lat, lng]);

  if (!mapKey) return null; // بدون کلید نقشه، این بخش اصلاً نمایش داده نمی‌شود

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-fit rounded-full border border-border-strong px-4 py-2 text-bodySm text-text-primary transition-colors duration-hover hover:border-brand-black"
      >
        {open ? "بستن نقشه" : "🗺️ انتخاب موقعیت روی نقشه"}
      </button>

      {open && (
        <>
          <p className="text-caption text-text-muted">روی نقشه بزنید یا پین را بکشید. نقطه‌های سیاه، شعبه‌هایی‌اند که سفارش آنلاین دارند.</p>
          <div className="isolate relative h-72 w-full overflow-hidden rounded-lg border border-border bg-bg-secondary">
            <div ref={containerRef} className="h-full w-full" />
          </div>
          {loadError && (
            <p role="alert" className="text-caption text-state-error">
              بارگذاری نقشه انجام نشد. اتصال اینترنت را بررسی کنید یا شهر را دستی انتخاب کنید.
            </p>
          )}
        </>
      )}

      {nearest && (
        <p className="text-caption text-text-secondary">
          نزدیک‌ترین شعبه به این نقطه: {nearest.name} (حدود {nearest.km.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} کیلومتر). شعبه نهایی
          بر اساس موجودی سبد انتخاب می‌شود.
        </p>
      )}
    </div>
  );
}
