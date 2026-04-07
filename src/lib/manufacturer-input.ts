export type ManufacturerInput = {
  name: string;
  code: string | null;
  country: string | null;
  website: string | null;
};

export function normalizeManufacturerInput(input: {
  name?: string;
  code?: string | null;
  country?: string | null;
  website?: string | null;
}): ManufacturerInput {
  return {
    name: input.name?.trim() ?? "",
    code: input.code?.trim().toUpperCase() || null,
    country: input.country?.trim() || null,
    website: input.website?.trim() || null,
  };
}

export function validateManufacturerInput(input: ManufacturerInput) {
  if (!input.name) {
    return "Manufacturer name is required.";
  }

  return null;
}
