export type SystemInput = {
  code: string;
  name: string;
  serialNumber: string | null;
  hospitalId: string;
  status: string;
};

export function normalizeSystemInput(input: {
  code?: string;
  name?: string;
  serialNumber?: string | null;
  hospitalId?: string;
  status?: string;
}): SystemInput {
  return {
    code: input.code?.trim().toUpperCase() ?? "",
    name: input.name?.trim() ?? "",
    serialNumber: input.serialNumber?.trim() || null,
    hospitalId: input.hospitalId?.trim() ?? "",
    status: input.status?.trim() || "Active",
  };
}

export function validateSystemInput(input: SystemInput) {
  if (!input.code) {
    return "Code is required.";
  }

  if (!input.name) {
    return "Name is required.";
  }

  if (!input.hospitalId) {
    return "Hospital is required.";
  }

  if (!input.status) {
    return "Status is required.";
  }

  return null;
}
