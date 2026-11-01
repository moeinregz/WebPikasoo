"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { formatToman } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { BagIcon, CloseIcon } from "@/components/ui/icons";

export function CartButton() {
  const cart = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`سبد خرید — ${cart.itemCount.toLocaleString("fa-IR")} کالا`}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-black bg-surface text-text-primary shadow-hard-xs transition-all hover:-translate-y-0.5 hover:bg-honey hover:shadow-hard-sm"
      >
        <BagIcon className="h-5 w-5" />
        <AnimatePresence>
          {cart.itemCount > 0 && (
            <motion.span
              key={cart.itemCount}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="absolute -left-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-brand-black bg-brand-red px-1 text-caption font-bold text-white"
            >
              {cart.itemCount.toLocaleString("fa-IR")}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {mounted && createPortal(
      <AnimatePresence>
      {isOpen && (
        <div role="dialog" aria-modal="true" aria-label="سبد خرید" className="fixed inset-0 z-modal flex justify-end">
          <motion.button
            type="button"
            aria-label="بستن سبد خرید"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 z-modalBackdrop bg-brand-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative z-modal flex h-full w-full max-w-sm flex-col border-r-2 border-brand-black bg-cream p-5 shadow-[8px_0_0_0_#DFA03F]"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-fancy text-[28px] text-text-primary">سبد خرید</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="بستن"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-black bg-surface shadow-hard-xs"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            {cart.items.length === 0 ? (
              <p className="text-bodySm text-text-secondary">سبد خرید شما خالی است.</p>
            ) : (
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.lineId} className="flex items-center justify-between gap-2 border-b border-border pb-3 text-bodySm">
                    <div className="flex-1">
                      <p className="text-text-primary">{item.productName}</p>
                      <p className="text-caption text-text-muted">
                        {item.variantLabel} · {item.packagingLabel} × {item.quantity.toLocaleString("fa-IR")}
                      </p>
                    </div>
                    <span className="text-text-primary">
                      {formatToman(item.unitPriceSnapshot * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {cart.items.length > 0 && (
              <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
                <div className="flex justify-between text-bodySm">
                  <span className="text-text-secondary">جمع تقریبی</span>
                  <span className="text-price text-text-primary">{formatToman(cart.optimisticSubtotal)}</span>
                </div>
                <Link href="/cart" onClick={() => setIsOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    مشاهده سبد خرید
                  </Button>
                </Link>
                <Link href="/checkout" onClick={() => setIsOpen(false)}>
                  <Button variant="accent" className="w-full">
                    ادامه به تسویه‌حساب
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
      </AnimatePresence>,
      document.body,
      )}
    </>
  );
}
