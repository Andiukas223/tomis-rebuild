import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireServerCapability } from "@/lib/server-session";
import {
  createServiceReportSnapshot,
  getServiceReportData,
  normalizeServiceReportFilters,
} from "@/lib/service-reporting";

export async function POST(request: Request) {
  const { user, response } = await requireServerCapability("documents.manage");

  if (response || !user) {
    return response!;
  }

  const body = (await request.json().catch(() => ({}))) as {
    assigneeId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    title?: string;
    notes?: string;
    label?: string;
    workflowStatus?: string;
  };

  const filters = normalizeServiceReportFilters(body);
  const report = await getServiceReportData(user, filters);
  const snapshot = createServiceReportSnapshot(report);
  const customTitle = body.title?.trim() ?? "";
  const customNotes = body.notes?.trim() ?? "";
  const customLabel = body.label?.trim() ?? "";
  const normalizedWorkflowStatus =
    body.workflowStatus === "Shared" || body.workflowStatus === "Archived"
      ? body.workflowStatus
      : "Draft";

  const record = await db.generatedReport.create({
    data: {
      reportType: "service-operational-summary",
      title:
        customTitle.length > 0
          ? customTitle
          : `Service operational summary - ${report.windowLabel}`,
      notes: customNotes.length > 0 ? customNotes : null,
      label: customLabel.length > 0 ? customLabel : null,
      workflowStatus: normalizedWorkflowStatus,
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
