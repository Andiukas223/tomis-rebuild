"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isReady, pathname, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f4f7fb_0%,_#eef4fb_100%)] px-6">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          Preparing session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f4f7fb_0%,_#eef4fb_100%)] px-6">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          Redirecting to login...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
