export type ProductInput = {
  code: string;
  name: string;
  sku: string | null;
  category: string | null;
  status: string;
  manufacturerId: string;
};

export function normalizeProductInput(input: {
  code?: string;
  name?: string;
  sku?: string | null;
  category?: string | null;
  status?: string;
  manufacturerId?: string;
}): ProductInput {
  return {
    code: input.code?.trim().toUpperCase() ?? "",
    name: input.name?.trim() ?? "",
    sku: input.sku?.trim() || null,
    category: input.category?.trim() || null,
    status: input.status?.trim() || "Active",
    manufacturerId: input.manufacturerId?.trim() ?? "",
  };
}

export function validateProductInput(input: ProductInput) {
  if (!input.code) {
    return "Code is required.";
  }

  if (!input.name) {
    return "Name is required.";
  }

  if (!input.manufacturerId) {
    return "Manufacturer is required.";
  }

  if (!input.status) {
    return "Status is required.";
  }

  return null;
}
