import { getProductDetailById } from "@/lib/server/catalog";
import { priceCartItem } from "@/lib/pricing";
import { selectBranchForOrder } from "@/lib/branch-selection/branchSelectionService";
import type { CartIssue, CartItem, CartValidationResult, DeliveryMethod } from "@/lib/types";

/**
 * اجرای دقیق چک‌لیست بخش ۳ Prompt 7، به‌علاوه اتصال به ماژول کامل انتخاب
 * شعبه (Prompt 8) به‌جای منطق ساده قبلی. این تابع هم توسط Route Handler
 * (`/api/cart/validate`, منبع حقیقت) و هم می‌تواند در تست واحد فراخوانی شود.
 * هرگز نباید فقط سمت کلاینت اجرا شود — اعتبارسنجی سمت کلاینت (در صورت وجود)
 * فقط برای تجربه سریع‌تر UI است، نه به‌عنوان دروازه امنیتی.
 */
export async function validateCart(
  items: CartItem[],
  context: {
    city: "تهران" | "همدان" | null;
    coordinates?: { lat: number; lng: number } | null;
    deliveryMethod?: DeliveryMethod;
    preferredBranchId?: string;
    now?: Date;
  },
): Promise<CartValidationResult> {
  const issues: CartIssue[] = [];

  for (const item of items) {
    const product = await getProductDetailById(item.productId);

    if (!product) {
      issues.push({ lineId: item.lineId, code: "product_not_found", message: `${item.productName} دیگر در دسترس نیست.` });
      continue;
    }

    if (!product.isAvailable) {
      issues.push({ lineId: item.lineId, code: "product_inactive", message: `${product.name} در حال حاضر ناموجود است.` });
      continue;
    }

    const saleGroup = product.saleTypes.find((g) => g.type === item.saleType);
    const variant = saleGroup?.variants.find((v) => v.id === item.variantId);
    if (!variant) {
      issues.push({
        lineId: item.lineId,
        code: "variant_not_found",
        message: `گزینه انتخاب‌شده برای ${product.name} دیگر موجود نیست.`,
      });
      continue;
    }
    if (!variant.isAvailable) {
      issues.push({
        lineId: item.lineId,
        code: "out_of_stock",
        message: `${product.name} (${variant.label}) در حال حاضر ناموجود است.`,
      });
      continue;
    }

    if (item.packagingId) {
      const packaging = product.packagingOptions.find((p) => p.id === item.packagingId);
      if (!packaging) {
        issues.push({
          lineId: item.lineId,
          code: "packaging_not_found",
          message: `بسته‌بندی انتخاب‌شده برای ${product.name} دیگر موجود نیست.`,
        });
        continue;
      }
    }

    const priceBreakdown = await priceCartItem(item);
    if (priceBreakdown.priceChanged) {
      issues.push({
        lineId: item.lineId,
        code: "price_changed",
        message: `قیمت ${product.name} به‌روزرسانی شده است.`,
      });
    }
  }

  const selection = await selectBranchForOrder({
    cartItems: items,
    customerLocation: { coordinates: context.coordinates ?? null, city: context.city },
    deliveryMethod: context.deliveryMethod ?? "express",
    preferredBranchId: context.preferredBranchId,
    now: context.now,
  });

  const branchResolution = {
    status: selection.status === "selected" ? ("resolved" as const) : ("unresolved" as const),
    branchId: selection.selected?.branchId ?? null,
    branchName: selection.selected?.branchName ?? null,
    unavailableProductIds: selection.evaluations.flatMap((e) => e.missingProductIds),
  };

  if (selection.status !== "selected" && items.length > 0) {
    issues.push({
      lineId: "__cart__",
      code: "branch_unavailable",
      message: selection.userMessage ?? "هیچ شعبه‌ای در حال حاضر نمی‌تواند کل سبد شما را هم‌زمان تأمین کند.",
    });
  }

  return { isValid: issues.length === 0, issues, branchResolution };
}
