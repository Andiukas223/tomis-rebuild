export type CompanyInput = {
  name: string;
  code: string | null;
  vatCode: string | null;
  city: string | null;
  country: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

export function normalizeCompanyInput(input: {
  name?: string;
  code?: string | null;
  vatCode?: string | null;
  city?: string | null;
  country?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  website?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}): CompanyInput {
  return {
    name: input.name?.trim() ?? "",
    code: input.code?.trim() || null,
    vatCode: input.vatCode?.trim().toUpperCase() || null,
    city: input.city?.trim() || null,
    country: input.country?.trim() || null,
    addressLine1: input.addressLine1?.trim() || null,
    addressLine2: input.addressLine2?.trim() || null,
    website: input.website?.trim() || null,
    contactName: input.contactName?.trim() || null,
    contactEmail: input.contactEmail?.trim() || null,
    contactPhone: input.contactPhone?.trim() || null,
  };
}

export function validateCompanyInput(input: CompanyInput) {
  if (!input.name) {
    return "Company name is required.";
  }

  if (input.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contactEmail)) {
    return "Contact email must be a valid email address.";
  }

  return null;
}
