"use server";
import { redirect } from "next/navigation";
import { db, type Customer } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/hash";
import { loginCustomer, logoutCustomer, currentCustomer } from "@/lib/auth";
import { normalizePhone } from "@/lib/format";
import { getSetting } from "@/lib/settings";

export type FormState = { error?: string; ok?: string };

function safeNext(n: FormDataEntryValue | null) {
  const s = String(n || "");
  return s.startsWith("/") && !s.startsWith("//") ? s : "/account";
}

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  const name = String(fd.get("name") || "").trim().slice(0, 80);
  const phone = normalizePhone(String(fd.get("phone") || ""));
  const pw = String(fd.get("password") || "");
  const birthday = String(fd.get("birthday") || "").slice(0, 10);
  if (name.length < 3) return { error: "اسمت رو کامل بنویس." };
  if (!phone) return { error: "شماره موبایل درست نیست." };
  if (pw.length < 6) return { error: "رمز حداقل ۶ کاراکتر باشه." };
  if (db().prepare("SELECT 1 FROM customers WHERE phone = ?").get(phone)) return { error: "با این شماره قبلاً ثبت‌نام شده؛ وارد شو." };

  const welcome = Math.max(0, Number(getSetting("club_welcome_points", "0")) || 0);
  const r = db().prepare("INSERT INTO customers (name, phone, password_hash, points, birthday) VALUES (?, ?, ?, ?, ?)").run(name, phone, hashPassword(pw), welcome, birthday);
  const id = Number(r.lastInsertRowid);
  if (welcome) db().prepare("INSERT INTO point_logs (customer_id, amount, reason) VALUES (?, ?, ?)").run(id, welcome, "هدیه‌ی عضویت در باشگاه");
  loginCustomer(id);
  redirect(safeNext(fd.get("next")));
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const phone = normalizePhone(String(fd.get("phone") || ""));
  const pw = String(fd.get("password") || "");
  const c = phone ? (db().prepare("SELECT * FROM customers WHERE phone = ?").get(phone) as Customer | undefined) : undefined;
  if (!c || !verifyPassword(pw, c.password_hash)) return { error: "شماره یا رمز اشتباهه." };
  loginCustomer(c.id);
  redirect(safeNext(fd.get("next")));
}

export async function logoutAction() {
  logoutCustomer();
  redirect("/club");
}

export async function profileAction(_: FormState, fd: FormData): Promise<FormState> {
  const me = currentCustomer();
  if (!me) return { error: "اول وارد شو." };
  const name = String(fd.get("name") || "").trim().slice(0, 80);
  if (name.length < 3) return { error: "اسم رو کامل بنویس." };
  db()
    .prepare("UPDATE customers SET name = ?, city = ?, address = ?, postal_code = ?, birthday = ? WHERE id = ?")
    .run(name, String(fd.get("city") || "").slice(0, 60), String(fd.get("address") || "").slice(0, 400), String(fd.get("postal_code") || "").slice(0, 12), String(fd.get("birthday") || "").slice(0, 10), me.id);
  const npw = String(fd.get("new_password") || "");
  if (npw) {
    if (npw.length < 6) return { error: "رمز جدید حداقل ۶ کاراکتر باشه." };
    db().prepare("UPDATE customers SET password_hash = ? WHERE id = ?").run(hashPassword(npw), me.id);
  }
  return { ok: "ذخیره شد ✓" };
}
