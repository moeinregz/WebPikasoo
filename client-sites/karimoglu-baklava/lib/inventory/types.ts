// ===== سیستم مدیریت موجودی — مدل‌های دامنه (Prompt 9) =====
//
// طبق الزام صریح Prompt («این مفاهیم را در یک Entity قرار نده»)، مدل‌های زیر
// عمداً از هم مجزا نگه داشته شده‌اند: موجودی شعبه، موجودی انبار مرکزی،
// تراکنش موجودی (Audit Trail)، رزرو موجودی، و آستانه موجودی کم — هرکدام
// مسئولیت واحد خودشان را دارند.
//
// نکته مهم دامنه: کلید طبیعی موجودی «شعبه + محصول + Variant» است (نه فقط
// محصول)، چون واحد فروش واقعی همان Variant است (مثلاً «باقلوا پسته‌ای، ۵۰۰
// گرم» با «۱ کیلو» موجودی متفاوت دارند). بسته‌بندی (Packaging) عمداً در این
// مرحله به‌عنوان یک بُعد جداگانه موجودی مدل نشده — طبق داده کسب‌وکار فعلی،
// بسته‌بندی فقط روی قیمت/ظاهر تأثیر دارد نه این‌که خودش کالای محدودی باشد؛
// این یک تصمیم معماری آگاهانه است (نه فراموشی) که در گزارش پایانی توضیح داده
// شده و در صورت نیاز آینده (مثلاً «جعبه ویژه» با تیراژ محدود)، به‌سادگی با
// افزودن packagingId به کلید `InventoryKey` قابل توسعه است بدون شکستن API.

export interface InventoryKey {
  branchId: string;
  productId: string;
  variantId: string;
}

/** کلید رشته‌ای پایدار برای نگاشت‌های حافظه — معادل Compound Primary Key در دیتابیس واقعی */
export function inventoryKeyOf(k: InventoryKey): string {
  return `${k.branchId}::${k.productId}::${k.variantId}`;
}

// ===== موجودی شعبه =====

export interface BranchInventoryRecord {
  branchId: string;
  productId: string;
  variantId: string;
  /** موجودی فیزیکی واقعی داخل شعبه */
  onHand: number;
  /** موجودی رزروشده برای سفارش‌های در انتظار پرداخت/تکمیل */
  reserved: number;
  /** مجموع تجمعی فروخته‌شده (فقط برای گزارش‌گیری؛ از onHand کسر نمی‌شود دوباره) */
  sold: number;
  updatedAt: string;
}

/** موجودی قابل فروش — هرگز فیلد مستقل ذخیره‌شده نیست تا هرگز Desync نشود؛ همیشه محاسبه‌شده است */
export function getAvailable(record: Pick<BranchInventoryRecord, "onHand" | "reserved">): number {
  return Math.max(0, record.onHand - record.reserved);
}

// ===== انبار مرکزی =====
// طبق الزام صریح Prompt: «موجودی انبار مرکزی بلافاصله برای سفارش مشتری قابل
// استفاده نیست» — بنابراین انبار مرکزی هرگز در مسیر Checkout/Branch-Selection
// خوانده نمی‌شود؛ فقط منبع Transfer دستی به شعبه است (فرآیند دقیق آن هنوز
// طبق کسب‌وکار مشخص نشده، پس صرفاً یک عملیات Transfer پایه فراهم شده).

export interface WarehouseInventoryRecord {
  warehouseId: string;
  productId: string;
  variantId: string;
  onHand: number;
  updatedAt: string;
}

// ===== تراکنش موجودی (Audit Trail) =====

export type InventoryTransactionType =
  | "manual_entry" // اولین ورود موجودی برای یک ترکیب شعبه/محصول/Variant
  | "manual_adjustment" // اصلاح دستی توسط ادمین/مدیر شعبه (افزایش یا کاهش)
  | "reservation_created" // رزرو موجودی برای سفارش
  | "reservation_released" // آزادسازی رزرو (لغو/شکست پرداخت/انقضا)
  | "sale_committed" // تبدیل رزرو به فروش قطعی (پرداخت موفق)
  | "order_cancelled" // لغو سفارشی که فروش آن قبلاً قطعی شده بود (Reversal)
  | "warehouse_receipt" // ورود موجودی به انبار مرکزی
  | "warehouse_transfer_out" // خروج از انبار مرکزی برای انتقال به شعبه
  | "branch_transfer_in" // ورود به شعبه از انبار مرکزی
  | "correction"; // اصلاح یک اشتباه ثبت‌شده قبلی (Audit صریح)

export interface InventoryTransaction {
  id: string;
  type: InventoryTransactionType;
  branchId: string | null;
  warehouseId: string | null;
  productId: string;
  variantId: string;
  /** تغییر خالص onHand (برای رزرو/آزادسازی که onHand را تغییر نمی‌دهند، صفر است — تغییر reserved در فیلدهای before/after ثبت می‌شود) */
  onHandDelta: number;
  onHandBefore: number;
  onHandAfter: number;
  reservedBefore: number;
  reservedAfter: number;
  orderId: string | null;
  actorId: string;
  actorRole: string;
  reason: string | null;
  createdAt: string;
}

// ===== رزرو موجودی =====
// هر رزرو کل سبد یک سفارش را (در یک شعبه) به‌صورت یک واحد نگه می‌دارد —
// چون رزرو/آزادسازی/فروش همیشه در سطح کل سفارش اتفاق می‌افتد، نه تک‌تک اقلام.

export type ReservationStatus = "active" | "released" | "committed" | "expired";

export interface ReservationLine {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface InventoryReservation {
  id: string;
  orderId: string;
  branchId: string;
  items: ReservationLine[];
  status: ReservationStatus;
  createdAt: string;
  /** TODO: هنوز هیچ Job زمان‌بندی‌شده‌ای برای Expire خودکار وجود ندارد — طبق گزارش پایانی بخش TODOها */
  expiresAt: string | null;
  releasedAt: string | null;
  committedAt: string | null;
  releaseReason: string | null;
}

// ===== آستانه موجودی کم =====
// طبق الزام «آستانه را Hard-code نکن» — قابل تنظیم در چند سطح: پیش‌فرض کلی،
// یا اختصاصی برای یک شعبه/محصول/Variant خاص (دقیق‌ترین رکورد منطبق برنده است).

export interface LowStockThreshold {
  id: string;
  branchId: string | null;
  productId: string | null;
  variantId: string | null;
  threshold: number;
  updatedAt: string;
}

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

// ===== نتایج سرویس =====

export interface CartAvailabilityItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CartAvailabilityCheck {
  sufficient: boolean;
  insufficientItems: { productId: string; variantId: string; requested: number; available: number }[];
}

export interface BranchInventoryOverviewRow extends BranchInventoryRecord {
  available: number;
  productName: string;
  variantLabel: string;
  categoryLabel: string;
}

export interface InventorySummary {
  branchCount: number;
  trackedSkuCount: number;
  outOfStockCount: number;
  lowStockCount: number;
  activeReservationCount: number;
}
