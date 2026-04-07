import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getServerSessionUser,
  requireServerCapability,
} from "@/lib/server-session";
import {
  normalizeCompanyInput,
  validateCompanyInput,
} from "@/lib/company-input";

type CompanyRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateCompanyBody = {
  name?: string;
  code?: string | null;
  city?: string | null;
  country?: string | null;
};

export async function GET(_: Request, { params }: CompanyRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const company = await db.company.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!company) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ company }, { status: 200 });
}

export async function PATCH(request: Request, { params }: CompanyRouteProps) {
  const { user, response } = await requireServerCapability("registry.manage");

  if (response || !user) {
    return response!;
  }

  const { id } = await params;

  const existing = await db.company.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as UpdateCompanyBody;
  const input = normalizeCompanyInput(body);
  const validationError = validateCompanyInput(input);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const duplicate = await db.company.findFirst({
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
      { message: "A company with this name already exists." },
      { status: 409 },
    );
  }

  const company = await db.company.update({
    where: { id },
    data: input,
  });

  return NextResponse.json({ company }, { status: 200 });
}

export async function DELETE(_: Request, { params }: CompanyRouteProps) {
  const { user, response } = await requireServerCapability("registry.manage");

  if (response || !user) {
    return response!;
  }

  const { id } = await params;

  const existing = await db.company.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await db.company.delete({
    where: { id },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
