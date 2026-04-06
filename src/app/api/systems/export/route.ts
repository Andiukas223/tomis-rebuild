import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";

function escapeCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const status = url.searchParams.get("status")?.trim() ?? "";

  const systems = await db.system.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status && status !== "all" ? { status } : {}),
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { serialNumber: { contains: q, mode: "insensitive" } },
              { hospital: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: [{ code: "asc" }],
    select: {
      code: true,
      name: true,
      serialNumber: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      hospital: {
        select: {
          name: true,
        },
      },
    },
  });

  const rows = [
    ["Code", "Name", "Serial Number", "Hospital", "Status", "Created At", "Updated At"],
    ...systems.map((system) => [
      system.code,
      system.name,
      system.serialNumber ?? "",
      system.hospital.name,
      system.status,
      system.createdAt.toISOString(),
      system.updatedAt.toISOString(),
    ]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="systems-export.csv"',
    },
  });
}
