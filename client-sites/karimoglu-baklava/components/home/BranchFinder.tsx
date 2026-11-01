"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BranchCard } from "@/components/ui/BranchCard";
import { Button } from "@/components/ui/Button";
import { branches } from "@/lib/mock-data";
import { useCustomerLocation } from "@/lib/location/useCustomerLocation";
import { AnimatePresence, motion } from "motion/react";
import { Reveal } from "@/components/fx/Reveal";

/**
 * نسخه Homepage از Smart Branch Engine (طبق UX Architecture، بخش ۷).
 * چون مختصات دقیق شعب هنوز TODO است، این کامپوننت هنوز نمی‌تواند فاصله واقعی
 * محاسبه کند؛ به‌جای حدس زدن، شهر کاربر را می‌پرسد و شعب همان شهر را نشان می‌دهد —
 * این یک Rule-based Fallback موقت است، دقیقاً طبق تصمیم پیشنهادی Blueprint (بخش 9)،
 * و باید با اتصال به سرویس نقشه واقعی در فاز بعد جایگزین شود.
 */
export function BranchFinder() {
  const [selectedCity, setSelectedCity] = useState<"تهران" | "همدان" | null>(null);

  const locationState = useCustomerLocation();
  const { location, isHydrated, isDetecting, message, selectCity, detect } = locationState;

  // شهر ذخیره‌شده (از سبد خرید یا بازدید قبلی) یا شهر تشخیص‌داده‌شده با GPS، فیلتر شعب را تنظیم می‌کند
  useEffect(() => {
    if (isHydrated && location.city) setSelectedCity(location.city);
  }, [isHydrated, location.city]);

  const visibleBranches = selectedCity
    ? branches.filter((b) => b.city === selectedCity)
    : branches;

  return (
    <section aria-labelledby="branches-heading" className="matte relative bg-bg-primary bg-lattice py-20 tablet:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          id="branches-heading"
          eyebrow="شعب ما"
          title="نزدیک‌ترین شعبه را پیدا کنید"
          description="۶ شعبه فعال در تهران و همدان — همه آماده دریافت سفارش شما."
        />

        <Reveal className="flex flex-wrap items-center gap-3">
          <span className="text-label font-bold text-text-secondary">شهر خود را انتخاب کنید:</span>
          <div
            className="relative flex gap-1 rounded-full border-2 border-brand-black bg-surface p-1 shadow-hard-sm"
            role="group"
            aria-label="انتخاب شهر"
          >
            {(["تهران", "همدان"] as const).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  if (selectedCity === city) setSelectedCity(null);
                  else selectCity(city);
                }}
                aria-pressed={selectedCity === city}
                className="relative rounded-full px-5 py-2 text-bodySm font-bold text-brand-black"
              >
                {selectedCity === city && (
                  <motion.span
                    layoutId="city-pill"
                    className="absolute inset-0 rounded-full bg-honey"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{city}</span>
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={detect} disabled={isDetecting} aria-label="استفاده از موقعیت مکانی من">
            {isDetecting ? "در حال دریافت موقعیت..." : "📍 استفاده از موقعیت من"}
          </Button>
        </Reveal>

        {message && (
          <p
            role={message.kind === "error" ? "alert" : "status"}
            className={`text-caption ${message.kind === "error" ? "text-state-error" : "text-text-secondary"}`}
          >
            {message.text}
          </p>
        )}

        <motion.div layout className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visibleBranches.map((branch, i) => (
              <motion.div
                key={branch.id}
                layout
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <BranchCard branch={branch} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="flex justify-center">
          <Link href="/branches">
            <Button variant="secondary" size="lg">مشاهده همه شعب روی نقشه</Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
