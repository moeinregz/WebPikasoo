import { branches } from "@/lib/mock-data";
import type { BranchSummary } from "@/lib/types";
import type {
  BranchSelectionInput,
  BranchSelectionResult,
  CandidateEvaluation,
  SelectedBranchInfo,
} from "./types";
import { getBranchPrepMinutes } from "./types";
import { isBranchActive, isBranchOpenNow } from "./workingHoursService";
import { checkDeliveryFeasibility } from "./feasibilityService";
import { hasSufficientStockForCart } from "./inventoryService";
import { activeDistanceService, calculateDistanceIfPossible } from "./distanceService";
import { calculateDeliveryFee } from "./deliveryFeeFormula";
import { rankCandidates } from "./rankingService";
import { logBranchSelectionDecision } from "./logger";

/**
 * نقطه ورود اصلی ماژول. پیاده‌سازی دقیق مراحل ۱ تا ۹ سند Prompt 8:
 * ۱) بررسی موقعیت مشتری → ۲) فیلتر شعب کاندید → ۳) بررسی کل سبد →
 * ۴) فاصله → ۵) امکان ارسال → ۶) هزینه ارسال → ۷) رتبه‌بندی →
 * ۸) انتخاب نهایی → ۹) حالت جایگزین/خطا.
 *
 * امنیت (بخش «امنیت» Prompt): این تابع تنها منبع تصمیم شعبه/فاصله/هزینه
 * ارسال است. هیچ مقداری از این موارد نباید از ورودی کلاینت مستقیماً پذیرفته
 * و استفاده شود — `BranchSelectionInput` عمداً هیچ فیلد شعبه/فاصله/هزینه‌ای
 * ندارد که کلاینت بتواند «تزریق» کند؛ فقط `preferredBranchId` (که خودش کامل
 * دوباره اعتبارسنجی می‌شود) و مشخصات خام سبد/موقعیت پذیرفته می‌شود.
 */
export async function selectBranchForOrder(input: BranchSelectionInput): Promise<BranchSelectionResult> {
  const cartQuantities = input.cartItems.map((i) => ({
    productId: i.productId,
    variantId: i.variantId,
    quantity: i.quantity,
  }));

  // ===== مرحله ۱: بررسی موقعیت مشتری =====
  // طبق دستور صریح: «اطلاعات مکانی را هرگز حدس نزن». اگر نه مختصات و نه حتی
  // شهر مشخص باشد، سیستم نمی‌تواند تصمیم بگیرد و باید خطای صریح برگرداند —
  // نه یک شعبه تصادفی/پیش‌فرض.
  if (!input.customerLocation.coordinates && !input.customerLocation.city) {
    const result: BranchSelectionResult = {
      status: "no_branch_available",
      selected: null,
      userMessage: "برای پیدا کردن شعبه مناسب، لطفاً موقعیت یا شهر خود را مشخص کنید.",
      evaluations: [],
    };
    logBranchSelectionDecision(input, result);
    return result;
  }

  // ===== انتخاب دستی شعبه =====
  // «انتخاب دستی نباید اعتبارسنجی سیستم را دور بزند» — فقط همان یک شعبه از
  // مراحل ۲ و ۳ عبور داده می‌شود؛ رد شدن هر شرط یعنی انتخاب دستی رد می‌شود.
  // فقط شعبی که فروش آنلاین دارند در انتخاب خودکار شرکت می‌کنند (فعلاً: ستارخان، آریاشهر، تجریش، کوروش مال)
  const onlineBranches = branches.filter((b) => b.acceptsOnlineOrders);
  const customerCity = input.customerLocation.city;
  if (!input.preferredBranchId && customerCity && !onlineBranches.some((b) => b.city === customerCity)) {
    const result: BranchSelectionResult = {
      status: "no_branch_available",
      selected: null,
      userMessage: `فروش آنلاین در ${customerCity} در حال حاضر فعال نیست.`,
      evaluations: [],
    };
    logBranchSelectionDecision(input, result);
    return result;
  }

  const branchPool = input.preferredBranchId
    ? branches.filter((b) => b.id === input.preferredBranchId)
    : onlineBranches;

  if (input.preferredBranchId && branchPool.length === 0) {
    const result: BranchSelectionResult = {
      status: "manual_branch_rejected",
      selected: null,
      userMessage: "شعبه انتخاب‌شده یافت نشد.",
      evaluations: [],
    };
    logBranchSelectionDecision(input, result);
    return result;
  }

  // ===== مرحله ۲: فیلتر شعب کاندید (فعال/ساعت کاری/امکان ارسال) =====
  // ===== مرحله ۳: بررسی کل سبد در برابر موجودی هر شعبه کاندید =====
  const evaluations: CandidateEvaluation[] = [];
  for (const branch of branchPool) {
    evaluations.push(await evaluateBranch(branch, input, cartQuantities));
  }

  const passedCandidates = evaluations.filter((e) => e.passed);

  if (passedCandidates.length === 0) {
    const result: BranchSelectionResult = input.preferredBranchId
      ? {
          status: "manual_branch_rejected",
          selected: null,
          userMessage: rejectionMessageFor(evaluations[0]),
          evaluations,
        }
      : {
          status: "no_branch_available",
          selected: null,
          userMessage: "در حال حاضر هیچ شعبه‌ای امکان تأمین کامل اقلام این سفارش را ندارد.",
          evaluations,
        };
    logBranchSelectionDecision(input, result);
    return result;
  }

  // ===== مرحله ۷: رتبه‌بندی شعب کاندید معتبر =====
  const ranked = rankCandidates(passedCandidates);
  const winner = ranked[0]!;
  const winnerBranch = branches.find((b) => b.id === winner.branchId)!;

  // ===== مرحله ۸: انتخاب نهایی =====
  const prepMinutes = getBranchPrepMinutes(winnerBranch);
  const transitMinutes = winner.distance?.durationMinutes ?? null;

  const selected: SelectedBranchInfo = {
    branchId: winner.branchId,
    branchName: winner.branchName,
    distanceKm: winner.distance?.distanceKm ?? null,
    prepMinutes,
    etaMinutesMin: prepMinutes + (transitMinutes ?? 0),
    etaMinutesMax: prepMinutes + (transitMinutes !== null ? Math.round(transitMinutes * 1.6) : 0),
    deliveryFee: winner.deliveryFee ?? { fee: null, isEstimate: false, reason: "formula_not_configured" },
    reason: buildSelectionReason(winner, ranked.length, evaluations, input.preferredBranchId),
  };

  const result: BranchSelectionResult = {
    status: "selected",
    selected,
    evaluations,
  };
  logBranchSelectionDecision(input, result);
  return result;
}

