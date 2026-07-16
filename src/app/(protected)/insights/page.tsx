"use client";

import { useQuery } from "@tanstack/react-query";
import { api, track } from "@/lib/api-client";
import { Card, EmptyState, PageTitle } from "@/components/ui";
import { useEffect } from "react";

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

  return (
    <div className="space-y-4">
      <PageTitle title="Insight mingguan" subtitle="Ringkasan netral, tanpa menghakimi." />
      {weekly.isLoading ? <p className="text-sm text-slate-500">Memuat...</p> : null}
      {weekly.data ? (
        <Card className="space-y-2 text-sm">
          <p className="font-medium">
            {weekly.data.week_start} – {weekly.data.week_end}
          </p>
          <p>{weekly.data.message}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-slate-500">Hari aktif</p>
              <p className="font-semibold">{weekly.data.active_days}</p>
            </div>
            <div>
              <p className="text-slate-500">Rata konsumsi</p>
              <p className="font-semibold">{weekly.data.avg_consumed_calories}</p>
            </div>
            <div>
              <p className="text-slate-500">Aktivitas</p>
              <p className="font-semibold">{weekly.data.total_activity_calories}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Makro minggu: P {weekly.data.macros.protein_g}g · C {weekly.data.macros.carbs_g}g · L{" "}
            {weekly.data.macros.fat_g}g
          </p>
          <ul className="divide-y text-xs">
            {weekly.data.daily.map((d) => (
              <li key={d.date} className="flex justify-between py-1">
                <span>{d.date}</span>
                <span>
                  {d.consumed_calories}/{d.target} · act {d.burned_calories}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        !weekly.isLoading && <EmptyState title="Belum ada data insight." />
      )}
      {macros.data ? (
        <Card className="text-sm">
          <h2 className="mb-2 font-medium">Target makronutrien (estimasi)</h2>
          <p>Kalori: {macros.data.calorie_target} kkal</p>
          <p>
            Protein {macros.data.protein_g}g · Karbo {macros.data.carbs_g}g · Lemak {macros.data.fat_g}g
          </p>
          <p className="mt-1 text-xs text-slate-400">Split 30/40/30 — dapat disesuaikan nanti.</p>
        </Card>
      ) : null}
    </div>
  );
}
