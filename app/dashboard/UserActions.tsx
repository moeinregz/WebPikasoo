"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  updateUserAction,
  deleteUserAction,
  setUserPermissionsAction,
  type EditUserFormState,
} from "./actions";
import type { UserRole, UserPermissions } from "@/lib/db";
import PasswordInput from "@/components/PasswordInput";

const inputClass =
  "w-full rounded-[8px] border border-ink/[0.16] bg-surface/40 px-3 py-2 text-[13.5px] text-ink outline-none transition focus:border-accent";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-4 py-1.5 text-[12.5px] font-bold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "..." : "ذخیره"}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-red-500/40 px-4 py-1.5 text-[12.5px] font-semibold text-red-500 transition hover:bg-red-500/10 disabled:pointer-events-none disabled:opacity-60"
    >
      حذف
    </button>
  );
}

const initialEditState: EditUserFormState = null;

/** Row-level actions: an "ویرایش" toggle that opens an inline edit form
 *  (name/phone/role/optional new password), a delete button with a confirm
 *  step, and — for developer rows only — checkboxes to grant/revoke access
 *  to specific /dashboard tabs. */
export default function UserActions({
  id,
  name,
  phone,
  role,
  title,
  permissions,
  allowRoleChange = true,
  showPermissions = false,
}: {
  id: number;
  name: string;
  phone: string;
  role: UserRole;
  /** Custom job title/position (e.g. "کارشناس سئو") — editable here for
   *  staff rows so an admin can label what each team member actually does. */
  title?: string | null;
  permissions?: UserPermissions;
  /** Customer rows in the "کاربران ثبت‌نامی" tab can still be promoted to
   *  staff via the role select; kept true everywhere it's used. */
  allowRoleChange?: boolean;
  /** Only true for developer rows in the team tab. */
  showPermissions?: boolean;
}) {
  const [editState, editAction] = useFormState(updateUserAction, initialEditState);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Once the edit is saved, close the inline form instead of leaving it
  // open with the just-submitted values — reopening it later shows the
  // fresh (revalidated) name/phone/role again.
  useEffect(() => {
    if (editState?.ok) setEditing(false);
  }, [editState]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="rounded-full border border-ink/[0.2] px-4 py-1.5 text-[12.5px] font-semibold text-dim transition hover:border-accent hover:text-accent"
        >
          {editing ? "بستن" : "ویرایش"}
        </button>

        {confirmingDelete ? (
          <form action={deleteUserAction} className="flex items-center gap-1.5">
            <input type="hidden" name="userId" value={id} />
            <span className="text-[12px] text-dim">مطمئنی؟</span>
            <DeleteButton />
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-[12px] text-dim underline"
            >
              انصراف
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-full border border-red-500/30 px-4 py-1.5 text-[12.5px] font-semibold text-red-500/90 transition hover:bg-red-500/10"
          >
            حذف
          </button>
        )}
      </div>

      {editing && (
        <form
          action={editAction}
          className="flex flex-col gap-2 rounded-[10px] border border-ink/[0.14] bg-canvas p-3 sm:flex-row sm:flex-wrap sm:items-center"
        >
          <input type="hidden" name="userId" value={id} />
          <input name="name" defaultValue={name} required className={`${inputClass} sm:w-36`} />
          <input name="phone" defaultValue={phone} dir="ltr" required className={`${inputClass} sm:w-36`} />
          {allowRoleChange && (
            <select name="role" defaultValue={role} className={`${inputClass} sm:w-32`}>
              <option value="customer">مشتری</option>
              <option value="developer">عضو تیم</option>
              <option value="admin">ادمین</option>
            </select>
          )}
          {role !== "customer" && (
            <input
              name="title"
              defaultValue={title ?? ""}
              placeholder="عنوان/سمت (مثلاً کارشناس سئو)"
              className={`${inputClass} sm:w-48`}
            />
          )}
          <PasswordInput
            name="password"
            placeholder="رمز جدید (اختیاری)"
            autoComplete="new-password"
            className={`${inputClass} sm:w-40`}
          />
          <SaveButton />
          {editState && (
            <p className={`text-[12px] ${editState.ok ? "text-accent" : "text-red-500"}`}>
              {editState.message}
            </p>
          )}
        </form>
      )}

      {showPermissions && (
        <form
          action={setUserPermissionsAction}
          className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-[10px] border border-dashed border-ink/[0.16] p-3 text-[12.5px]"
        >
          <input type="hidden" name="userId" value={id} />
          <span className="font-semibold text-dim">دسترسی‌ها:</span>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="perm_orders" defaultChecked={permissions?.orders} />
            سفارش‌ها
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="perm_tickets" defaultChecked={permissions?.tickets} />
            تیکت‌ها
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="perm_users" defaultChecked={permissions?.users} />
            کاربران
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="perm_team" defaultChecked={permissions?.team} />
            تیم برنامه‌نویسی
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="perm_chat" defaultChecked={permissions?.chat} />
            چت
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="perm_crm" defaultChecked={permissions?.crm} />
            CRM
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="perm_blog" defaultChecked={permissions?.blog} />
            وبلاگ
          </label>
          <button
            type="submit"
            className="rounded-full bg-navy px-4 py-1 text-[12px] font-bold text-alabaster transition hover:-translate-y-0.5"
          >
            ذخیره دسترسی‌ها
          </button>
        </form>
      )}
    </div>
  );
}
