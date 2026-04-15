"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { SessionUser } from "@/lib/session";

type AuthContextValue = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    const refreshSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
          cache: "no-store",
        });

        if (!active) {
          return;
        }

        if (!response.ok) {
          setUser(null);
          setIsReady(true);
          return;
        }

        const data = (await response.json()) as { user: SessionUser | null };
        setUser(data.user);
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsReady(true);
        }
      }
    };

    void refreshSession();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isReady,
      async login(username: string, password: string) {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { message?: string } | null;
          return {
            success: false,
            message: data?.message ?? "Invalid username or password.",
          };
        }

        const data = (await response.json()) as { user: SessionUser };
        setUser(data.user);
        return { success: true };
      },
      async logout() {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        setUser(null);
      },
      async refresh() {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = (await response.json()) as { user: SessionUser | null };
        setUser(data.user);
      },
    }),
    [isReady, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
