// انواع داده پایه — مطابق مدل داده مفهومی تعریف‌شده در Blueprint معماری (Prompt 1)
// این‌ها ساختار داده هستند، نه داده واقعی؛ داده‌های نمونه در mock-data.ts
// با علامت صریح TODO مشخص شده‌اند تا با API واقعی جایگزین شوند.

// ⚠️ اصلاح این مرحله: دسته‌بندی‌های قبلی («استانبولی»، «شیرینی خشک»،
// «دنر کباب»، «فست‌فود») بخشی Placeholder بودند. حالا که منوی واقعی
// (عکس‌های ارسالی مجموعه) دریافت شده، دسته‌بندی‌ها با ساختار واقعی منو
// جایگزین شدند. برخی دسته‌ها فقط در شعب خاص موجودند (رجوع به
// lib/menuProductsData.ts برای Availability دقیق هر محصول).
export type ProductCategory =
  | "baklava" // باقلوا (کیلویی/اسلایسی) — همه شعب
  | "arabic-baklava" // باقلوا عربی — همه شعب
  | "kunafa" // کنافه — همه شعب
  | "mix" // معجون — همه شعب
  | "dessert" // دسر — همه شعب
  | "drinks" // نوشیدنی — همه شعب
  | "pizza" // پیتزا — فقط شعبه تجریش
  | "sandwich" // ساندویچ و برگر — فقط شعبه تجریش
  | "sides-pasta" // سیب‌زمینی، سوخاری و پاستا — فقط شعبه تجریش
  | "turkish-kebab" // کباب ترکی استانبولی و استیک — فقط شعبه تجریش
  | "bakery" // نان‌های شیرین و کیک — فقط شعبه پیروزی
  | "breakfast"; // صبحانه — فقط شعبه پیروزی

export type UnitType = "weight" | "count" | "box";

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  /** قیمت شروع (چون محصول واحد فروش متعدد دارد) — به تومان */
  startingPrice: number;
  previousPrice?: number;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  isAvailable: boolean;
  /** آیا واحد فروش پیش‌فرض ساده دارد (برای نمایش دکمه افزودن سریع) */
  hasSimpleDefaultUnit: boolean;
  /** روش فروش این محصول — مبنای فیلتر «وزنی/عددی/جعبه‌ای» */
  unitType: UnitType;
  /** برای مرتب‌سازی «جدیدترین» — در نبود سیستم واقعی موجودی، Index ورود به کاتالوگ */
  addedIndex: number;
  /** عکس اصلی محصول (آپلودشده از پنل ادمین) — اگر نباشد Placeholder نمایش داده می‌شود */
  imageUrl?: string;
}

export type SortOption = "popular" | "newest" | "price-asc" | "price-desc";

export interface ShopFilterState {
  q?: string;
  unit?: UnitType[];
  onlyAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  page?: number;
}

export interface BranchSummary {
  id: string;
  slug: string;
  name: string;
  city: "تهران" | "همدان";
  /** TODO: آدرس دقیق هنوز ارسال نشده — طبق Blueprint بخش 30 */
  shortArea: string | null;
  phone: string | null;
  openingHours: string;
  hasCafeService: boolean;
  hasPos: boolean;
  /** پرداخت درب منزل — اطلاعات واقعی دریافت‌شده: فقط شعبه تجریش فعلاً این قابلیت را دارد */
  supportsCashOnDelivery: boolean;
  /** TODO: مختصات هنوز ارسال نشده */
  coordinates: { lat: number; lng: number } | null;
  /** TODO: محدوده دقیق سرویس‌دهی (شعاع یا Polygon) — Blueprint بخش ۳۰. تا تکمیل، null */
  serviceRadiusKm: number | null;
  /** بر اساس اطلاعات فعلی کسب‌وکار هر دو روش برای همه شعب فعال فرض شده؛ در آینده به ازای هر شعبه قابل تنظیم است */
  supportedDeliveryMethods: DeliveryMethod[];
  status: "active" | "inactive";
}

export interface CategoryShowcaseItem {
  id: ProductCategory;
  label: string;
  description: string;
  /** یک پاراگراف کوتاه معرفی برای صفحه دسته (فقط حقایق تأییدشده، نه محتوای بازاریابی جعلی) */
  intro: string;
  metaDescription: string;
}

// ===== Product Detail (صفحه محصول) =====

export interface SaleVariant {
  id: string;
  label: string;
  price: number;
  isAvailable: boolean;
}

export interface SaleTypeGroup {
  type: UnitType;
  label: string;
  variants: SaleVariant[];
}

export interface PackagingOption {
  id: string;
  label: string;
  priceDelta: number;
}

export interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  /** تاریخ به فرمت ISO — نمایش با toLocaleDateString("fa-IR") */
  date: string;
  text: string;
  verifiedPurchase: boolean;
}

export interface ProductDetail extends ProductSummary {
  descriptionIntro: string;
  features: string[];
  saleTypes: SaleTypeGroup[];
  packagingOptions: PackagingOption[];
  reviews: ReviewItem[];
  /** تعداد اسلات تصویر Gallery (چون تصاویر واقعی هنوز TODO است) */
  imageCount: number;
}

// ===== Cart (سبد خرید) =====
// طبق الزام صریح Prompt 7: هر آیتم سبد باید «پیکربندی دقیق خرید» را نگه دارد،
// نه فقط شناسه محصول. قیمت‌های داخل CartItem صرفاً برای نمایش خوش‌بینانه
// (Optimistic UI) سمت کلاینت‌اند و هرگز به‌عنوان منبع حقیقت پرداخت استفاده
// نمی‌شوند — منبع حقیقت همیشه `lib/pricing.ts` سمت سرور (Route Handler) است.

