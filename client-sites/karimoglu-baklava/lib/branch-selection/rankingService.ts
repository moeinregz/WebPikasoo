import type { CandidateEvaluation, RankingCriterion } from "./types";
import { DEFAULT_RANKING_ORDER, getBranchPrepMinutes } from "./types";
import { branches } from "@/lib/mock-data";

/**
 * طبق بخش ۷ Prompt: مراحل ۱ تا ۴ اولویت (تأمین کل سبد، امکان ارسال، فعال
 * بودن، موجودی کافی) پیش از رسیدن به این سرویس به‌صورت فیلتر سخت (Hard
 * Filter) در `branchSelectionService` اعمال شده‌اند — یعنی فقط شعبی که همه
 * این شرایط را دارند به این‌جا می‌رسند. این سرویس صرفاً اولویت‌های نرم باقی‌مانده
 * (زمان تحویل کمتر، فاصله کمتر) را با ترتیب قابل‌تنظیم اعمال می‌کند.
 */
function getSortValue(evaluation: CandidateEvaluation, criterion: RankingCriterion): number {
  const branch = branches.find((b) => b.id === evaluation.branchId);
  switch (criterion) {
    case "delivery_time": {
      const transit = evaluation.distance?.durationMinutes ?? Number.POSITIVE_INFINITY;
      const prep = branch ? getBranchPrepMinutes(branch) : evaluation.prepMinutes;
      return prep + transit;
    }
    case "distance":
      return evaluation.distance?.distanceKm ?? Number.POSITIVE_INFINITY;
    default:
      return 0;
  }
}

export function rankCandidates(
  candidates: CandidateEvaluation[],
  order: RankingCriterion[] = DEFAULT_RANKING_ORDER,
): CandidateEvaluation[] {
  return [...candidates].sort((a, b) => {
    for (const criterion of order) {
      const x = getSortValue(a, criterion);
      const y = getSortValue(b, criterion);
      if (x === y) continue; // شامل حالت «هر دو نامشخص» (Infinity): قبلاً Infinity - Infinity = NaN ترتیب را بی‌معنا می‌کرد
      if (!Number.isFinite(x)) return 1; // فاصله نامشخص بعد از فاصله معلوم
      if (!Number.isFinite(y)) return -1;
      return x - y;
    }
    return 0; // برابر: ترتیب اصلی لیست حفظ می‌شود (Sort در Node پایدار است)
  });
}
