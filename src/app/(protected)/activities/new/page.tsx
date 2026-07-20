"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { ActivityType } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  ErrorBox,
  HelperText,
  Input,
  Label,
  PageTitle,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export default function NewActivityPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [duration, setDuration] = useState(30);
  const [selected, setSelected] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<"low" | "moderate" | "high">("moderate");
  const [err, setErr] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<{
    calculated_calories: number;
    met_value: number;
    weight_kg: number;
  } | null>(null);

  const types = useQuery({
    queryKey: ["activity-types"],
    queryFn: () => api<{ data: ActivityType[] }>("/v1/activity-types"),
  });

  const estimateMut = useMutation({
    mutationFn: (activityTypeId: string) =>
      api<{ calculated_calories: number; met_value: number; weight_kg: number }>(
        "/v1/activity-estimates",
        {
          method: "POST",
          body: JSON.stringify({ activityTypeId, durationMinutes: Number(duration) }),
        },
      ),
    onSuccess: (d) => setEstimate(d),
    onError: (e: Error) => setErr(e.message),
  });

  const createMut = useMutation({
    mutationFn: () =>
      api("/v1/activity-logs", {
        method: "POST",
        idempotent: true,
        body: JSON.stringify({
          activityTypeId: selected,
          durationMinutes: Number(duration),
          intensity,
          caloriesBurned: estimate?.calculated_calories,
        }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Aktivitas tersimpan.");
      router.push("/dashboard");
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <PageTitle
        title="Catat aktivitas"
        subtitle="Tambah cepat dengan estimasi kalori dari data berat terbaru dan intensitas."
      />
      <Card className="space-y-4">
        <div>
          <Label htmlFor="duration">Durasi (menit)</Label>
          <Input
            id="duration"
            type="number"
            min={1}
            value={duration}
            onChange={(e) => {
              setDuration(Number(e.target.value));
              setEstimate(null);
            }}
          />
        </div>

        <div>
          <Label>Intensitas</Label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {(
              [
                ["low", "Ringan"],
                ["moderate", "Sedang"],
                ["high", "Berat"],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setIntensity(val)}
                className={cn(
                  "min-h-10 rounded-full border px-4 text-sm font-medium",
                  intensity === val
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"
                    : "border-[hsl(var(--border))] bg-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Aktivitas populer</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(types.data?.data ?? []).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelected(t.id);
                  estimateMut.mutate(t.id);
                }}
                className={cn(
                  "rounded-xl border p-3 text-left text-sm transition",
                  selected === t.id
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] shadow-sm"
                    : "border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--primary)/0.3)]",
                )}
              >
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{t.category}</div>
              </button>
            ))}
          </div>
          <HelperText>
            Detail teknis (MET) disembunyikan. Estimasi memakai data berat terbaru di profil.
          </HelperText>
        </div>

        {estimate ? (
          <div className="rounded-xl bg-[hsl(var(--secondary))] p-3 text-sm text-[hsl(var(--secondary-foreground))]">
            <p className="font-semibold">
              Estimasi pembakaran:{" "}
              <span className="tabular-nums">{estimate.calculated_calories} kkal</span>
            </p>
            <p className="mt-1 text-xs opacity-90">
              Berdasarkan data berat ~{estimate.weight_kg} kg dan durasi {duration} menit.
            </p>
            <Badge variant="outline" className="mt-2">
              Estimasi
            </Badge>
          </div>
        ) : null}

        {err ? <ErrorBox message={err} /> : null}
        {!selected ? <HelperText>Pilih aktivitas untuk melihat estimasi dan menyimpan.</HelperText> : null}

        <Button
          onClick={() => createMut.mutate()}
          loading={createMut.isPending}
          disabled={!selected}
        >
          Simpan aktivitas
        </Button>
      </Card>
    </div>
  );
}
