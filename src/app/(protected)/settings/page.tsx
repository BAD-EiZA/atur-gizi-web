"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useMe } from "@/hooks/use-me";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button, Card, ErrorBox, HelperText, PageTitle, SectionTitle, Select } from "@/components/ui";
import { InfoTip, LabelWithTip } from "@/components/info-tip";
import Link from "next/link";

export default function SettingsPage() {
  const { data, refetch } = useMe();
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [unitSystem, setUnitSystem] = useState("metric");
  const [retainPhotos, setRetainPhotos] = useState(false);
  const [budgetMode, setBudgetMode] = useState("intake_only");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.settings) return;
    setTimezone(data.settings.timezone);
    setUnitSystem(data.settings.unit_system);
    setRetainPhotos(data.settings.retain_food_photos);
    setBudgetMode(
      (data.settings as { calorie_budget_mode?: string }).calorie_budget_mode ?? "intake_only",
    );
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      api("/v1/me/settings", {
        method: "PATCH",
        body: JSON.stringify({
          timezone,
          unitSystem,
          retainFoodPhotos: retainPhotos,
          calorieBudgetMode: budgetMode,
        }),
      }),
    onSuccess: async () => {
      setMsg("Pengaturan berhasil disimpan.");
      toast.success("Pengaturan berhasil disimpan.");
      await refetch();
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <div className="animate-fade-up">
      <PageTitle title="Pengaturan" subtitle="Atur preferensi umum, privasi, dan penggunaan AI." />
      <Card className="space-y-3">
        <SectionTitle>Umum</SectionTitle>
        <div>
          <LabelWithTip tip="Zona waktu menentukan tanggal log harian (mis. Asia/Jakarta).">
            Zona waktu
          </LabelWithTip>
          <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            <option value="Asia/Jakarta">Asia/Jakarta</option>
            <option value="Asia/Makassar">Asia/Makassar</option>
            <option value="Asia/Jayapura">Asia/Jayapura</option>
            <option value="Asia/Singapore">Asia/Singapore</option>
            <option value="UTC">UTC</option>
          </Select>
        </div>
        <div>
          <LabelWithTip tip="Metrik memakai kg dan cm. Imperial untuk lb/in (jika diaktifkan di alur terkait).">
            Satuan
          </LabelWithTip>
          <Select value={unitSystem} onChange={(e) => setUnitSystem(e.target.value)}>
            <option value="metric">Metrik (kg, cm)</option>
            <option value="imperial">Imperial</option>
          </Select>
        </div>
        <div>
          <LabelWithTip tip="budget_mode">Cara menghitung sisa kalori</LabelWithTip>
          <Select value={budgetMode} onChange={(e) => setBudgetMode(e.target.value)}>
            <option value="intake_only">Hanya makanan (disarankan)</option>
            <option value="eat_back">Makanan dan aktivitas</option>
          </Select>
          <HelperText>
            {budgetMode === "eat_back"
              ? "Sisa kalori dihitung dari target dikurangi makanan, lalu ditambah kalori aktivitas."
              : "Sisa kalori dihitung dari target dikurangi kalori makanan. Kalori dari aktivitas tidak ditambahkan agar tidak terhitung dua kali."}
          </HelperText>
        </div>
        <SectionTitle>Privasi dan AI</SectionTitle>
        <label className="flex items-start gap-2 text-sm text-[hsl(var(--foreground))]">
          <input
            type="checkbox"
            checked={retainPhotos}
            onChange={(e) => setRetainPhotos(e.target.checked)}
            className="mt-1 size-4"
          />
          <span>
            <span className="inline-flex items-center gap-1">
              Simpan foto makanan setelah dianalisis
              <InfoTip tip="retain_photos" />
            </span>
            <HelperText>
              Secara default, foto dihapus setelah analisis atau setelah hasil dikonfirmasi.
            </HelperText>
          </span>
        </label>
        {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
        {err ? <ErrorBox message={err} /> : null}
        <Button onClick={() => save.mutate()} disabled={save.isPending} loading={save.isPending}>
          {save.isPending ? "Menyimpan..." : "Simpan pengaturan"}
        </Button>
        <div className="flex flex-wrap gap-2 border-t pt-3 text-sm">
          <Link href="/billing" className="text-emerald-700">
            Kelola langganan
          </Link>
          <Link href="/wearables" className="text-emerald-700">
            Hubungkan perangkat
          </Link>
          <Link href="/export" className="text-emerald-700">
            Ekspor data
          </Link>
          <Link href="/account/delete" className="text-red-600">
            Hapus akun
          </Link>
        </div>
      </Card>
    </div>
  );
}
