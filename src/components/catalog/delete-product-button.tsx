"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        const confirmed = window.confirm(
          "Delete this product? This action cannot be undone.",
        );

        if (!confirmed) {
          return;
        }

        startTransition(async () => {
          const response = await fetch(`/api/products/${id}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!response.ok) {
            window.alert("Failed to delete product.");
            return;
          }

          router.refresh();
        });
      }}
      className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
