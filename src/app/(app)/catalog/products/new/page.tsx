import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { ProductForm } from "@/components/catalog/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const user = await getServerSessionUser();

  const manufacturers = user
    ? await db.manufacturer.findMany({
        where: {
          organizationId: user.organizationId,
        },
        orderBy: [{ name: "asc" }],
        select: {
          id: true,
          name: true,
          country: true,
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog / Products"
        title="Create product"
        description="This create flow extends the catalog CRUD pattern and connects product records to registry manufacturers."
      />

      <ProductForm mode="create" manufacturers={manufacturers} />
    </div>
  );
}
