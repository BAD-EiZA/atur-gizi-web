"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api-client";
import type { ActivityLog } from "@/lib/types";
import { Button, Card, ErrorBox, Input, Label, PageTitle, Select } from "@/components/ui";
import { InfoTip, TipLabel } from "@/components/info-tip";

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [duration, setDuration] = useState(30);
  const [calories, setCalories] = useState(0);
  const [intensity, setIntensity] = useState("moderate");
  const [distanceKm, setDistanceKm] = useState("");
  const [rpe, setRpe] = useState("");
  const [avgHr, setAvgHr] = useState("");
  const [notes, setNotes] = useState("");

  const q = useQuery({
    queryKey: ["activity", id],
    queryFn: () => api<ActivityLog>(`/v1/activity-logs/${id}`),
  });

  const startEdit = () => {
    if (!q.data) return;
    setDuration(q.data.duration_minutes);
    setCalories(q.data.calories_burned);
    setIntensity(q.data.intensity);
    setDistanceKm(
      q.data.distance_m != null ? String(Math.round((q.data.distance_m / 1000) * 100) / 100) : "",
    );
    setRpe(q.data.rpe != null ? String(q.data.rpe) : "");
    setAvgHr(q.data.avg_hr != null ? String(q.data.avg_hr) : "");
    setNotes(q.data.notes ?? "");
    setEditing(true);
  };

  const save = useMutation({
    mutationFn: () =>
      api(`/v1/activity-logs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          durationMinutes: Number(duration),
          caloriesBurned: Number(calories),
          intensity,
          distanceM: distanceKm ? Number(distanceKm) * 1000 : undefined,
          rpe: rpe ? Number(rpe) : undefined,
          avgHr: avgHr ? Number(avgHr) : undefined,
          notes: notes || undefined,
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

  const fav = useMutation({
    mutationFn: () =>
      api("/v1/favorites/activities", {
        method: "POST",
        body: JSON.stringify({
          activityTypeId: q.data?.activity_type?.id,
          customName: q.data?.activity_type ? undefined : q.data?.name,
          defaultMinutes: q.data?.duration_minutes ?? 30,
        }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["favorites-activities"] });
    },
  });

  if (q.isLoading) return <p className="text-sm text-slate-500">Memuat...</p>;
  if (!q.data) return <ErrorBox message="Log tidak ditemukan." />;

  const d = q.data;

  return (
    <div>
      <PageTitle title="Detail aktivitas" subtitle={d.log_date} />
      {err ? <ErrorBox message={err} /> : null}
      <Card className="space-y-3 text-sm">
        <p className="text-lg font-semibold">{d.name}</p>
        {!editing ? (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-[hsl(var(--border))] px-3 py-2">
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Durasi</p>
                <p className="font-semibold tabular-nums">{d.duration_minutes} mnt</p>
              </div>
              <div className="rounded-xl border border-[hsl(var(--border))] px-3 py-2">
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  <TipLabel tip="burned">Terbakar</TipLabel>
                </p>
                <p className="font-semibold tabular-nums">{d.calories_burned} kkal</p>
              </div>
              <div className="rounded-xl border border-[hsl(var(--border))] px-3 py-2">
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  <TipLabel tip="intensity">Intensitas</TipLabel>
                </p>
                <p className="font-semibold">{d.intensity}</p>
              </div>
              <div className="rounded-xl border border-[hsl(var(--border))] px-3 py-2">
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  <TipLabel tip="device_source">Sumber</TipLabel>
                </p>
                <p className="font-semibold">{d.source ?? "estimate"}</p>
              </div>
            </div>
            <ul className="space-y-1 text-xs text-[hsl(var(--muted-foreground))]">
              {d.met_value != null ? (
                <li className="inline-flex flex-wrap items-center gap-1">
                  <span>
                    MET {d.met_value}
                    {d.met_source ? ` · ${d.met_source}` : ""}
                    {d.formula_version ? ` · ${d.formula_version}` : ""}
                  </span>
                  <InfoTip tip="met" />
                  {d.formula_version ? <InfoTip tip="formula_version" /> : null}
                </li>
              ) : null}
              {d.weight_snapshot_kg != null ? <li>Berat snapshot {d.weight_snapshot_kg} kg</li> : null}
              {d.calculated_calories != null ? (
                <li>
                  Dihitung {d.calculated_calories} kkal
                  {d.device_calories != null ? ` · perangkat ${d.device_calories} kkal` : ""}
                </li>
              ) : null}
              {d.distance_m != null ? (
                <li className="inline-flex items-center gap-1">
                  <span>
                    Jarak {(d.distance_m / 1000).toFixed(2)} km
                    {d.speed_kmh != null ? ` · ~${d.speed_kmh} km/jam` : ""}
                  </span>
                  <InfoTip tip="distance" />
                </li>
              ) : null}
              {d.avg_hr != null ? (
                <li className="inline-flex items-center gap-1">
                  HR rata-rata {d.avg_hr} bpm <InfoTip tip="avg_hr" />
                </li>
              ) : null}
              {d.rpe != null ? (
                <li className="inline-flex items-center gap-1">
                  RPE {d.rpe}/10 <InfoTip tip="rpe" />
                </li>
              ) : null}
              {d.sets != null || d.reps != null ? (
                <li>
                  Strength: {d.sets ?? "—"} set × {d.reps ?? "—"} rep
                  {d.load_kg != null ? ` · ${d.load_kg} kg` : ""}
                </li>
              ) : null}
              {d.notes ? <li>Catatan: {d.notes}</li> : null}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button onClick={startEdit}>Edit</Button>
              <Button variant="secondary" onClick={() => fav.mutate()} loading={fav.isPending}>
                Simpan favorit
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
              <Label>Kalori terbakar (final)</Label>
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Jarak (km)</Label>
                <Input type="number" step="0.1" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} />
              </div>
              <div>
                <Label>HR rata-rata</Label>
                <Input type="number" value={avgHr} onChange={(e) => setAvgHr(e.target.value)} />
              </div>
              <div>
                <Label>RPE</Label>
                <Input type="number" min={1} max={10} value={rpe} onChange={(e) => setRpe(e.target.value)} />
              </div>
              <div>
                <Label>Catatan</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => save.mutate()} loading={save.isPending}>
                Simpan
              </Button>
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
