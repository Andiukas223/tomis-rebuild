import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { ProductForm } from "@/components/catalog/product-form";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  if (!hasCapability(user, "catalog.manage")) {
    return (
      <RestrictedAccess
        eyebrow="Catalog / Products"
        title="Edit product"
        description="Only catalog managers can update product records."
      />
    );
  }

  const { id } = await params;

  const [product, manufacturers] = await Promise.all([
    db.product.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    }),
    db.manufacturer.findMany({
      where: {
        organizationId: user.organizationId,
      },
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        country: true,
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog / Products"
        title={`Edit ${product.name}`}
        description="This edit screen extends the catalog CRUD pattern and keeps the manufacturer relationship editable."
      />

      <ProductForm
        mode="edit"
        productId={product.id}
        manufacturers={manufacturers}
        initialValues={{
          code: product.code,
          name: product.name,
          sku: product.sku ?? "",
          category: product.category ?? "",
          status: product.status,
          manufacturerId: product.manufacturerId,
        }}
      />
    </div>
  );
}
