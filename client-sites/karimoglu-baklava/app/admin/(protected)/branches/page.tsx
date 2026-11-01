import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { listBranchesAdmin } from "@/lib/server/branchesAdminRepo";
import { BranchEditForm } from "@/components/admin/BranchEditForm";

export const dynamic = "force-dynamic";

export default async function AdminBranchesPage() {
  const access = await requirePageAccess("branches.manage");
  if (!access.allowed) return <AccessDenied />;

  const branches = await listBranchesAdmin();

  return (
    <Container className="flex flex-col gap-6 py-2">
      <div>
        <h1 className="text-h2 text-text-primary">شعب</h1>
        <p className="text-bodySm text-text-secondary">
          آدرس دقیق و مختصات جغرافیایی هنوز دریافت نشده — طبق دستور صریح، مقدار جعلی وارد نمی‌شود.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {branches.map((branch) => (
          <div key={branch.id} className="rounded-lg bg-surface p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-h4 text-text-primary">{branch.name}</p>
                <p className="text-caption text-text-muted">{branch.city}</p>
              </div>
              <div className="flex items-center gap-3">
                {branch.isActive ? (
                  <span className="rounded-full bg-state-successBg px-2 py-0.5 text-caption text-state-success">فعال</span>
                ) : (
                  <span className="rounded-full bg-state-errorBg px-2 py-0.5 text-caption text-state-error">غیرفعال</span>
                )}
                <Link href={`/admin/inventory/branch/${branch.id}`} className="text-caption text-brand-red hover:underline">
                  مشاهده موجودی شعبه ←
                </Link>
              </div>
            </div>

            <BranchEditForm branch={branch} />

            <p className="mt-3 text-caption text-text-muted">
              آدرس دقیق: TODO (هنوز دریافت نشده) · مختصات: {branch.lat && branch.lng ? `${branch.lat}, ${branch.lng}` : "TODO (هنوز دریافت نشده)"} · محدوده ارسال: TODO
            </p>
          </div>
        ))}
      </div>
    </Container>
  );
}
