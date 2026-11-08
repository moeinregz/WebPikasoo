/** باشگاه مشتریان: سطح‌ها بر اساس جمع خرید، ضریب امتیاز هر سطح */
export const TIERS = [
  { key: "bronze", name: "برنزی", min: 0, mult: 1, color: "#b0743f", perk: "۱ امتیاز به ازای هر خرید" },
  { key: "silver", name: "نقره‌ای", min: 3_000_000, mult: 1.5, color: "#9aa0a6", perk: "۱.۵ برابر امتیاز + ارسال رایگان زودتر" },
  { key: "gold", name: "طلایی", min: 8_000_000, mult: 2, color: "#d9a35b", perk: "۲ برابر امتیاز + هدیه‌ی تولد" },
] as const;

export function tierOf(totalSpent: number) {
  let t: (typeof TIERS)[number] = TIERS[0];
  for (const x of TIERS) if (totalSpent >= x.min) t = x;
  return t;
}

export function nextTier(totalSpent: number) {
  return TIERS.find((t) => t.min > totalSpent) || null;
}

export function pointsFor(amountPaid: number, totalSpentBefore: number, earnPer: number): number {
  if (earnPer <= 0) return 0;
  return Math.floor((amountPaid / earnPer) * tierOf(totalSpentBefore).mult);
}
