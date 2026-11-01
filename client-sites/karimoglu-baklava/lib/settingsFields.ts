/**
 * تعریف فیلدهای تنظیمات — عمداً در یک فایل جدا و بدون هیچ Import سمت‌سرور
 * (دیتابیس و...) نگه داشته شده، چون `components/admin/SettingsForm.tsx`
 * (یک Client Component) به همین فهرست نیاز دارد؛ اگر این‌جا در
 * `lib/server/settingsRepo.ts` می‌ماند، کل زنجیره Import سمت‌سرور (شامل
 * `node:sqlite`) به‌اشتباه وارد Bundle مرورگر می‌شد.
 */
export interface SettingField {
  key: string;
  label: string;
  group: "store" | "orders" | "delivery" | "payment" | "sms" | "seo";
}

export const SETTING_FIELDS: SettingField[] = [
  { key: "store.name", label: "نام فروشگاه", group: "store" },
  { key: "store.supportPhone", label: "تلفن پشتیبانی", group: "store" },
  { key: "store.supportEmail", label: "ایمیل پشتیبانی", group: "store" },
  { key: "orders.cancelWindowMinutes", label: "مهلت لغو سفارش (دقیقه)", group: "orders" },
  { key: "orders.autoConfirm", label: "تأیید خودکار سفارش‌های نقدی (true/false)", group: "orders" },
  { key: "delivery.defaultProvider", label: "سرویس‌دهنده پیش‌فرض ارسال", group: "delivery" },
  { key: "payment.provider", label: "Provider پرداخت آنلاین فعال", group: "payment" },
  { key: "sms.provider", label: "Provider پیامک", group: "sms" },
  { key: "sms.senderNumber", label: "شماره فرستنده پیامک", group: "sms" },
  { key: "seo.defaultMetaTitle", label: "عنوان متای پیش‌فرض سایت", group: "seo" },
  { key: "seo.defaultMetaDescription", label: "توضیحات متای پیش‌فرض سایت", group: "seo" },
];