export interface CartItemConfig {
  productId: string;
  productSlug: string;
  productName: string;
  categoryLabel: string;
  saleType: UnitType;
  variantId: string;
  variantLabel: string;
  packagingId: string;
  packagingLabel: string;
  quantity: number;
}

export interface CartItem extends CartItemConfig {
  /** شناسه یکتای همین ترکیب انتخاب (محصول+Variant+بسته‌بندی) داخل سبد */
  lineId: string;
  /** قیمت واحد در لحظه افزودن — فقط برای نمایش سریع، نه منبع حقیقت */
  unitPriceSnapshot: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  /** شناسه کاربر پس از ورود؛ در حالت مهمان null */
  customerId: string | null;
  updatedAt: string;
}

// ===== Pricing (محاسبه قیمت مرکزی) =====

export interface CartItemPriceBreakdown {
  lineId: string;
  productId: string;
  unitBasePrice: number;
  packagingDelta: number;
  quantity: number;
  lineSubtotal: number;
  productDiscountAmount: number;
  lineTotal: number;
  /** پرچم عدم‌تطابق با قیمت نمایش‌داده‌شده در فرانت (برای هشدار «تغییر قیمت») */
  priceChanged: boolean;
}

export interface CartPricingResult {
  items: CartItemPriceBreakdown[];
  subtotal: number;
  productDiscountTotal: number;
  campaignDiscountTotal: number;
  couponDiscountTotal: number;
  /** ۰ وقتی هنوز فرمول/فاصله مشخص نیست — به همراه deliveryFeeIsPending:true */
  deliveryFee: number;
  /** true یعنی هزینه ارسال واقعی هنوز قابل‌محاسبه نیست (فرمول تنظیم‌نشده یا فاصله نامشخص) — طبق Prompt 8 هرگز عدد ساختگی جایگزین آن نمی‌شود */
  deliveryFeeIsPending: boolean;
  total: number;
  couponCode?: string;
  couponError?: string;
}

// ===== Branch Resolution (انتخاب هوشمند شعبه) =====

export interface BranchResolutionResult {
  status: "resolved" | "unresolved";
  branchId: string | null;
  branchName: string | null;
  /** فقط برای شفافیت داخلی/دیباگ — هرگز عیناً به UI کاربر نمایش داده نمی‌شود (طبق UX Architecture بخش ۷) */
  unavailableProductIds: string[];
}

// ===== Cart Validation (اعتبارسنجی پیش از Checkout) =====

export type CartIssueCode =
  | "product_not_found"
  | "product_inactive"
  | "variant_not_found"
  | "packaging_not_found"
  | "price_changed"
  | "out_of_stock"
  | "branch_unavailable";

export interface CartIssue {
  lineId: string;
  code: CartIssueCode;
  message: string;
}

export interface CartValidationResult {
  isValid: boolean;
  issues: CartIssue[];
  branchResolution: BranchResolutionResult;
}

// ===== Delivery (ارسال) =====

export type DeliveryMethod = "express" | "same-day";

export interface DeliveryQuote {
  method: DeliveryMethod;
  branchId: string;
  fee: number;
  etaMinutesMin: number;
  etaMinutesMax: number;
  /** سرویس‌دهنده ارسال — Abstraction طبق بخش ۵ Prompt، قابل تعویض */
  provider: "in-house-courier" | "third-party";
}

// ===== Order (سفارش) =====

/**
 * وضعیت استاندارد سفارش — طبق بخش ۶ Prompt 10. نگاشت با رفتار قبلی
 * (Prompt 7/8): سفارش با پرداخت آنلاین از "payment_pending" شروع می‌شود
 * (قبلاً "pending_payment")؛ سفارش نقدی/COD مستقیم روی "processing" می‌رود
 * (قبلاً روی "confirmed" می‌رفت). پرداخت موفق: "payment_pending" → "paid".
 */
export type OrderStatus =
  | "pending"
  | "payment_pending"
  | "paid"
  | "processing"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "failed";

export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  changedById: string | null;
  changedByRole: string | null;
  note: string | null;
  createdAt: string;
}

export interface OrderItem {
  lineId: string;
  productId: string;
  /** شناسه Variant (نه فقط برچسب نمایشی) — لازم برای اتصال دقیق به موجودی شعبه/محصول/Variant */
  variantId: string;
  productName: string;
  variantLabel: string;
  packagingLabel: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type PaymentMethod = "online" | "card-to-card" | "cash-on-delivery" | "in-branch-pos";

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface DeliveryAddress {
  fullAddress: string;
  latitude: number | null;
  longitude: number | null;
  postalCode?: string;
  city: "تهران" | "همدان";
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  address: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  deliveryFeeIsPending: boolean;
  total: number;
  deliveryMethod: DeliveryMethod;
  branchId: string;
  branchName: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  etaMinutesMin: number;
  etaMinutesMax: number;
  createdAt: string;
  /** پس از این زمان دیگر امکان لغو توسط مشتری وجود ندارد (createdAt + 5 دقیقه) — Enforce سمت سرور */
  cancelDeadline: string;
  idempotencyKey: string;
}

// ===== Payment (پرداخت) =====

export type PaymentStatus =
  | "not_required"
  | "pending"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface PaymentTransaction {
  id: string;
  orderId: string;
  provider: "mock-gateway" | "manual";
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  verifiedAt?: string;
  referenceId?: string;
}
