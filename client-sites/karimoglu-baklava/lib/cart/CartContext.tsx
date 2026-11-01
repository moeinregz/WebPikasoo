"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import type { CartItem, CartItemConfig } from "@/lib/types";
import { loadCartFromStorage, saveCartToStorage } from "./storage";

/**
 * طبق بخش ۱ Prompt 7: هر آیتم سبد «پیکربندی دقیق خرید» را نگه می‌دارد (نه
 * فقط شناسه محصول). `lineId` بر اساس ترکیب محصول+Variant+بسته‌بندی ساخته
 * می‌شود تا افزودن دوباره همان ترکیب، تعداد را جمع بزند نه یک ردیف جدید بسازد.
 *
 * ⚠️ این Context «سبد مهمان» را به‌صورت کامل پیاده می‌کند (ذخیره در
 * localStorage). «ادغام سبد مهمان با سبد کاربر بعد از ورود» (بخش ۱) به یک
 * سیستم احراز هویت واقعی نیاز دارد که هنوز در پروژه پیاده نشده (Blueprint،
 * بخش ۱۴ — Open Decision)؛ `mergeGuestCartWithUserCart` پایین به‌عنوان یک
 * Hook Point آماده تعریف شده تا با افزودن Auth، فقط بدنه آن پر شود.
 */

type CartAction =
  | { type: "ADD_ITEM"; item: CartItemConfig & { unitPriceSnapshot: number } }
  | { type: "REMOVE_ITEM"; lineId: string }
  | { type: "SET_QUANTITY"; lineId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; items: CartItem[] };

function buildLineId(config: CartItemConfig): string {
  return `${config.productId}__${config.variantId}__${config.packagingId}`;
}

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "HYDRATE":
      return action.items;

    case "ADD_ITEM": {
      const lineId = buildLineId(action.item);
      const existing = state.find((i) => i.lineId === lineId);
      if (existing) {
        return state.map((i) =>
          i.lineId === lineId ? { ...i, quantity: i.quantity + action.item.quantity } : i,
        );
      }
      const newItem: CartItem = { ...action.item, lineId, addedAt: new Date().toISOString() };
      return [...state, newItem];
    }

    case "REMOVE_ITEM":
      return state.filter((i) => i.lineId !== action.lineId);

    case "SET_QUANTITY":
      if (action.quantity <= 0) return state.filter((i) => i.lineId !== action.lineId);
      return state.map((i) => (i.lineId === action.lineId ? { ...i, quantity: action.quantity } : i));

    case "CLEAR_CART":
      return [];

    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  /** جمع تقریبی بر اساس Snapshot سمت کلاینت — فقط برای نمایش سریع، هرگز منبع پرداخت نیست (بخش ۲ Prompt 7) */
  optimisticSubtotal: number;
  addItem: (config: CartItemConfig, unitPriceSnapshot: number) => void;
  removeItem: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const isHydrated = useRef(false);

  useEffect(() => {
    dispatch({ type: "HYDRATE", items: loadCartFromStorage() });
    isHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!isHydrated.current) return; // از رونویسی localStorage با آرایه خالی اولیه پیش از Hydration جلوگیری می‌کند
    saveCartToStorage(items);
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const optimisticSubtotal = items.reduce((sum, i) => sum + i.unitPriceSnapshot * i.quantity, 0);

    return {
      items,
      itemCount,
      optimisticSubtotal,
      addItem: (config, unitPriceSnapshot) => {
        dispatch({ type: "ADD_ITEM", item: { ...config, unitPriceSnapshot } });
      },
      removeItem: (lineId) => dispatch({ type: "REMOVE_ITEM", lineId }),
      setQuantity: (lineId, quantity) => dispatch({ type: "SET_QUANTITY", lineId, quantity }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart باید داخل CartProvider استفاده شود.");
  return ctx;
}

/**
 * Hook Point آماده برای «ادغام سبد مهمان با سبد کاربر بعد از ورود» —
 * طبق بخش ۱ Prompt 7. تا پیاده‌سازی احراز هویت واقعی (Blueprint بخش ۱۴)،
 * این تابع فقط سبد فعلی مرورگر را برمی‌گرداند (چیزی برای ادغام نیست چون
 * سبد سمت سرور/کاربر هنوز وجود ندارد).
 */
export function mergeGuestCartWithUserCart(guestItems: CartItem[], _userId: string): CartItem[] {
  // TODO: پس از پیاده‌سازی احراز هویت، سبد ذخیره‌شده کاربر از سرور خوانده و
  // با guestItems ادغام شود (معمولاً: جمع تعداد برای lineId های مشترک، افزودن بقیه)
  return guestItems;
}
