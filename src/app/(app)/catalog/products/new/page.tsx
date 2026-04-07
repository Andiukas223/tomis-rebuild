import { db } from "@/lib/db";
import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { ProductForm } from "@/components/catalog/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const user = await getServerSessionUser();

  if (!hasCapability(user, "catalog.manage")) {
    return (
      <RestrictedAccess
        eyebrow="Catalog / Products"
        title="Create product"
        description="Only catalog managers can create product records."
      />
    );
  }

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
