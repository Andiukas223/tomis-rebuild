import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import {
  normalizeCompanyInput,
  validateCompanyInput,
} from "@/lib/company-input";

type CreateCompanyBody = {
  name?: string;
  code?: string | null;
  city?: string | null;
  country?: string | null;
};

export async function GET(request: Request) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  const companies = await db.company.findMany({
    where: {
      organizationId: user.organizationId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { code: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { country: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ name: "asc" }],
  });

  return NextResponse.json({ companies }, { status: 200 });
}

export async function POST(request: Request) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateCompanyBody;
  const input = normalizeCompanyInput(body);
  const validationError = validateCompanyInput(input);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const duplicate = await db.company.findFirst({
    where: {
      organizationId: user.organizationId,
      name: input.name,
    },
  });

  if (duplicate) {
    return NextResponse.json(
      { message: "A company with this name already exists." },
      { status: 409 },
    );
  }

  const company = await db.company.create({
    data: {
      ...input,
      organizationId: user.organizationId,
    },
  });

  return NextResponse.json({ company }, { status: 201 });
}
