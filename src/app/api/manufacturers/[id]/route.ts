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

type ManufacturerRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateManufacturerBody = {
  name?: string;
  code?: string | null;
  country?: string | null;
  website?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  productFocus?: string | null;
  serviceNotes?: string | null;
};

export async function GET(_: Request, { params }: ManufacturerRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const manufacturer = await db.manufacturer.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      _count: {
        select: {
          equipment: true,
          products: true,
        },
      },
    },
  });

  if (!manufacturer) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ manufacturer }, { status: 200 });
}

export async function PATCH(
  request: Request,
  { params }: ManufacturerRouteProps,
) {
  const { user, response } = await requireServerCapability("registry.manage");

  if (response || !user) {
    return response!;
  }

  const { id } = await params;

  const existing = await db.manufacturer.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      _count: {
        select: {
          equipment: true,
          products: true,
        },
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as UpdateManufacturerBody;
  const input = normalizeManufacturerInput(body);
  const validationError = validateManufacturerInput(input);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const duplicate = await db.manufacturer.findFirst({
    where: {
      organizationId: user.organizationId,
      name: input.name,
      NOT: {
        id,
      },
    },
  });

  if (duplicate) {
    return NextResponse.json(
      { message: "A manufacturer with this name already exists." },
      { status: 409 },
    );
  }

  const manufacturer = await db.manufacturer.update({
    where: { id },
    data: input,
  });

  return NextResponse.json({ manufacturer }, { status: 200 });
}

export async function DELETE(_: Request, { params }: ManufacturerRouteProps) {
  const { user, response } = await requireServerCapability("registry.manage");

  if (response || !user) {
    return response!;
  }

  const { id } = await params;

  const existing = await db.manufacturer.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      _count: {
        select: {
          equipment: true,
          products: true,
        },
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (existing._count.products > 0 || existing._count.equipment > 0) {
    return NextResponse.json(
      {
        message:
          "This manufacturer is still linked to products or equipment and cannot be deleted yet.",
      },
      { status: 409 },
    );
  }

  await db.manufacturer.delete({
    where: { id },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
