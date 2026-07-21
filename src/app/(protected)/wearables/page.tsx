"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button, Card, PageTitle } from "@/components/ui";
import { InfoTip } from "@/components/info-tip";

type Wearables = {
  data: Array<{ id: string; provider: string; status: string; last_sync_at: string | null }>;
  available: string[];
};

const labels: Record<string, string> = {
  apple_health: "Apple Health",
  google_health_connect: "Google Health Connect",
  garmin: "Garmin",
  fitbit: "Fitbit",
};

const nativeOnly = new Set(["apple_health", "google_health_connect"]);

export default function WearablesPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["wearables"],
    queryFn: () => api<Wearables>("/v1/wearables"),
  });

  const connect = useMutation({
    mutationFn: (provider: string) =>
      api(`/v1/wearables/${provider}/connect`, { method: "POST", body: "{}" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wearables"] }),
  });

  return (
    <div className="animate-fade-up space-y-4">
      <PageTitle
        title="Wearable"
        subtitle="OAuth penuh (Google Health / Apple) menyusul. Sementara: impor lewat screenshot AI — semua merek."
      />

      <Card className="space-y-3 border-[hsl(var(--primary)/0.2)] bg-gradient-to-br from-sky-50/80 to-white">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2.5 text-[hsl(var(--primary))] ring-1 ring-[hsl(var(--border))]">
            <Camera className="size-5" aria-hidden />
          </div>
          <div className="flex-1">
            <p className="inline-flex items-center gap-1.5 font-semibold">
              Impor lewat screenshot
              <InfoTip tip="screenshot_import" />
            </p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Screenshot ringkasan workout di app jam/HP → AI membaca durasi, kalori, jarak → Anda
              tinjau lalu simpan. Bekerja untuk Apple Fitness, Fitbit, Strava, Garmin, dll.
            </p>
            <Link href="/activities/import-screenshot" className="mt-3 inline-block">
              <Button>Buka impor screenshot</Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {(q.data?.available ?? []).map((provider) => {
          const linked = q.data?.data.find((d) => d.provider === provider);
          const isNative = nativeOnly.has(provider);
          return (
            <Card key={provider} className="space-y-3 text-sm" interactive>
              <p className="font-medium">{labels[provider] ?? provider}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {isNative
                  ? "Butuh app iOS/Android native (belum tersedia di web)."
                  : linked
                    ? `Terhubung · sync ${linked.last_sync_at ?? "—"}`
                    : "Stub demo — OAuth real menyusul. Pakai screenshot untuk data nyata."}
              </p>
              {isNative ? (
                <Button variant="secondary" disabled>
                  Segera hadir
                </Button>
              ) : linked ? (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      api(`/v1/wearables/${provider}/sync`, {
                        method: "POST",
                        body: JSON.stringify({ demo: true }),
                      }).then(() => qc.invalidateQueries({ queryKey: ["wearables"] }))
                    }
                  >
                    Sync demo
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      api(`/v1/wearables/${provider}`, { method: "DELETE" }).then(() =>
                        qc.invalidateQueries({ queryKey: ["wearables"] }),
                      )
                    }
                  >
                    Putus
                  </Button>
                </div>
              ) : (
                <Button onClick={() => connect.mutate(provider)}>Hubungkan (stub)</Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
