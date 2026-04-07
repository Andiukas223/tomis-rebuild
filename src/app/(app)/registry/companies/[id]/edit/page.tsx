import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { CompanyForm } from "@/components/registry/company-form";

type EditCompanyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditCompanyPage({
  params,
}: EditCompanyPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  if (!hasCapability(user, "registry.manage")) {
    return (
      <RestrictedAccess
        eyebrow="Registry / Companies"
        title="Edit company"
        description="Only registry managers can update company records."
      />
    );
  }

  const { id } = await params;

  const company = await db.company.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Companies"
        title={`Edit ${company.name}`}
        description="This edit flow uses the same Guided Intake structure as company creation so commercial registry data stays complete and reviewable."
      />

      <CompanyForm
        mode="edit"
        companyId={company.id}
        initialValues={{
          name: company.name,
          code: company.code ?? "",
          vatCode: company.vatCode ?? "",
          city: company.city ?? "",
          country: company.country ?? "",
          addressLine1: company.addressLine1 ?? "",
          addressLine2: company.addressLine2 ?? "",
          website: company.website ?? "",
          contactName: company.contactName ?? "",
          contactEmail: company.contactEmail ?? "",
          contactPhone: company.contactPhone ?? "",
        }}
      />
    </div>
  );
}