async function evaluateBranch(
  branch: BranchSummary,
  input: BranchSelectionInput,
  cartQuantities: { productId: string; variantId: string; quantity: number }[],
): Promise<CandidateEvaluation> {
  const base = {
    branchId: branch.id,
    branchName: branch.name,
    missingProductIds: [] as string[],
    distance: null,
    deliveryFee: null,
    prepMinutes: getBranchPrepMinutes(branch),
  };

  if (!isBranchActive(branch)) {
    return { ...base, passed: false, rejectionReason: "inactive" };
  }
  if (!branch.acceptsOnlineOrders) {
    return { ...base, passed: false, rejectionReason: "online_orders_disabled" };
  }
  if (!isBranchOpenNow(branch, input.now)) {
    return { ...base, passed: false, rejectionReason: "closed" };
  }

  const feasibility = checkDeliveryFeasibility(branch, input.customerLocation, input.deliveryMethod);
  if (!feasibility.feasible) {
    return { ...base, passed: false, rejectionReason: feasibility.reason };
  }

  // فاصله پیش از بررسی موجودی محاسبه می‌شود تا حتی شعبه‌ای که به‌خاطر موجودی رد می‌شود، فاصله‌اش
  // در ارزیابی ثبت شود (برای توضیح اینکه چرا «نزدیک‌ترین شعبه» انتخاب نشد).
  const distance = calculateDistanceIfPossible(
    activeDistanceService,
    branch.coordinates,
    input.customerLocation.coordinates,
  );

  const stockCheck = await hasSufficientStockForCart(branch.id, cartQuantities);
  if (!stockCheck.sufficient) {
    return {
      ...base,
      distance,
      passed: false,
      rejectionReason: "cart_not_fully_available",
      missingProductIds: stockCheck.missingProductIds,
    };
  }

  // ===== مرحله ۶: هزینه ارسال (فرمول قابل‌تنظیم، بدون عدد ساختگی) =====
  const deliveryFee = calculateDeliveryFee(distance?.distanceKm ?? null, input.deliveryMethod);

  return { ...base, passed: true, distance, deliveryFee };
}

function rejectionMessageFor(evaluation: CandidateEvaluation | undefined): string {
  switch (evaluation?.rejectionReason) {
    case "inactive":
      return "این شعبه در حال حاضر فعال نیست.";
    case "online_orders_disabled":
      return "این شعبه فعلاً سفارش آنلاین نمی‌پذیرد.";
    case "closed":
      return "این شعبه در حال حاضر خارج از ساعات کاری است.";
    case "delivery_method_unsupported":
      return "این شعبه روش ارسال انتخابی شما را پشتیبانی نمی‌کند.";
    case "out_of_service_area":
      return "این شعبه امکان ارسال به موقعیت شما را ندارد.";
    case "cart_not_fully_available":
      return "این شعبه نمی‌تواند تمام اقلام سبد شما را هم‌زمان تأمین کند.";
    default:
      return "این شعبه در حال حاضر قابل انتخاب نیست. لطفاً شعبه دیگری را انتخاب کنید.";
  }
}

function buildSelectionReason(
  winner: CandidateEvaluation,
  candidateCount: number,
  evaluations: CandidateEvaluation[],
  preferredBranchId?: string,
): string {
  if (preferredBranchId) return "انتخاب دستی مشتری — تمام شرایط لازم بررسی و تأیید شد.";

  // اگر فاصله‌ها معلوم باشند: آیا نزدیک‌ترین شعبه رد شده و شعبه بعدی انتخاب شده است؟
  const withDistance = evaluations.filter((e) => e.distance !== null);
  if (winner.distance && withDistance.length > 0) {
    const nearest = [...withDistance].sort((a, b) => a.distance!.distanceKm - b.distance!.distanceKm)[0]!;
    if (nearest.branchId !== winner.branchId) {
      return `نزدیک‌ترین شعبه (${nearest.branchName}) امکان تأمین کامل این سفارش را نداشت؛ نزدیک‌ترین شعبه بعدی که کل سفارش را دارد انتخاب شد.`;
    }
    return "نزدیک‌ترین شعبه‌ای که می‌تواند تمام اقلام سبد را تأمین کند.";
  }

  if (candidateCount === 1) return "تنها شعبه‌ای که می‌تواند تمام اقلام سبد را هم‌زمان تأمین کند.";
  return "یکی از شعبی که می‌تواند تمام اقلام سبد را تأمین کند (برای انتخاب نزدیک‌ترین شعبه، موقعیت مکانی لازم است).";
}
