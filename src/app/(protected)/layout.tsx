"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useMe } from "@/hooks/use-me";
import { ErrorBox, Button } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isFetching, error } = useMe();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!data || isFetching) return;
    if (!data.onboarding_completed && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }
    if (data.onboarding_completed && pathname === "/onboarding") {
      router.replace("/dashboard");
    }
  }, [data, isFetching, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Memuat...
      </div>
    );
  }

  if (error) {
    const status = error instanceof ApiError ? error.status : 0;
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-16">
        <ErrorBox
          message={
            status === 401
              ? "Sesi berakhir. Silakan masuk kembali."
              : (error as Error).message || "Gagal memuat sesi."
          }
        />
        <Link href="/api/auth/login">
          <Button className="w-full">Masuk ulang</Button>
        </Link>
      </div>
    );
  }

  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  // Block dashboard shell until onboarding done (avoids flash then bounce)
  if (data && !data.onboarding_completed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Mengalihkan ke onboarding...
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
