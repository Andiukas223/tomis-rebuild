export type EquipmentInput = {
  code: string;
  name: string;
  model: string | null;
  serialNumber: string | null;
  category: string | null;
  status: string;
  manufacturerId: string;
  systemId: string | null;
};

export function normalizeEquipmentInput(input: {
  code?: string;
  name?: string;
  model?: string | null;
  serialNumber?: string | null;
  category?: string | null;
  status?: string;
  manufacturerId?: string;
  systemId?: string | null;
}): EquipmentInput {
  return {
    code: input.code?.trim().toUpperCase() ?? "",
    name: input.name?.trim() ?? "",
    model: input.model?.trim() || null,
    serialNumber: input.serialNumber?.trim() || null,
    category: input.category?.trim() || null,
    status: input.status?.trim() || "Active",
    manufacturerId: input.manufacturerId?.trim() ?? "",
    systemId: input.systemId?.trim() || null,
  };
}

export function validateEquipmentInput(input: EquipmentInput) {
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
