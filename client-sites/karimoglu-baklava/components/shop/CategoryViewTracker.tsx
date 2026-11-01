"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function CategoryViewTracker({ category }: { category: string }) {
  useEffect(() => {
    track({ name: "category_view", category });
  }, [category]);

  return null;
}
