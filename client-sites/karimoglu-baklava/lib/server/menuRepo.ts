import { db } from "@/lib/db/client";
import { recordAuditLog } from "@/lib/server/auditRepo";
import type { Actor } from "@/lib/auth/rolesData";

export interface MenuImage {
  id: string;
  imagePath: string;
  altText: string;
}

export interface MenuWithImages {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  images: MenuImage[];
}

/**
 * منوهای فعال یک شعبه — طبق طراحی داده‌محور (بخش ۸ Prompt: بدون
 * `if branch === "piroozi"` در جاهای مختلف کد). فقط منوهای `is_active = 1`
 * برمی‌گردد؛ اگر ادمین بعداً یک منو را غیرفعال کند، بدون تغییر کد از همه
 * شعب مرتبط ناپدید می‌شود.
 */
export async function getMenusForBranch(branchId: string): Promise<MenuWithImages[]> {
  const menuRows = await db
    .prepare(
      `SELECT m.id, m.slug, m.name, m.is_active
       FROM menus m
       JOIN branch_menus bm ON bm.menu_id = m.id
       WHERE bm.branch_id = ? AND m.is_active = 1
       ORDER BY m.sort_order ASC`,
    )
    .all(branchId) as { id: string; slug: string; name: string; is_active: number }[];

  return await Promise.all(
    menuRows.map(async (m) => ({
      id: m.id,
      slug: m.slug,
      name: m.name,
      isActive: !!m.is_active,
      images: await getMenuImages(m.id),
    })),
  );
}

/** منوی عمومی (برای صفحه‌ای که به یک شعبه خاص وابسته نیست، مثل /menu) */
export async function getGeneralMenu(): Promise<MenuWithImages | null> {
  const row = await db.prepare("SELECT id, slug, name, is_active FROM menus WHERE slug = 'general'").get() as
    | { id: string; slug: string; name: string; is_active: number }
    | undefined;
  if (!row || !row.is_active) return null;
  return { id: row.id, slug: row.slug, name: row.name, isActive: true, images: await getMenuImages(row.id) };
}

async function getMenuImages(menuId: string): Promise<MenuImage[]> {
  const rows = await db
    .prepare("SELECT id, image_path, alt_text FROM menu_images WHERE menu_id = ? ORDER BY sort_order ASC")
    .all(menuId) as { id: string; image_path: string; alt_text: string }[];
  return rows.map((r) => ({ id: r.id, imagePath: r.image_path, altText: r.alt_text }));
}

// ===== مدیریت از پنل ادمین =====

export interface MenuAdminRow extends MenuWithImages {
  branchIds: string[];
}

export async function listMenusAdmin(): Promise<MenuAdminRow[]> {
  const menus = await db.prepare("SELECT id, slug, name, is_active FROM menus ORDER BY sort_order ASC").all() as {
    id: string;
    slug: string;
    name: string;
    is_active: number;
  }[];
  return await Promise.all(
    menus.map(async (m) => {
      const branchRows = await db.prepare("SELECT branch_id FROM branch_menus WHERE menu_id = ?").all(m.id) as {
        branch_id: string;
      }[];
      return {
        id: m.id,
        slug: m.slug,
        name: m.name,
        isActive: !!m.is_active,
        images: await getMenuImages(m.id),
        branchIds: branchRows.map((r) => r.branch_id),
      };
    }),
  );
}

export async function setMenuActive(menuId: string, isActive: boolean, actor: Actor): Promise<void> {
  await db.prepare("UPDATE menus SET is_active = ? WHERE id = ?").run(isActive ? 1 : 0, menuId);
  await recordAuditLog(actor, "menu.set_active", "menu", menuId, null, { isActive });
}
