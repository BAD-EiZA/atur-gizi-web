"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api-client";
import type { ActivityLog } from "@/lib/types";
import { Button, Card, ErrorBox, Input, Label, PageTitle, Select } from "@/components/ui";

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [duration, setDuration] = useState(30);
  const [calories, setCalories] = useState(0);
  const [intensity, setIntensity] = useState("moderate");

  const q = useQuery({
    queryKey: ["activity", id],
    queryFn: () => api<ActivityLog>(`/v1/activity-logs/${id}`),
  });

  const save = useMutation({
    mutationFn: () =>
      api(`/v1/activity-logs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          durationMinutes: Number(duration),
          caloriesBurned: Number(calories),
          intensity,
        }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["activity", id] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      setEditing(false);
    },
    onError: (e: Error) => setErr(e.message),
  });

  const remove = useMutation({
    mutationFn: () => api(`/v1/activity-logs/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/history");
    },
    onError: (e: Error) => setErr(e.message),
  });

  if (q.isLoading) return <p className="text-sm text-slate-500">Memuat...</p>;
  if (!q.data) return <ErrorBox message="Log tidak ditemukan." />;

  return (
    <div>
      <PageTitle title="Detail aktivitas" subtitle={q.data.log_date} />
      {err ? <ErrorBox message={err} /> : null}
      <Card className="space-y-3 text-sm">
        <p className="text-lg font-semibold">{q.data.name}</p>
        {!editing ? (
          <>
            <p>
              {q.data.duration_minutes} mnt · {q.data.calories_burned} kkal · {q.data.intensity}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setDuration(q.data!.duration_minutes);
                  setCalories(q.data!.calories_burned);
                  setIntensity(q.data!.intensity);
                  setEditing(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm("Hapus aktivitas ini?")) remove.mutate();
                }}
              >
                Hapus
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label>Durasi (menit)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
            <div>
              <Label>Kalori terbakar</Label>
              <Input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} />
            </div>
            <div>
              <Label>Intensitas</Label>
              <Select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
                <option value="low">Rendah</option>
                <option value="moderate">Sedang</option>
                <option value="high">Tinggi</option>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => save.mutate()}>Simpan</Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Batal
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
