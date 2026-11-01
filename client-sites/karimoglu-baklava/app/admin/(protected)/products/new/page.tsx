import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { listCategories, listPackagingOptions } from "@/lib/server/productsRepo";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const access = await requirePageAccess("products.manage");
  if (!access.allowed) return <AccessDenied />;

  return (
    <Container className="flex flex-col gap-6 py-2">
      <h1 className="text-h2 text-text-primary">محصول جدید</h1>
      <ProductForm mode="create" categories={await listCategories()} packagingOptions={await listPackagingOptions()} />
    </Container>
  );
}
