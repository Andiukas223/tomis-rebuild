"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const { login, isAuthenticated, isReady } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (isReady && isAuthenticated) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          You already have a session in this browser.
        </div>
        <Link
          href={nextPath || "/dashboard"}
          className="block rounded-full bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Continue to protected shell
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");

        startTransition(async () => {
          const success = await login(username, password);

          if (!success) {
            setError("Please enter both username and password.");
            return;
          }

          router.push(nextPath || "/dashboard");
        });
      }}
    >
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Username or email
        </label>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          placeholder="Enter your username or email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          placeholder="Enter your password"
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
          Remember me
        </label>
        <span className="text-sky-700">Forgot password?</span>
      </div>
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        className="block w-full rounded-full bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isPending}
      >
        {isPending ? "Signing in..." : "Enter protected shell"}
      </button>
    </form>
  );
}
