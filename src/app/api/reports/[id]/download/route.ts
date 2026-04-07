import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";

type SavedServiceReportSnapshot = {
  totalCases?: number;
  doneRate?: number;
  assignmentCoverage?: number;
  avgCompletionHours?: number | null;
  agingBuckets?: {
    under24?: number;
    under72?: number;
    over72?: number;
  };
  technicians?: Array<{
    fullName: string;
    activeCount: number;
    overdueCount: number;
    completedCount: number;
    avgDoneHours: number | null;
    taskProgress: string;
  }>;
  highestRiskCases?: Array<{
    code: string;
    title: string;
    systemCode: string;
    priority: string;
    status: string;
    assignedTo: string | null;
  }>;
};

type SavedServiceReportFilters = {
  assigneeId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatHours(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return `${value.toFixed(1)} h`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const report = await db.generatedReport.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      createdBy: {
        select: {
          fullName: true,
        },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const snapshot = report.snapshot as unknown as SavedServiceReportSnapshot;
  const filters = report.filters as unknown as SavedServiceReportFilters;
  const technicians = snapshot.technicians ?? [];
  const highestRiskCases = snapshot.highestRiskCases ?? [];

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(report.title)}</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; margin: 40px; color: #0f172a; }
      h1, h2, h3 { margin: 0; }
      .muted { color: #475569; }
      .grid { display: grid; gap: 16px; }
      .grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .card { border: 1px solid #cbd5e1; border-radius: 18px; padding: 18px; background: #fff; }
      .metric { font-size: 28px; font-weight: 700; margin-top: 10px; }
      .section { margin-top: 28px; }
      .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #64748b; }
      table { width: 100%; border-collapse: collapse; margin-top: 14px; }
      th, td { border-bottom: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; font-size: 14px; vertical-align: top; }
      th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #64748b; }
      .note { border: 1px solid #bae6fd; background: #f0f9ff; border-radius: 16px; padding: 16px; margin-top: 16px; }
      @media print {
        body { margin: 0; }
      }
    </style>
  </head>
  <body>
    <header>
      <p class="label">Tomis Rebuild</p>
      <h1>${escapeHtml(report.title)}</h1>
      <p class="muted">Saved ${escapeHtml(report.createdAt.toLocaleString())}</p>
      <p class="muted">Scope: ${escapeHtml(report.scopeLabel)} | Window: ${escapeHtml(report.dateWindowLabel)} | Author: ${escapeHtml(report.createdBy?.fullName ?? "System")}</p>
    </header>

    <section class="section grid grid-4">
      <article class="card">
        <div class="label">Total cases</div>
        <div class="metric">${snapshot.totalCases ?? 0}</div>
      </article>
      <article class="card">
        <div class="label">Completion rate</div>
        <div class="metric">${snapshot.doneRate?.toFixed(0) ?? "0"}%</div>
      </article>
      <article class="card">
        <div class="label">Assignment coverage</div>
        <div class="metric">${snapshot.assignmentCoverage?.toFixed(0) ?? "0"}%</div>
      </article>
      <article class="card">
        <div class="label">Avg completion</div>
        <div class="metric">${escapeHtml(formatHours(snapshot.avgCompletionHours))}</div>
      </article>
    </section>

    <section class="section grid grid-2">
      <article class="card">
        <h2>Saved filters</h2>
        <p class="muted">Technician: ${escapeHtml(filters.assigneeId || "All technicians")}</p>
        <p class="muted">Status: ${escapeHtml(filters.status || "All statuses")}</p>
        <p class="muted">Date range: ${escapeHtml(filters.dateFrom || "Any start")} to ${escapeHtml(filters.dateTo || "Any end")}</p>
        ${report.notes ? `<div class="note"><div class="label">Internal notes</div><p>${escapeHtml(report.notes)}</p></div>` : ""}
      </article>
      <article class="card">
        <h2>Saved aging profile</h2>
        <p class="muted">Under 24h: ${snapshot.agingBuckets?.under24 ?? 0}</p>
        <p class="muted">24 to 72h: ${snapshot.agingBuckets?.under72 ?? 0}</p>
        <p class="muted">Over 72h: ${snapshot.agingBuckets?.over72 ?? 0}</p>
      </article>
    </section>

    <section class="section">
      <h2>Technician summary</h2>
      <table>
        <thead>
          <tr>
            <th>Technician</th>
            <th>Active</th>
            <th>Overdue</th>
            <th>Completed</th>
            <th>Avg done time</th>
            <th>Task progress</th>
          </tr>
        </thead>
        <tbody>
          ${technicians
            .map(
              (row) => `<tr>
                <td>${escapeHtml(row.fullName)}</td>
                <td>${row.activeCount}</td>
                <td>${row.overdueCount}</td>
                <td>${row.completedCount}</td>
                <td>${escapeHtml(formatHours(row.avgDoneHours))}</td>
                <td>${escapeHtml(row.taskProgress)}</td>
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </section>

    <section class="section">
      <h2>Highest-risk cases</h2>
      <table>
        <thead>
          <tr>
            <th>Case</th>
            <th>System</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned</th>
          </tr>
        </thead>
        <tbody>
          ${highestRiskCases
            .map(
              (item) => `<tr>
                <td><strong>${escapeHtml(item.code)}</strong><br /><span class="muted">${escapeHtml(item.title)}</span></td>
                <td>${escapeHtml(item.systemCode)}</td>
                <td>${escapeHtml(item.priority)}</td>
                <td>${escapeHtml(item.status)}</td>
                <td>${escapeHtml(item.assignedTo ?? "Unassigned")}</td>
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </section>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slugify(report.title || "generated-report") || "generated-report"}.html"`,
    },
  });
}
