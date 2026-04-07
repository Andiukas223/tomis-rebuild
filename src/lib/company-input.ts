export type CompanyInput = {
  name: string;
  code: string | null;
  city: string | null;
  country: string | null;
};

export function normalizeCompanyInput(input: {
  name?: string;
  code?: string | null;
  city?: string | null;
  country?: string | null;
}): CompanyInput {
  return {
    name: input.name?.trim() ?? "",
    code: input.code?.trim() || null,
    city: input.city?.trim() || null,
    country: input.country?.trim() || null,
  };
}

export function validateCompanyInput(input: CompanyInput) {
  if (!input.name) {
    return "Company name is required.";
  }

  return null;
}
