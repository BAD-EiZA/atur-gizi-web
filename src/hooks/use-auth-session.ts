"use client";

import { useQuery } from "@tanstack/react-query";

export type SessionUser = {
  id: string;
  name: string;
  email: string | null;
  picture: string | null;
};

export function useAuthSession() {
  return useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const res = await fetch("/api/session/me", { credentials: "include", cache: "no-store" });
      if (!res.ok) return { authenticated: false as const, user: null };
      return res.json() as Promise<{
        authenticated: boolean;
        user: SessionUser | null;
      }>;
    },
    staleTime: 60_000,
    retry: false,
  });
}
