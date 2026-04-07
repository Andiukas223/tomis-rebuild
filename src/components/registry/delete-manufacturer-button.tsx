"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function DeleteManufacturerButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        const confirmed = window.confirm(
          "Delete this manufacturer? Linked products and equipment must be removed first.",
        );

        if (!confirmed) {
          return;
        }

        startTransition(async () => {
          const response = await fetch(`/api/manufacturers/${id}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!response.ok) {
            const data = (await response.json()) as { message?: string };
            window.alert(data.message ?? "Failed to delete manufacturer.");
            return;
          }

          router.push("/registry/manufacturers");
          router.refresh();
        });
      }}
      className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
