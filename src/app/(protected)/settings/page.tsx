"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useMe } from "@/hooks/use-me";
import { api } from "@/lib/api-client";
import { Button, Card, ErrorBox, Label, PageTitle, Select } from "@/components/ui";
import Link from "next/link";

export default function SettingsPage() {
  const { data, refetch } = useMe();
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [unitSystem, setUnitSystem] = useState("metric");
  const [retainPhotos, setRetainPhotos] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.settings) return;
    setTimezone(data.settings.timezone);
    setUnitSystem(data.settings.unit_system);
    setRetainPhotos(data.settings.retain_food_photos);
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      api("/v1/me/settings", {
        method: "PATCH",
        body: JSON.stringify({
          timezone,
          unitSystem,
          retainFoodPhotos: retainPhotos,
        }),
      }),
    onSuccess: async () => {
      setMsg("Pengaturan disimpan.");
      await refetch();
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <div>
      <PageTitle title="Pengaturan" subtitle="Preferensi akun, privasi media, unit." />
      <Card className="space-y-3">
        <div>
          <Label>Zona waktu (IANA)</Label>
          <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            <option value="Asia/Jakarta">Asia/Jakarta</option>
            <option value="Asia/Makassar">Asia/Makassar</option>
            <option value="Asia/Jayapura">Asia/Jayapura</option>
            <option value="Asia/Singapore">Asia/Singapore</option>
            <option value="UTC">UTC</option>
          </Select>
        </div>
        <div>
          <Label>Sistem unit</Label>
          <Select value={unitSystem} onChange={(e) => setUnitSystem(e.target.value)}>
            <option value="metric">Metrik (kg, cm)</option>
            <option value="imperial">Imperial</option>
          </Select>
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={retainPhotos}
            onChange={(e) => setRetainPhotos(e.target.checked)}
            className="mt-1"
          />
          Simpan foto makanan setelah analisis AI (default: hapus)
        </label>
        {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
        {err ? <ErrorBox message={err} /> : null}
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          Simpan
        </Button>
        <div className="flex flex-wrap gap-2 border-t pt-3 text-sm">
          <Link href="/billing" className="text-emerald-700">
            Langganan
          </Link>
          <Link href="/wearables" className="text-emerald-700">
            Wearable
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
