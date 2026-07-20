"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, Camera, LayoutDashboard, Utensils } from "lucide-react";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useAuthSession } from "@/hooks/use-auth-session";

const btnPrimary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-6 py-3 text-sm font-medium text-white shadow-[var(--shadow-sm)] transition hover:brightness-95 hover:shadow-[var(--shadow-glow)]";
const btnOutline =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] bg-white px-6 py-3 text-sm font-medium text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]";

export function HeroCta() {
  const { data, isLoading } = useAuthSession();
  const loggedIn = Boolean(data?.authenticated && data.user);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <div className="h-12 w-40 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
        <div className="h-12 w-36 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
      </div>
    );
  }

  if (loggedIn) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-white/75">
          Masuk sebagai <strong className="text-white">{data!.user!.name}</strong>
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/dashboard" className={btnPrimary}>
            <LayoutDashboard className="size-4" aria-hidden />
            Buka dashboard
          </Link>
          <Link
            href="/food/new"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
          >
            <Utensils className="size-4" aria-hidden />
            Catat makanan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
      <RegisterLink postLoginRedirectURL="/onboarding" className={btnPrimary}>
        Mulai gratis
        <ArrowRight className="size-4" aria-hidden />
      </RegisterLink>
      <a
        href="#cara-kerja"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
      >
        Lihat cara kerja
        <ArrowDown className="size-4" aria-hidden />
      </a>
    </div>
  );
}

export function FinalCta() {
  const { data, isLoading } = useAuthSession();
  const loggedIn = Boolean(data?.authenticated && data.user);

  if (isLoading) {
    return <div className="mx-auto h-12 w-48 animate-pulse rounded-full bg-[hsl(var(--muted))]" />;
  }

  if (loggedIn) {
    return (
      <div className="space-y-6 text-center">
        <h2 className="display-h2">Siap melanjutkan hari ini?</h2>
        <p className="mx-auto max-w-xl text-base text-[hsl(var(--muted-foreground))]">
          Kembali ke dashboard atau catat makanan berikutnya.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/dashboard" className={btnPrimary}>
            <LayoutDashboard className="size-4" aria-hidden />
            Buka dashboard
          </Link>
          <Link href="/food/scan" className={btnOutline}>
            <Camera className="size-4" aria-hidden />
            Pindai makanan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <h2 className="display-h2 mx-auto max-w-3xl">
        Mulai mencatat tanpa menjadikan setiap makan sebagai ujian
      </h2>
      <p className="mx-auto max-w-xl text-base text-[hsl(var(--muted-foreground))]">
        Buat akun, atur target, lalu catat makanan pertama. Gratis untuk mulai.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <RegisterLink postLoginRedirectURL="/onboarding" className={btnPrimary}>
          Mulai gratis
          <ArrowRight className="size-4" aria-hidden />
        </RegisterLink>
        <a href="#demo-ai" className={btnOutline}>
          Lihat demo AI
        </a>
      </div>
    </div>
  );
}
