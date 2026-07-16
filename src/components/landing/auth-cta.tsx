"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, Camera, LayoutDashboard, Utensils } from "lucide-react";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useAuthSession } from "@/hooks/use-auth-session";

export function HeroCta() {
  const { data, isLoading } = useAuthSession();
  const loggedIn = Boolean(data?.authenticated && data.user);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-11 w-40 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
        <div className="h-11 w-36 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
      </div>
    );
  }

  if (loggedIn) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Anda sudah masuk sebagai <strong>{data!.user!.name}</strong>.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 py-3 text-sm font-medium text-white hover:brightness-95"
          >
            <LayoutDashboard className="size-4" aria-hidden />
            Buka dashboard
          </Link>
          <Link
            href="/food/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-white px-5 py-3 text-sm font-medium hover:bg-[hsl(var(--muted))]"
          >
            <Utensils className="size-4" aria-hidden />
            Catat makanan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <RegisterLink
        postLoginRedirectURL="/onboarding"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 py-3 text-sm font-medium text-white hover:brightness-95"
      >
        Mulai gratis
        <ArrowRight className="size-4" aria-hidden />
      </RegisterLink>
      <a
        href="#cara-kerja"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-white px-5 py-3 text-sm font-medium hover:bg-[hsl(var(--muted))]"
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
    return <div className="mx-auto h-11 w-48 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />;
  }

  if (loggedIn) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Siap melanjutkan hari ini?</h2>
        <p className="mx-auto max-w-xl text-sm text-[hsl(var(--muted-foreground))] md:text-base">
          Kembali ke dashboard atau catat makanan berikutnya.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 py-3 text-sm font-medium text-white sm:w-auto"
          >
            <LayoutDashboard className="size-4" aria-hidden />
            Buka dashboard
          </Link>
          <Link
            href="/food/scan"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-white px-5 py-3 text-sm font-medium sm:w-auto"
          >
            <Camera className="size-4" aria-hidden />
            Pindai makanan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Mulai mencatat tanpa menjadikan setiap makan sebagai ujian
      </h2>
      <p className="mx-auto max-w-xl text-sm text-[hsl(var(--muted-foreground))] md:text-base">
        Buat akun, atur target, lalu catat makanan pertama. Gratis untuk mulai — tidak perlu kartu
        pembayaran.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <RegisterLink
          postLoginRedirectURL="/onboarding"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 py-3 text-sm font-medium text-white sm:w-auto"
        >
          Mulai gratis
          <ArrowRight className="size-4" aria-hidden />
        </RegisterLink>
        <a
          href="#demo-ai"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-white px-5 py-3 text-sm font-medium sm:w-auto"
        >
          Lihat demo AI
        </a>
      </div>
    </div>
  );
}
