"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        offset={{ top: 16, right: 16, bottom: 16 }}
        mobileOffset={{ bottom: 88, right: 12, left: 12 }}
        toastOptions={{
          className: "text-sm !rounded-2xl",
        }}
      />
    </QueryClientProvider>
  );
}
