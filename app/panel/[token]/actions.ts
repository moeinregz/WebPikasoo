"use server";

import { revalidatePath } from "next/cache";
import {
  deleteSiteRequest,
  listSiteRequests,
  setPrivateSiteMenu,
  setSiteRequestStatus,
  type SiteRequest,
  type SiteRequestStatus,
} from "@/lib/db";
import { authedPanelSite, panelLogin, panelLogout } from "@/lib/panelAuth";
import { menuImages, sanitizeMenu } from "@/lib/siteTemplates/menu";
import { menuOfSite } from "@/lib/siteTemplates/siteAddon";
import { deleteBlobQuietly, savePrivateSiteImage } from "@/lib/uploads";

// Photos may only come from our own Blob store (the editor uploads them there).
const isOwnBlobUrl = (u: string) => {
  try {
    const h = new URL(u);
    return h.protocol === "https:" && h.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
};

// Server actions of the owner's panel. Every one re-checks access from the
// cookie (or an admin session) — the token alone is never enough.

export type PanelResult = { ok: boolean; message: string; url?: string };

export async function panelLoginAction(token: string, password: string): Promise<PanelResult> {
  if (typeof password !== "string" || password.length > 40) return { ok: false, message: "رمز درست نیست." };
  const res = await panelLogin(token, password);
  if (res.ok) revalidatePath(`/panel/${token}`);
  return res;
}

export async function panelLogoutAction(token: string): Promise<void> {
  panelLogout(token);
  revalidatePath(`/panel/${token}`);
}

/** Fresh list for the auto-refresh of the panel (newest first). */
export async function panelListAction(token: string): Promise<{ ok: boolean; requests: SiteRequest[] }> {
  const site = await authedPanelSite(token);
  if (!site) return { ok: false, requests: [] };
  return { ok: true, requests: await listSiteRequests(site.id) };
}

const STATUSES: SiteRequestStatus[] = ["new", "confirmed", "done", "canceled"];

export async function panelSetStatusAction(token: string, id: number, status: string): Promise<PanelResult> {
  const site = await authedPanelSite(token);
  if (!site) return { ok: false, message: "دسترسی نداری." };
  if (!Number.isInteger(id) || !STATUSES.includes(status as SiteRequestStatus)) return { ok: false, message: "وضعیت معتبر نیست." };
  const done = await setSiteRequestStatus(site.id, id, status as SiteRequestStatus);
  return done ? { ok: true, message: "" } : { ok: false, message: "درخواست پیدا نشد." };
}

export async function panelDeleteRequestAction(token: string, id: number): Promise<PanelResult> {
  const site = await authedPanelSite(token);
  if (!site) return { ok: false, message: "دسترسی نداری." };
  if (!Number.isInteger(id)) return { ok: false, message: "درخواست معتبر نیست." };
  await deleteSiteRequest(site.id, id);
  return { ok: true, message: "" };
}

// ---- menu (same validation as the admin's editor) ----

export async function panelSaveMenuAction(token: string, menuJson: string): Promise<PanelResult> {
  const site = await authedPanelSite(token);
  if (!site) return { ok: false, message: "دسترسی نداری." };
  if (typeof menuJson !== "string" || menuJson.length > 600_000) return { ok: false, message: "منو خیلی بزرگه." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(menuJson);
  } catch {
    return { ok: false, message: "ساختار منو معتبر نیست." };
  }
  const checked = sanitizeMenu(parsed);
  if (!checked.ok) return { ok: false, message: checked.message };
  if (menuImages(checked.menu).some((u) => !isOwnBlobUrl(u))) {
    return { ok: false, message: "فقط عکس‌های آپلودشده از همین پنل قابل استفاده‌ن." };
  }
  try {
    await setPrivateSiteMenu(site.id, checked.menu);
    const keep = new Set(menuImages(checked.menu));
    for (const url of menuImages(site.menu)) if (!keep.has(url)) await deleteBlobQuietly(url);
  } catch (err) {
    console.error("panelSaveMenuAction failed:", err);
    return { ok: false, message: "ذخیره ناموفق بود، دوباره امتحان کن." };
  }
  return { ok: true, message: "منو ذخیره شد." };
}

export async function panelResetMenuAction(token: string): Promise<PanelResult> {
  const site = await authedPanelSite(token);
  if (!site) return { ok: false, message: "دسترسی نداری." };
  await setPrivateSiteMenu(site.id, null);
  for (const url of menuImages(site.menu)) await deleteBlobQuietly(url);
  return { ok: true, message: "منو به حالت اولیه برگشت." };
}

export async function panelUploadMenuImageAction(token: string, formData: FormData): Promise<PanelResult> {
  const site = await authedPanelSite(token);
  if (!site) return { ok: false, message: "دسترسی نداری." };
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "عکسی انتخاب نشده." };
  try {
    const url = await savePrivateSiteImage(file);
    return { ok: true, message: "عکس آپلود شد.", url };
  } catch (err) {
    console.error("panelUploadMenuImageAction failed:", err);
    return { ok: false, message: err instanceof Error ? err.message : "آپلود ناموفق بود." };
  }
}

/** The menu the panel's editor starts from (edited one, else the site's default). */
export async function panelCurrentMenu(token: string) {
  const site = await authedPanelSite(token);
  return site ? { menu: menuOfSite(site), custom: !!site.menu } : null;
}
