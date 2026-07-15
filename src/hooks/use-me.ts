"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Me } from "@/lib/types";

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ["me"],
    enabled,
    queryFn: async () => {
      await api("/v1/users/sync", { method: "POST", body: "{}" });
      return api<Me>("/v1/me");
    },
  });
}
