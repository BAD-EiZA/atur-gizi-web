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
    // Force incomplete users into onboarding; allow revisit to update targets
    if (!data.onboarding_completed && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [data, isFetching, pathname, router]);

  if (isLoading) {
    return (
      <div className="mesh-bg flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="size-10 animate-pulse rounded-2xl bg-[hsl(var(--secondary))] ring-1 ring-[hsl(var(--primary)/0.15)]" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Memuat sesi...</p>
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
      <div className="mesh-bg flex min-h-screen flex-col items-center justify-center gap-3">
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[hsl(var(--primary))]" />
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Mengalihkan ke onboarding...</p>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
