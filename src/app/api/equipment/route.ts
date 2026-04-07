import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import {
  normalizeEquipmentInput,
  validateEquipmentInput,
} from "@/lib/equipment-input";

type CreateEquipmentBody = {
  code?: string;
  name?: string;
  model?: string | null;
  serialNumber?: string | null;
  category?: string | null;
  status?: string;
  manufacturerId?: string;
  systemId?: string | null;
};

export async function GET(request: Request) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const status = url.searchParams.get("status")?.trim() ?? "";
  const system = url.searchParams.get("system")?.trim() ?? "";

  const equipment = await db.equipment.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status && status !== "all" ? { status } : {}),
      ...(system === "assigned"
        ? { systemId: { not: null } }
        : system === "unassigned"
          ? { systemId: null }
          : {}),
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { model: { contains: q, mode: "insensitive" } },
              { serialNumber: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
              {
                manufacturer: {
                  name: { contains: q, mode: "insensitive" },
                },
              },
              {
                system: {
                  code: { contains: q, mode: "insensitive" },
                },
              },
              {
                system: {
                  name: { contains: q, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ code: "asc" }],
    include: {
      manufacturer: true,
      system: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ equipment }, { status: 200 });
}

export async function POST(request: Request) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateEquipmentBody;
  const input = normalizeEquipmentInput(body);
  const validationError = validateEquipmentInput(input);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const manufacturer = await db.manufacturer.findFirst({
    where: {
      id: input.manufacturerId,
      organizationId: user.organizationId,
    },
  });

  if (!manufacturer) {
    return NextResponse.json(
      { message: "Selected manufacturer was not found." },
      { status: 400 },
    );
  }

  if (input.systemId) {
    const system = await db.system.findFirst({
      where: {
        id: input.systemId,
        organizationId: user.organizationId,
      },
    });

    if (!system) {
      return NextResponse.json(
        { message: "Selected system was not found." },
        { status: 400 },
      );
    }
  }

  const existing = await db.equipment.findUnique({
    where: {
      code: input.code,
    },
  });

  if (existing) {
    return NextResponse.json(
      { message: "Equipment with this code already exists." },
      { status: 409 },
    );
  }

  const equipment = await db.equipment.create({
    data: {
      ...input,
      organizationId: user.organizationId,
    },
    include: {
      manufacturer: true,
      system: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ equipment }, { status: 201 });
}
