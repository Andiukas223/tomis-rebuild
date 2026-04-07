export type HospitalInput = {
  name: string;
  code: string | null;
  city: string | null;
  country: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  serviceRegion: string | null;
  serviceNotes: string | null;
};

export function normalizeHospitalInput(input: {
  name?: string;
  code?: string | null;
  city?: string | null;
  country?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  serviceRegion?: string | null;
  serviceNotes?: string | null;
}): HospitalInput {
  return {
    name: input.name?.trim() ?? "",
    code: input.code?.trim().toUpperCase() || null,
    city: input.city?.trim() || null,
    country: input.country?.trim() || null,
    addressLine1: input.addressLine1?.trim() || null,
    addressLine2: input.addressLine2?.trim() || null,
    contactName: input.contactName?.trim() || null,
    contactEmail: input.contactEmail?.trim() || null,
    contactPhone: input.contactPhone?.trim() || null,
    serviceRegion: input.serviceRegion?.trim() || null,
    serviceNotes: input.serviceNotes?.trim() || null,
  };
}

export function validateHospitalInput(input: HospitalInput) {
  if (!input.name) {
    return "Hospital name is required.";
  }

  if (input.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contactEmail)) {
    return "Contact email must be a valid email address.";
  }

  return null;
}
