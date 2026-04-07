import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import {
  createServiceReportSnapshot,
  getServiceReportData,
  normalizeServiceReportFilters,
} from "@/lib/service-reporting";

export async function POST(request: Request) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    assigneeId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  };

  const filters = normalizeServiceReportFilters(body);
  const report = await getServiceReportData(user, filters);
  const snapshot = createServiceReportSnapshot(report);

  const record = await db.generatedReport.create({
    data: {
      reportType: "service-operational-summary",
      title: `Service operational summary - ${report.windowLabel}`,
      scopeLabel: report.reportScopeLabel,
      dateWindowLabel: report.windowLabel,
      filters,
      snapshot,
      organizationId: user.organizationId,
      createdById: user.id,
    },
    select: {
      id: true,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
