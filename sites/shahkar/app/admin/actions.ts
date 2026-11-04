"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, checkPassword, isAdmin, sessionToken } from "@/lib/auth";
import {
  RESERVATION_STATUSES,
  type ReservationStatus,
  addMenuItem,
  deleteMenuItem,
  setReservationStatus,
  toggleMenuItem,
} from "@/lib/db";
import { toEn } from "@/lib/fa";

export async function loginAction(_: unknown, form: FormData) {
  const password = String(form.get("password") ?? "");
  if (!checkPassword(password)) return { error: "رمز اشتباه است." };
  (await cookies()).set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}

async function guard() {
  if (!(await isAdmin())) throw new Error("unauthorized");
}

export async function setStatusAction(form: FormData) {
  await guard();
  const id = Number(form.get("id"));
  const status = String(form.get("status")) as ReservationStatus;
  if (!Number.isInteger(id) || !RESERVATION_STATUSES.includes(status)) return;
  setReservationStatus(id, status);
  revalidatePath("/admin");
}

export async function addItemAction(form: FormData) {
  await guard();
  const categoryId = Number(form.get("category_id"));
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  const description = String(form.get("description") ?? "").trim().slice(0, 200);
  const priceRaw = toEn(String(form.get("price") ?? "")).replace(/[^\d]/g, "");
  if (!Number.isInteger(categoryId) || !name) return;
  addMenuItem({
    categoryId,
    name,
    description,
    price: priceRaw ? Number(priceRaw) : null,
    featured: form.get("featured") === "on",
  });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function toggleItemAction(form: FormData) {
  await guard();
  const id = Number(form.get("id"));
  const field = form.get("field") === "featured" ? "featured" : "visible";
  if (Number.isInteger(id)) toggleMenuItem(id, field);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteItemAction(form: FormData) {
  await guard();
  const id = Number(form.get("id"));
  if (Number.isInteger(id)) deleteMenuItem(id);
  revalidatePath("/admin");
  revalidatePath("/");
}
