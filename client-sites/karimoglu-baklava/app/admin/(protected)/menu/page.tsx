import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { listMenusAdmin } from "@/lib/server/menuRepo";
import { branches } from "@/lib/mock-data";
import { MenuActiveToggle } from "@/components/admin/MenuActiveToggle";

export const dynamic = "force-dynamic";

/**
 * مدیریت منو (بخش ۸ Prompt: «حداقل باید بتوانیم Menu image, Branch, Menu
 * type, Active state را مدیریت کنیم»). تخصیص شعبه↔منو در این نسخه فقط
 * نمایش داده می‌شود (Read-only) — چون پروژه هنوز زیرساخت Upload تصویر
 * ندارد، افزودن منوی تازه/تغییر تخصیص نیازمند آن زیرساخت است (TODO آینده).
 * آنچه همین حالا واقعاً کار می‌کند: فعال/غیرفعال کردن هر منو.
 */
export default async function AdminMenuPage() {
  const access = await requirePageAccess("menu.manage");
  if (!access.allowed) return <AccessDenied />;

  const menus = await listMenusAdmin();
  const branchNameById = new Map(branches.map((b) => [b.id, b.name]));

  return (
    <Container className="flex flex-col gap-6 py-2">
      <div>
        <h1 className="text-h2 text-text-primary">مدیریت منو</h1>
        <p className="text-bodySm text-text-secondary">
          منوهای تعریف‌شده و شعب مرتبط با هر کدام. غیرفعال کردن یک منو، آن را از همه شعب مرتبط پنهان می‌کند.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {menus.map((menu) => (
          <div key={menu.id} className="rounded-lg bg-surface p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-h4 text-text-primary">{menu.name}</h2>
              <MenuActiveToggle id={menu.id} isActive={menu.isActive} />
            </div>
            <p className="mb-3 text-caption text-text-muted">
              شعب: {menu.branchIds.map((id) => branchNameById.get(id) ?? id).join("، ") || "هیچ شعبه‌ای"}
            </p>
            <div className="flex flex-wrap gap-3">
              {menu.images.map((img) => (
                <Image
                  key={img.id}
                  src={img.imagePath}
                  alt={img.altText}
                  width={100}
                  height={140}
                  className="rounded border border-border"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
