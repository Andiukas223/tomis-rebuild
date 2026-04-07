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
  const priority = url.searchParams.get("priority")?.trim() ?? "";
  const assigneeId = url.searchParams.get("assigneeId")?.trim() ?? "";
  const dateFrom = url.searchParams.get("dateFrom")?.trim() ?? "";
  const dateTo = url.searchParams.get("dateTo")?.trim() ?? "";
  const systemId = url.searchParams.get("systemId")?.trim() ?? "";
  const equipmentId = url.searchParams.get("equipmentId")?.trim() ?? "";
  const createdAtFilter = {
    ...(dateFrom
      ? {
          gte: new Date(`${dateFrom}T00:00:00.000Z`),
        }
      : {}),
    ...(dateTo
      ? {
          lt: new Date(`${dateTo}T23:59:59.999Z`),
        }
      : {}),
  };

  const serviceCases = await db.serviceCase.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status && status !== "all" ? { status } : {}),
      ...(priority && priority !== "all" ? { priority } : {}),
      ...(assigneeId === "unassigned"
        ? { assignedUserId: null }
        : assigneeId
          ? { assignedUserId: assigneeId }
          : {}),
      ...(systemId ? { systemId } : {}),
      ...(equipmentId ? { equipmentId } : {}),
      ...(Object.keys(createdAtFilter).length > 0
        ? { createdAt: createdAtFilter }
        : {}),
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: "insensitive" } },
              { title: { contains: q, mode: "insensitive" } },
              { summary: { contains: q, mode: "insensitive" } },
              {
                system: {
                  code: { contains: q, mode: "insensitive" },
                },
              },
              {
                equipment: {
                  code: { contains: q, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      code: true,
      title: true,
      summary: true,
      status: true,
      priority: true,
      scheduledAt: true,
      completedAt: true,
      createdAt: true,
      updatedAt: true,
      system: {
        select: {
          code: true,
        },
      },
      equipment: {
        select: {
          code: true,
        },
      },
      assignedUser: {
        select: {
          fullName: true,
        },
      },
    },
  });

  const rows = [
    [
      "Case Code",
      "Title",
      "System",
      "Equipment",
      "Technician",
      "Priority",
      "Status",
      "Scheduled At",
      "Completed At",
      "Summary",
      "Created At",
      "Updated At",
    ],
    ...serviceCases.map((item) => [
      item.code,
      item.title,
      item.system.code,
      item.equipment?.code ?? "",
      item.assignedUser?.fullName ?? "",
      item.priority,
      item.status,
      item.scheduledAt?.toISOString() ?? "",
      item.completedAt?.toISOString() ?? "",
      item.summary ?? "",
      item.createdAt.toISOString(),
      item.updatedAt.toISOString(),
    ]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="service-cases-export.csv"',
    },
  });
}
