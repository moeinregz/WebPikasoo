"use client";

import { useFormStatus } from "react-dom";
import { setUserPermissionsAction } from "./actions";
import type { UserPermissions } from "@/lib/db";
import { toPersianDigits } from "@/lib/auth";

const PERMISSION_FIELDS: { key: keyof UserPermissions; name: string; label: string }[] = [
  { key: "orders", name: "perm_orders", label: "سفارش‌ها" },
  { key: "tickets", name: "perm_tickets", label: "تیکت‌ها" },
  { key: "users", name: "perm_users", label: "کاربران ثبت‌نامی" },
  { key: "team", name: "perm_team", label: "تیم برنامه‌نویسی" },
  { key: "chat", name: "perm_chat", label: "چت تیم" },
  { key: "blog", name: "perm_blog", label: "وبلاگ" },
  { key: "crm", name: "perm_crm", label: "CRM" },
];

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-navy px-4 py-1.5 text-[12.5px] font-bold text-alabaster transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "..." : "ذخیره دسترسی‌ها"}
    </button>
  );
}

export type AccessDeveloper = {
  id: number;
  name: string;
  phone: string;
  permissions: UserPermissions;
};

/** Dedicated "دسترسی‌ها" tab — separate from the developer roster on
 *  purpose, so granting/revoking access to dashboard sections doesn't live
 *  buried inside a long staff list. Only developers show up here since
 *  admins always have full access. */
export default function AccessPanel({ developers }: { developers: AccessDeveloper[] }) {
  if (developers.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-ink/[0.2] p-8 sm:p-14 text-center text-dim">
        هنوز برنامه‌نویسی اضافه نشده. از تب «تیم برنامه‌نویسی» یه عضو جدید اضافه کن، بعد از همین‌جا بهش دسترسی بده.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13.5px] leading-relaxed text-dim">
        مشخص کن هر برنامه‌نویس به کدوم بخش‌های داشبورد دسترسی داشته باشه. ادمین‌ها همیشه به همه‌چی دسترسی دارن، برای همین این‌جا نشون داده نمی‌شن.
      </p>

      {developers.map((dev) => (
        <div key={dev.id} className="rounded-card border border-ink/[0.14] bg-surface/20 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-normal">{dev.name}</h3>
              <span className="rounded-md border border-ink/[0.16] bg-canvas px-2 py-0.5 font-mono text-[11px] text-dim">
                #{toPersianDigits(dev.id)}
              </span>
            </div>
            <span className="font-mono text-[12.5px] text-dim" dir="ltr">
              {toPersianDigits(dev.phone)}
            </span>
          </div>

          <form
            action={setUserPermissionsAction}
            className="flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-ink/[0.1] pt-4 text-[13.5px]"
          >
            <input type="hidden" name="userId" value={dev.id} />
            {PERMISSION_FIELDS.map((f) => (
              <label key={f.key} className="flex items-center gap-1.5">
                <input type="checkbox" name={f.name} defaultChecked={dev.permissions[f.key]} />
                {f.label}
              </label>
            ))}
            <SaveButton />
          </form>
        </div>
      ))}
    </div>
  );
}
