"use client";

import { useMe } from "@/hooks/use-me";
import { Button, Card, PageTitle } from "@/components/ui";
import { api } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfilePage() {
  const { data, refetch } = useMe();
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div>
      <PageTitle title="Profil" subtitle="Data profil & pengaturan akun" />
      <Card className="space-y-2 text-sm">
        <p>
          <span className="text-slate-500">Nama:</span> {data?.display_name ?? "—"}
        </p>
        <p>
          <span className="text-slate-500">Email:</span> {data?.email ?? "—"}
        </p>
        <p>
          <span className="text-slate-500">Berat:</span> {data?.profile?.current_weight_kg ?? "—"} kg
        </p>
        <p>
          <span className="text-slate-500">Tinggi:</span> {data?.profile?.height_cm ?? "—"} cm
        </p>
        <p>
          <span className="text-slate-500">Zona waktu:</span> {data?.settings?.timezone}
        </p>
        <p>
          <span className="text-slate-500">Simpan foto:</span>{" "}
          {data?.settings?.retain_food_photos ? "Ya" : "Tidak (default: hapus setelah analisis)"}
        </p>
        <p className="text-xs text-slate-400">
          Foto makanan dihapus otomatis setelah analisis AI. Kuota AI 10/hari. Usia min. 15.
        </p>
        {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="secondary" onClick={() => router.push("/onboarding")}>
            Ulangi onboarding
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (!confirm("Hapus akun dan semua data? Tindakan ini tidak dapat dibatalkan.")) return;
              await api("/v1/account/deletion-request", { method: "POST", body: "{}" });
              setMsg("Akun dihapus.");
              await refetch();
              router.push("/");
            }}
          >
            Hapus akun
          </Button>
        </div>
      </Card>
    </div>
  );
}
