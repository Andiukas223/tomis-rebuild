export function normalizeServiceNoteBody(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateServiceNoteBody(body: string) {
  if (!body) {
    return "Note text is required.";
  }

  if (body.length > 4000) {
    return "Notes must be 4000 characters or fewer.";
  }

  return null;
}
