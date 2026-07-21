"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, track } from "@/lib/api-client";
import {
  Badge,
  Card,
  EmptyState,
  HelperText,
  PageTitle,
  SectionTitle,
  Skeleton,
  Stat,
} from "@/components/ui";
import { InfoTip, TipLabel } from "@/components/info-tip";

type Weekly = {
  week_start: string;
  week_end: string;
  active_days: number;
  avg_consumed_calories: number;
  total_activity_calories: number;
  macros: { protein_g: number; carbs_g: number; fat_g: number };
  message: string;
  daily: Array<{
    date: string;
    consumed_calories: number;
    burned_calories: number;
    target: number;
    active: boolean;
  }>;
};

type Macros = {
  calorie_target: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  split?: { protein_pct?: number | null; carbs_pct?: number | null; fat_pct?: number | null; custom?: boolean };
};

export default function InsightsPage() {
  const weekly = useQuery({
    queryKey: ["weekly"],
    queryFn: () => api<Weekly>("/v1/insights/weekly"),
  });
  const macros = useQuery({
    queryKey: ["macros"],
    queryFn: () => api<Macros>("/v1/macros/targets"),
  });

  useEffect(() => {
    void track("dashboard_viewed", { surface: "insights" });
  }, []);

  const maxBar = Math.max(
    1,
    ...(weekly.data?.daily.map((d) => Math.max(d.consumed_calories, d.target)) ?? [1]),
  );

  return (
    <div className="animate-fade-up space-y-5">
      <PageTitle
        title="Insight mingguan"
        subtitle="Ringkasan netral, tanpa menghakimi. Insight awal jika data masih terbatas."
      />

      {weekly.isLoading ? <Skeleton className="h-40" /> : null}

      {weekly.data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card>
              <Stat label="Hari tercatat" value={weekly.data.active_days} unit="/ 7" />
            </Card>
            <Card>
              <Stat
                label="Rata-rata konsumsi"
                value={weekly.data.avg_consumed_calories}
                unit="kkal"
              />
            </Card>
            <Card>
              <Stat
                label="Total aktivitas"
                value={weekly.data.total_activity_calories}
                unit="kkal"
              />
            </Card>
            <Card>
              <Stat label="Protein minggu" value={weekly.data.macros.protein_g} unit="g" />
            </Card>
            <Card>
              <Stat label="Karbo minggu" value={weekly.data.macros.carbs_g} unit="g" />
            </Card>
            <Card>
              <Stat label="Lemak minggu" value={weekly.data.macros.fat_g} unit="g" />
            </Card>
          </div>

          <Card>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <SectionTitle>
                {weekly.data.week_start} – {weekly.data.week_end}
              </SectionTitle>
              {weekly.data.active_days < 3 ? (
                <Badge variant="warning">Data masih terbatas</Badge>
              ) : (
                <Badge variant="success">Cukup data</Badge>
              )}
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{weekly.data.message}</p>

            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium">Konsumsi harian vs target</p>
              {weekly.data.daily.map((d) => (
                <div key={d.date} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2 text-xs">
                  <span className="text-[hsl(var(--muted-foreground))]">
                    {d.date.slice(5)}
                  </span>
                  <div className="relative h-3 rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[hsl(var(--primary)/0.25)]"
                      style={{ width: `${(d.target / maxBar) * 100}%` }}
                      title="Target"
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[hsl(var(--primary))]"
                      style={{ width: `${(d.consumed_calories / maxBar) * 100}%` }}
                      title="Konsumsi"
                    />
                  </div>
                  <span className="tabular-nums text-[hsl(var(--muted-foreground))]">
                    {d.consumed_calories}/{d.target}
                  </span>
                </div>
              ))}
              <HelperText>
                <span className="inline-flex items-center gap-1">
                  Batang gelap = konsumsi · area pudar = target hari itu.
                  <InfoTip tip="insights_bars" />
                </span>
              </HelperText>
            </div>
          </Card>
        </>
      ) : (
        !weekly.isLoading && (
          <EmptyState
            title="Belum ada data insight"
            description="Catat minimal beberapa hari agar pola mulai terlihat."
          />
        )
      )}

      {macros.data ? (
        <Card>
          <div className="flex items-center gap-1.5">
            <SectionTitle>Target makronutrien (estimasi)</SectionTitle>
            <InfoTip tip="macro_targets" />
          </div>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Berdasarkan target kalori {macros.data.calorie_target} kkal ·{" "}
            {macros.data.split?.custom ? "target kustom" : "berdasarkan berat & tujuan"}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Protein", g: macros.data.protein_g, color: "bg-purple-400", tip: "protein" as const },
              { label: "Karbohidrat", g: macros.data.carbs_g, color: "bg-orange-400", tip: "carbs" as const },
              { label: "Lemak", g: macros.data.fat_g, color: "bg-amber-400", tip: "fat" as const },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-[hsl(var(--border))] p-3">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  <TipLabel tip={m.tip}>{m.label}</TipLabel>
                </p>
                <p className="text-xl font-semibold tabular-nums">{m.g} g</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                  <div className={`h-full w-full ${m.color} opacity-80`} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <HelperText>Label teks menyertai warna — bukan satu-satunya indikator.</HelperText>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
