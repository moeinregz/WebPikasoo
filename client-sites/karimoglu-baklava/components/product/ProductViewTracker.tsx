"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function ProductViewTracker({ productId, category }: { productId: string; category: string }) {
  useEffect(() => {
    track({ name: "product_view", productId, category });
  }, [productId, category]);

  return null;
}
