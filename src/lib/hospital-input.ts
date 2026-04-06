export type HospitalInput = {
  name: string;
  code: string | null;
  city: string | null;
};

export function normalizeHospitalInput(input: {
  name?: string;
  code?: string | null;
  city?: string | null;
}): HospitalInput {
  return {
    name: input.name?.trim() ?? "",
    code: input.code?.trim().toUpperCase() || null,
    city: input.city?.trim() || null,
  };
}

export function validateHospitalInput(input: HospitalInput) {
  if (!input.name) {
    return "Hospital name is required.";
  }

  return null;
}
