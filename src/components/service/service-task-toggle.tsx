"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ServiceTaskToggle({
  taskId,
  checked,
}: {
  taskId: string;
  checked: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-1">
      <input
        type="checkbox"
        checked={checked}
        disabled={isPending}
        onChange={(event) => {
          setError("");
          startTransition(async () => {
            const response = await fetch(`/api/service-tasks/${taskId}`, {
              method: "PATCH",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ isCompleted: event.target.checked }),
            });

            if (!response.ok) {
              const data = (await response.json()) as { message?: string };
              setError(data.message ?? "Failed to update task.");
              return;
            }

            router.refresh();
          });
        }}
        className="h-4 w-4 rounded border-slate-300"
      />
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
