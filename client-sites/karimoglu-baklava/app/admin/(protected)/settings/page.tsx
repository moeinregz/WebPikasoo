import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { getAllSettings } from "@/lib/server/settingsRepo";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const access = await requirePageAccess("settings.manage");
  if (!access.allowed) return <AccessDenied />;

  return (
    <Container className="flex flex-col gap-6 py-2">
      <div>
        <h1 className="text-h2 text-text-primary">تنظیمات</h1>
        <p className="text-bodySm text-text-secondary">فیلدهای خالی یعنی هنوز مقداری برای آن‌ها وارد نشده — چیزی جعلی از قبل پر نشده است.</p>
      </div>
      <SettingsForm initial={await getAllSettings()} />
    </Container>
  );
}
