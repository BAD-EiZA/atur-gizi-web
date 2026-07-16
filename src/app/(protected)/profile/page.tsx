"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useMe } from "@/hooks/use-me";
import { clearTokenCache } from "@/lib/api-client";
import { Badge, Button, Card, HelperText, PageTitle, SectionTitle } from "@/components/ui";

export default function ProfilePage() {
  const { data } = useMe();
  const router = useRouter();
  const initials = (data?.display_name || data?.email || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageTitle title="Profil" subtitle="Data dasar dan preferensi akun." />

      <Card className="flex flex-wrap items-center gap-4">
        <div
          className="flex size-16 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-lg font-bold text-[hsl(var(--secondary-foreground))]"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold">{data?.display_name || "Pengguna"}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {data?.email || "Email dikelola Kinde"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">
              {data?.onboarding_completed ? "Onboarding selesai" : "Onboarding belum selesai"}
            </Badge>
            <Badge variant="outline">Kuota AI 10/hari</Badge>
          </div>
        </div>
        <Button variant="secondary" onClick={() => router.push("/settings")}>
          Buka setelan
        </Button>
      </Card>

      <Card className="space-y-3 text-sm">
        <SectionTitle>Informasi dasar</SectionTitle>
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-[hsl(var(--muted-foreground))]">Berat</dt>
            <dd className="font-medium tabular-nums">
              {data?.profile?.current_weight_kg ?? "—"} kg
            </dd>
          </div>
          <div>
            <dt className="text-[hsl(var(--muted-foreground))]">Tinggi</dt>
            <dd className="font-medium tabular-nums">{data?.profile?.height_cm ?? "—"} cm</dd>
          </div>
          <div>
            <dt className="text-[hsl(var(--muted-foreground))]">Zona waktu</dt>
            <dd className="font-medium">{data?.settings?.timezone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[hsl(var(--muted-foreground))]">Simpan foto AI</dt>
            <dd className="font-medium">
              {data?.settings?.retain_food_photos ? "Ya" : "Tidak (default hapus)"}
            </dd>
          </div>
        </dl>
        <HelperText>
          Data dipakai untuk estimasi target dan aktivitas. Bukan diagnosis medis. Usia minimum 15.
        </HelperText>
        <Button variant="outline" onClick={() => router.push("/onboarding")}>
          Perbarui target / onboarding
        </Button>
      </Card>

      <Card className="space-y-3">
        <SectionTitle>Akun</SectionTitle>
        <div className="flex flex-wrap gap-2">
          <LogoutLink
            postLogoutRedirectURL="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--secondary-foreground))]"
            onClick={() => clearTokenCache()}
          >
            Keluar
          </LogoutLink>
          <Link href="/export">
            <Button variant="outline">Ekspor data</Button>
          </Link>
        </div>
      </Card>

      <Card className="border-red-200 bg-red-50/50 space-y-2">
        <SectionTitle>Zona berbahaya</SectionTitle>
        <p className="text-sm text-red-900/80">
          Menghapus akun akan menghapus catatan, target, dan media terkait. Tindakan tidak dapat
          dibatalkan setelah proses selesai.
        </p>
        <Link href="/account/delete">
          <Button variant="danger">Hapus akun…</Button>
        </Link>
      </Card>
    </div>
  );
}
