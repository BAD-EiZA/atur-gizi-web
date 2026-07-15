"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { setTokenGetter } from "@/lib/api-client";

const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    setTokenGetter(() => {
      if (DEV_AUTH) return null;
      if (typeof window === "undefined") return null;
      return sessionStorage.getItem("atur_gizi_access_token");
    });
    return new QueryClient({
      defaultOptions: {
        queries: { staleTime: 15_000, retry: 1 },
      },
    });
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
