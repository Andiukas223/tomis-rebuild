import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getServerSessionUser,
  requireServerCapability,
} from "@/lib/server-session";
import {
  normalizeManufacturerInput,
  validateManufacturerInput,
} from "@/lib/manufacturer-input";

type CreateManufacturerBody = {
  name?: string;
  code?: string | null;
  country?: string | null;
  website?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  productFocus?: string | null;
  serviceNotes?: string | null;
};

export async function GET(request: Request) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  const manufacturers = await db.manufacturer.findMany({
    where: {
      organizationId: user.organizationId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { code: { contains: q, mode: "insensitive" } },
              { country: { contains: q, mode: "insensitive" } },
              { website: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ name: "asc" }],
  });

  return NextResponse.json({ manufacturers }, { status: 200 });
}

export async function POST(request: Request) {
  const { user, response } = await requireServerCapability("registry.manage");

  if (response || !user) {
    return response!;
  }

  const body = (await request.json()) as CreateManufacturerBody;
  const input = normalizeManufacturerInput(body);
  const validationError = validateManufacturerInput(input);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const duplicate = await db.manufacturer.findFirst({
    where: {
      organizationId: user.organizationId,
      name: input.name,
    },
  });

  if (duplicate) {
    return NextResponse.json(
      { message: "A manufacturer with this name already exists." },
      { status: 409 },
    );
  }

  const manufacturer = await db.manufacturer.create({
    data: {
      ...input,
      organizationId: user.organizationId,
    },
  });

  return NextResponse.json({ manufacturer }, { status: 201 });
}
