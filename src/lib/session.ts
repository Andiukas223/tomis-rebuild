import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export type SessionUser = {
  id: string;
  name: string;
  role: string;
  organizationId: string;
  organizationName: string;
};

const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "tomis-rebuild-dev-secret-change-me";

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : `${normalized}${"=".repeat(4 - padding)}`;

  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

export function encodeSessionToken(token: string) {
  const data = toBase64Url(token);
  const signature = sign(data);
  return `${data}.${signature}`;
}

export function decodeSessionToken(rawCookie: string | undefined) {
  if (!rawCookie) {
    return null;
  }

  const [data, signature] = rawCookie.split(".");

  if (!data || !signature) {
    return null;
  }

  const expectedSignature = sign(data);
  const valid =
    signature.length === expectedSignature.length &&
    timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8"),
    );

  if (!valid) {
    return null;
  }

  try {
    return fromBase64Url(data);
  } catch {
    return null;
  }
}

export function createSessionToken() {
  return randomBytes(32).toString("hex");
}

export function toSessionUser(input: {
  id: string;
  fullName: string;
  role: string;
  organizationId: string;
  organizationName: string;
}) {
  return {
    id: input.id,
    name: input.fullName,
    role: input.role,
    organizationId: input.organizationId,
    organizationName: input.organizationName,
  } satisfies SessionUser;
}
