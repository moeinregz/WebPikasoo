"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

interface Props {
  items: NavItem[];
  actorName: string;
  actorRoleLabel: string;
}

/**
 * ناوبری کناری پنل مدیریت. طبق بخش ۱۷ Prompt («Desktop-first ولی قابل
 * استفاده در موبایل»): در دسکتاپ همیشه ثابت و باز است؛ زیر breakpoint
 * `tablet` به یک نوار بالای صفحه با دکمه باز/بسته‌شدن تبدیل می‌شود تا فضای
 * محدود موبایل را نگیرد.
 */
export function AdminSidebar({ items, actorName, actorRoleLabel }: Props) {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", headers: { "x-requested-with": "karimoglu-web" } });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="flex w-full flex-col border-l border-border bg-surface tablet:w-64 tablet:shrink-0">
      <div className="border-b border-border px-5 py-4">
        <p className="text-h4 text-text-primary">پنل مدیریت کریم‌اغلو</p>
        <p className="mt-1 text-caption text-text-muted">
          {actorName} · {actorRoleLabel}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-bodySm transition-colors ${
                    isActive
                      ? "bg-brand-black text-white"
                      : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-md border border-border-strong px-3 py-2 text-bodySm text-text-secondary hover:border-brand-black hover:text-brand-black"
        >
          خروج از حساب
        </button>
      </div>
    </aside>
  );
}
