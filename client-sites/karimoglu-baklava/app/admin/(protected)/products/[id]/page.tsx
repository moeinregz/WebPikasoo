import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { getProductById, listCategories, listPackagingOptions } from "@/lib/server/productsRepo";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductDangerZone } from "@/components/admin/ProductDangerZone";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const access = await requirePageAccess("products.manage");
  if (!access.allowed) return <AccessDenied />;

  const product = await getProductById(params.id);
  if (!product) notFound();

  return (
    <Container className="flex flex-col gap-6 py-2">
      <h1 className="text-h2 text-text-primary">ویرایش محصول — {product.name}</h1>
      <ProductForm mode="edit" productId={product.id} initial={product} categories={await listCategories()} packagingOptions={await listPackagingOptions()} />
      <ProductDangerZone productId={product.id} isDeleted={product.isDeleted} />
    </Container>
  );
}
