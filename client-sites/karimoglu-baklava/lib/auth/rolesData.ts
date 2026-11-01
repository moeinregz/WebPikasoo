/**
 * داده و منطق خالص RBAC — عمداً بدون هیچ Import سمت‌سرور (دیتابیس، Session).
 * دلیل: چند Client Component پنل مدیریت (مثل `RoleAssignForm.tsx`) به
 * `ROLE_LABELS`/`Role`/`ALL_PERMISSIONS` نیاز دارند؛ اگر این‌ها در
 * `lib/auth/rbac.ts` (که `node:sqlite` را Import می‌کند) می‌ماندند، کل
 * زنجیره دیتابیس به‌اشتباه وارد Bundle مرورگر می‌شد (دقیقاً همان باگی که
 * برای `lib/server/settingsRepo.ts` هم پیش آمد و در `lib/settingsFields.ts`
 * برطرف شد).
 *
 * `lib/auth/rbac.ts` همه‌چیز این فایل را Re-export می‌کند تا فایل‌های
 * سمت‌سرور مثل قبل از یک مسیر Import کنند.
 */

export type Role = "site_admin" | "ceo" | "branch_manager" | "warehouse_staff" | "cashier" | "system";

export type Permission =
  | "inventory.view"
  | "inventory.adjust"
  | "inventory.receive"
  | "inventory.transfer"
  | "inventory.history.view"
  | "inventory.thresholds.manage"
  | "inventory.reservation.override"
  | "orders.view"
  | "orders.update_status"
  | "products.manage"
  | "branches.manage"
  | "users.manage"
  | "coupons.manage"
  | "reviews.manage"
  | "contact.manage"
  | "menu.manage"
  | "notifications.view"
  | "reports.view"
  | "settings.manage"
  | "audit.view";

export const ALL_PERMISSIONS: Permission[] = [
  "inventory.view",
  "inventory.adjust",
  "inventory.receive",
  "inventory.transfer",
  "inventory.history.view",
  "inventory.thresholds.manage",
  "inventory.reservation.override",
  "orders.view",
  "orders.update_status",
  "products.manage",
  "branches.manage",
  "users.manage",
  "coupons.manage",
  "reviews.manage",
  "contact.manage",
  "menu.manage",
  "notifications.view",
  "reports.view",
  "settings.manage",
  "audit.view",
];

export const ROLE_LABELS: Record<Exclude<Role, "system">, string> = {
  site_admin: "ادمین سایت / طراح",
  ceo: "مدیرعامل / مدیر کل",
  branch_manager: "مدیر شعبه",
  warehouse_staff: "مسئول انبار",
  cashier: "صندوقدار / اپراتور سفارش",
};

/**
 * نگاشت نقش→مجوز — طبق بخش «RBAC» Prompt 10: هر نقش فقط به بخش‌های
 * موردنیازش دسترسی دارد. این تنها منبع حقیقت این نگاشت در کل پروژه است.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  site_admin: ALL_PERMISSIONS,
  ceo: ALL_PERMISSIONS,
  branch_manager: [
    "inventory.view",
    "inventory.adjust",
    "inventory.history.view",
    "orders.view",
    "orders.update_status",
    "reports.view",
  ],
  warehouse_staff: ["inventory.view", "inventory.receive", "inventory.transfer", "inventory.history.view"],
  cashier: ["inventory.view", "orders.view"],
  system: ALL_PERMISSIONS,
};

export interface Actor {
  id: string;
  role: Role;
  branchId?: string | null;
}

export const SYSTEM_ACTOR: Actor = { id: "system", role: "system", branchId: null };

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canActOnBranch(actor: Actor, branchId: string): boolean {
  if (actor.role === "branch_manager") return actor.branchId === branchId;
  return true;
}
