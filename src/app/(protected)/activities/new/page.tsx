"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ActivityType } from "@/lib/types";
import { Button, Card, ErrorBox, Input, Label, PageTitle } from "@/components/ui";

export default function NewActivityPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [duration, setDuration] = useState(30);
  const [selected, setSelected] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<number | null>(null);

  const types = useQuery({
    queryKey: ["activity-types"],
    queryFn: () => api<{ data: ActivityType[] }>("/v1/activity-types"),
  });

  const estimateMut = useMutation({
    mutationFn: (activityTypeId: string) =>
      api<{ calculated_calories: number }>("/v1/activity-estimates", {
        method: "POST",
        body: JSON.stringify({ activityTypeId, durationMinutes: Number(duration) }),
      }),
    onSuccess: (d) => setEstimate(d.calculated_calories),
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
          caloriesBurned: estimate ?? undefined,
        }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/dashboard");
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <div>
      <PageTitle title="Catat aktivitas" subtitle="Quick add dengan estimasi MET × berat." />
      <Card className="space-y-3">
        <div>
          <Label>Durasi (menit)</Label>
          <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(types.data?.data ?? []).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setSelected(t.id);
                estimateMut.mutate(t.id);
              }}
              className={`rounded-xl border p-3 text-left text-sm ${
                selected === t.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
              }`}
            >
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-slate-500">MET {t.default_met}</div>
            </button>
          ))}
        </div>
        {estimate != null ? (
          <p className="text-sm">
            Estimasi: <strong>{estimate} kkal</strong> (bisa diubah setelah simpan)
          </p>
        ) : null}
        {err ? <ErrorBox message={err} /> : null}
        <Button onClick={() => createMut.mutate()} disabled={!selected || createMut.isPending}>
          Simpan aktivitas
        </Button>
      </Card>
    </div>
  );
}
