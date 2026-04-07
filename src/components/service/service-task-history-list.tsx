type ServiceTaskHistoryListProps = {
  events: Array<{
    id: string;
    eventType: string;
    createdAtLabel: string;
    changedByName: string | null;
    previousAssigneeName: string | null;
    newAssigneeName: string | null;
    previousCompleted: boolean | null;
    newCompleted: boolean | null;
  }>;
};

export function ServiceTaskHistoryList({
  events,
}: ServiceTaskHistoryListProps) {
  if (events.length === 0) {
    return (
      <p className="text-xs leading-6 text-slate-500">
        No execution history yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => {
        const assignmentText =
          event.previousAssigneeName !== event.newAssigneeName
            ? `${event.previousAssigneeName ?? "Unassigned"} -> ${event.newAssigneeName ?? "Unassigned"}`
            : null;
        const statusText =
          event.previousCompleted !== event.newCompleted
            ? event.newCompleted
              ? "Marked complete"
              : "Reopened"
            : null;

        return (
          <div
            key={event.id}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                {event.eventType === "status-update" ? "Status" : "Update"}
              </span>
              <p className="text-xs text-slate-500">
                {event.changedByName ?? "System"} | {event.createdAtLabel}
              </p>
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-600">
              {[statusText, assignmentText].filter(Boolean).join(" | ") ||
                "Task details updated."}
            </p>
          </div>
        );
      })}
    </div>
  );
}
