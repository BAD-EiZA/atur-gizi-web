"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useMe } from "@/hooks/use-me";
import { ErrorBox } from "@/components/ui";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useMe();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!data) return;
    if (!data.onboarding_completed && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [data, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Memuat...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <ErrorBox message={(error as Error).message || "Gagal memuat sesi. Pastikan API berjalan."} />
      </div>
    );
  }

  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
