"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

/**
 * گالری تعاملی (Thumbnail، Zoom، Swipe، Fullscreen). عکس‌ها همان‌هایی‌اند که
 * از پنل ادمین برای محصول آپلود شده‌اند؛ اگر محصولی هنوز عکس نداشته باشد،
 * یک ImagePlaceholder نمایش داده می‌شود (نه تصویر جعلی).
 */
function Slide({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  if (!src) return <ImagePlaceholder label={`${alt} — به‌زودی`} aspectClassName="aspect-square" className={className} />;
  return (
    <div className={`aspect-square overflow-hidden rounded-image border border-border bg-bg-secondary ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

export function ProductGallery({
  productId,
  productName,
  imageUrls,
}: {
  productId: string;
  productName: string;
  imageUrls: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const images: (string | undefined)[] = imageUrls.length > 0 ? imageUrls : [undefined];
  const hasImages = imageUrls.length > 0;

  function selectImage(index: number) {
    setActiveIndex(index);
    setIsZoomed(false);
    track({ name: "gallery_image_view", productId, imageIndex: index });
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative cursor-zoom-in overflow-hidden rounded-lg"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {/* Swipe در موبایل: اسکرول افقی با Snap روی همین container در صفحات کوچک */}
        <div
          className="flex snap-x snap-mandatory overflow-x-auto tablet:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(e) => {
            const el = e.currentTarget;
            const index = Math.round(el.scrollLeft / el.clientWidth);
            if (index !== activeIndex) selectImage(index);
          }}
        >
          {images.map((src, i) => (
            <div key={i} className="w-full shrink-0 snap-center">
              <Slide src={src} alt={`تصویر ${i + 1} از ${productName}`} />
            </div>
          ))}
        </div>

        <div className="hidden tablet:block">
          <Slide
            src={images[activeIndex]}
            alt={`تصویر ${activeIndex + 1} از ${productName}`}
            className={`transition-transform duration-hover ${isZoomed ? "scale-110" : "scale-100"}`}
          />
        </div>

        {hasImages && (
        <button
          type="button"
          onClick={() => {
            setIsFullscreen(true);
            track({ name: "gallery_fullscreen_open", productId });
          }}
          aria-label="نمایش تمام‌صفحه گالری"
          className="absolute left-3 top-3 hidden h-9 w-9 items-center justify-center rounded-full bg-surface/90 shadow-sm tablet:flex"
        >
          <span aria-hidden="true">⤢</span>
        </button>
        )}
      </div>

      {images.length > 1 && (
      <div className="flex gap-2" role="tablist" aria-label="تصاویر محصول">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={activeIndex === i}
            aria-label={`نمایش تصویر ${i + 1}`}
            onClick={() => selectImage(i)}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
              activeIndex === i ? "border-brand-red" : "border-border"
            }`}
          >
            <Slide src={src} alt={`بندانگشتی ${i + 1}`} className="h-full w-full !rounded-none !border-0" />
          </button>
        ))}
      </div>
      )}

      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`نمایش تمام‌صفحه تصاویر ${productName}`}
          className="fixed inset-0 z-modal flex items-center justify-center bg-brand-black/95 p-6"
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            aria-label="بستن نمای تمام‌صفحه"
            className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface/20 text-text-inverse hover:bg-surface/30"
          >
            ✕
          </button>
          <div className="w-full max-w-2xl">
            <Slide
              src={images[activeIndex]}
              alt={`تصویر ${activeIndex + 1} از ${productName}`}
              className="border-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
