"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { InfoTip, LabelWithTip } from "@/components/info-tip";
import { cn } from "@/lib/utils";

type Estimate = {
  calculated_calories: number;
  met_value: number;
  met_source?: string;
  weight_kg: number;
  speed_kmh?: number | null;
  formula_version?: string;
};

type FavAct = {
  id: string;
  activity_type_id?: string | null;
  custom_name?: string | null;
  default_minutes?: number;
  name?: string;
};

export default function NewActivityPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [duration, setDuration] = useState(30);
  const [selected, setSelected] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<"low" | "moderate" | "high">("moderate");
  const [customName, setCustomName] = useState("");
  const [metOverride, setMetOverride] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [distanceKm, setDistanceKm] = useState<string>("");
  const [rpe, setRpe] = useState<string>("");
  const [avgHr, setAvgHr] = useState<string>("");
  const [sets, setSets] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [loadKg, setLoadKg] = useState<string>("");
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualKcal, setManualKcal] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [category, setCategory] = useState<string>("all");

  const types = useQuery({
    queryKey: ["activity-types"],
    queryFn: () => api<{ data: ActivityType[] }>("/v1/activity-types"),
  });

  const favs = useQuery({
    queryKey: ["favorites-activities"],
    queryFn: () => api<{ data: FavAct[] }>("/v1/favorites/activities"),
  });

  const filtered = useMemo(() => {
    const all = types.data?.data ?? [];
    if (category === "all") return all;
    return all.filter((t) => t.category === category);
  }, [types.data, category]);

  const categories = useMemo(() => {
    const set = new Set((types.data?.data ?? []).map((t) => t.category));
    return ["all", ...Array.from(set)];
  }, [types.data]);

  const selectedType = (types.data?.data ?? []).find((t) => t.id === selected);
  const isStrength = selectedType?.category === "strength";

  const buildBody = () => {
    const distanceM = distanceKm ? Number(distanceKm) * 1000 : undefined;
    return {
      activityTypeId: selected || undefined,
      customName: !selected && customName ? customName : undefined,
      durationMinutes: Number(duration),
      intensity,
      metValue: metOverride ? Number(metOverride) : undefined,
      distanceM: distanceM && distanceM > 0 ? distanceM : undefined,
      rpe: rpe ? Number(rpe) : undefined,
      avgHr: avgHr ? Number(avgHr) : undefined,
      sets: sets ? Number(sets) : undefined,
      reps: reps ? Number(reps) : undefined,
      loadKg: loadKg ? Number(loadKg) : undefined,
      notes: notes || undefined,
      logDate: logDate || undefined,
    };
  };

  const estimateMut = useMutation({
    mutationFn: () =>
      api<Estimate>("/v1/activity-estimates", {
        method: "POST",
        body: JSON.stringify(buildBody()),
      }),
    onSuccess: (d) => {
      setEstimate(d);
      setManualKcal("");
      setErr(null);
    },
    onError: (e: Error) => setErr(e.message),
  });

  useEffect(() => {
    if (!selected && !customName && !metOverride) {
      setEstimate(null);
      return;
    }
    if (!selected && !metOverride && !customName) return;
    if (!(Number(duration) > 0)) return;
    const t = setTimeout(() => estimateMut.mutate(), 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, duration, intensity, metOverride, distanceKm, avgHr, customName]);

  const createMut = useMutation({
    mutationFn: () => {
      const body = {
        ...buildBody(),
        caloriesBurned: manualKcal
          ? Number(manualKcal)
          : estimate?.calculated_calories,
      };
      return api("/v1/activity-logs", {
        method: "POST",
        idempotent: true,
        body: JSON.stringify(body),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Aktivitas berhasil disimpan.");
      router.push("/dashboard");
    },
    onError: (e: Error) => setErr(e.message),
  });

  const canSave = Boolean(selected || customName.trim()) && Number(duration) > 0;

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <PageTitle
        title="Catat aktivitas"
        subtitle="Pilih aktivitas dan durasinya untuk menghitung perkiraan kalori yang terbakar."
        actions={
          <Link
            href="/activities/import-screenshot"
            className="text-sm font-medium text-[hsl(var(--primary))]"
          >
            Impor dari screenshot
          </Link>
        }
      />
      <Card className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <LabelWithTip tip="Durasi sesi dalam menit. Dipakai rumus MET × berat × waktu." htmlFor="duration">
              Durasi (menit)
            </LabelWithTip>
            <Input
              id="duration"
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
          <div>
            <LabelWithTip tip="Tanggal log aktivitas (zona waktu akun)." htmlFor="logDate">
              Tanggal
            </LabelWithTip>
            <Input
              id="logDate"
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <LabelWithTip tip="intensity">Intensitas</LabelWithTip>
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

        {(favs.data?.data?.length ?? 0) > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium">Favorit</p>
            <div className="flex flex-wrap gap-2">
              {favs.data!.data.slice(0, 8).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-medium"
                  onClick={() => {
                    if (f.activity_type_id) setSelected(f.activity_type_id);
                    if (f.default_minutes) setDuration(f.default_minutes);
                    if (f.custom_name) setCustomName(f.custom_name);
                  }}
                >
                  {f.name || f.custom_name || "Favorit"}
                  {f.default_minutes ? ` · ${f.default_minutes} mnt` : ""}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1 text-sm font-medium">
              Pilih aktivitas
              <InfoTip tip="met" />
            </p>
            <div className="flex flex-wrap gap-1">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium",
                    category === c
                      ? "bg-[hsl(var(--primary))] text-white"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
                  )}
                >
                  {c === "all"
                    ? "Semua"
                    : c === "cardio"
                      ? "Kardio"
                      : c === "flexibility"
                        ? "Fleksibilitas"
                        : c === "strength"
                          ? "Kekuatan"
                          : c === "sport"
                            ? "Olahraga"
                            : c === "other"
                              ? "Lainnya"
                              : c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelected(t.id);
                  setCustomName("");
                }}
                className={cn(
                  "rounded-xl border p-3 text-left text-sm transition",
                  selected === t.id
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] shadow-sm"
                    : "border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--primary)/0.3)]",
                )}
              >
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  {t.category} · MET {t.default_met}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="custom">Aktivitas lain</Label>
          <Input
            id="custom"
            value={customName}
            onChange={(e) => {
              setCustomName(e.target.value);
              if (e.target.value) setSelected(null);
            }}
            placeholder="Contoh: Badminton bersama rekan kantor"
          />
          <HelperText>Jika menggunakan nama sendiri, masukkan nilai MET secara manual.</HelperText>
        </div>

        <details className="rounded-xl border border-[hsl(var(--border))] p-3">
          <summary className="cursor-pointer text-sm font-medium">Tambahkan detail</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <LabelWithTip tip="distance" className="text-xs">
                Jarak (km)
              </LabelWithTip>
              <Input
                type="number"
                step="0.1"
                min={0}
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="Untuk pace → MET"
              />
            </div>
            <div>
              <LabelWithTip tip="avg_hr" className="text-xs">
                Denyut rata-rata (bpm)
              </LabelWithTip>
              <Input
                type="number"
                min={60}
                max={220}
                value={avgHr}
                onChange={(e) => setAvgHr(e.target.value)}
              />
            </div>
            <div>
              <LabelWithTip tip="rpe" className="text-xs">
                RPE (1–10)
              </LabelWithTip>
              <Input type="number" min={1} max={10} value={rpe} onChange={(e) => setRpe(e.target.value)} />
            </div>
            <div>
              <LabelWithTip tip="met" className="text-xs">
                MET override
              </LabelWithTip>
              <Input
                type="number"
                step="0.1"
                min={0.5}
                value={metOverride}
                onChange={(e) => setMetOverride(e.target.value)}
                placeholder="Kosongkan = otomatis"
              />
            </div>
            {isStrength || sets || reps ? (
              <>
                <div>
                  <Label className="text-xs">Sets</Label>
                  <Input type="number" min={0} value={sets} onChange={(e) => setSets(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Reps</Label>
                  <Input type="number" min={0} value={reps} onChange={(e) => setReps(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Beban (kg)</Label>
                  <Input type="number" min={0} step="0.5" value={loadKg} onChange={(e) => setLoadKg(e.target.value)} />
                </div>
              </>
            ) : null}
            <div className="sm:col-span-2">
              <Label className="text-xs">Catatan</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opsional" />
            </div>
          </div>
        </details>

        {estimate ? (
          <div className="rounded-xl bg-[hsl(var(--secondary))] p-3 text-sm text-[hsl(var(--secondary-foreground))]">
            <p className="font-semibold">
              Estimasi pembakaran:{" "}
              <span className="tabular-nums">{estimate.calculated_calories} kkal</span>
            </p>
            <p className="mt-1 inline-flex flex-wrap items-center gap-1 text-xs opacity-90">
              <span>
                MET {estimate.met_value}
                {estimate.met_source ? ` (${estimate.met_source})` : ""} · berat ~
                {estimate.weight_kg} kg · {duration} mnt
                {estimate.speed_kmh != null ? ` · ~${estimate.speed_kmh} km/jam` : ""}
              </span>
              <InfoTip tip="met" />
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline">Estimasi</Badge>
              {estimate.formula_version ? (
                <Badge variant="outline">{estimate.formula_version}</Badge>
              ) : null}
            </div>
            <div className="mt-3">
              <Label className="text-xs">Override kalori final (opsional)</Label>
              <Input
                type="number"
                min={0}
                value={manualKcal}
                onChange={(e) => setManualKcal(e.target.value)}
                placeholder={String(estimate.calculated_calories)}
              />
            </div>
          </div>
        ) : null}

        {err ? <ErrorBox message={err} /> : null}
        {!canSave ? (
          <HelperText>Pilih aktivitas, atau isi nama aktivitas dan nilai MET.</HelperText>
        ) : null}

        <Button onClick={() => createMut.mutate()} loading={createMut.isPending} disabled={!canSave}>
          {createMut.isPending ? "Menyimpan..." : "Simpan aktivitas"}
        </Button>
      </Card>
    </div>
  );
}
