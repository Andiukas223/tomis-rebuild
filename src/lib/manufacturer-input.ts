export type ManufacturerInput = {
  name: string;
  code: string | null;
  country: string | null;
  website: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  productFocus: string | null;
  serviceNotes: string | null;
};

export function normalizeManufacturerInput(input: {
  name?: string;
  code?: string | null;
  country?: string | null;
  website?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  productFocus?: string | null;
  serviceNotes?: string | null;
}): ManufacturerInput {
  return {
    name: input.name?.trim() ?? "",
    code: input.code?.trim().toUpperCase() || null,
    country: input.country?.trim() || null,
    website: input.website?.trim() || null,
    supportEmail: input.supportEmail?.trim() || null,
    supportPhone: input.supportPhone?.trim() || null,
    productFocus: input.productFocus?.trim() || null,
    serviceNotes: input.serviceNotes?.trim() || null,
  };
}

export function validateManufacturerInput(input: ManufacturerInput) {
  if (!input.name) {
    return "Manufacturer name is required.";
  }

  if (
    input.supportEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.supportEmail)
  ) {
    return "Support email must be a valid email address.";
  }

  return null;
}
