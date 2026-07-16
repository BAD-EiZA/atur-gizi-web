"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Dashboard } from "@/lib/types";
import { Button, Card, EmptyState, Input, PageTitle } from "@/components/ui";
import { formatKcal } from "@/lib/utils";

export default function DashboardPage() {
  const [date, setDate] = useState("");
  const q = useQuery({
    queryKey: ["dashboard", date],
    queryFn: () => api<Dashboard>(`/v1/dashboard${date ? `?date=${date}` : ""}`),
  });

  const d = q.data;
  const pct = Math.min(100, Math.max(0, d?.progress_pct ?? 0));

  return (
    <div>
      <PageTitle title="Dashboard" subtitle={d?.motivational_message} />
      <div className="mb-4 flex items-center gap-2">
        <Input type="date" value={date || d?.date || ""} onChange={(e) => setDate(e.target.value)} className="max-w-xs" />
        <Button variant="secondary" onClick={() => setDate("")}>
          Hari ini
        </Button>
      </div>

      {q.isLoading ? <p className="text-sm text-slate-500">Memuat...</p> : null}

      {d ? (
        <div className="space-y-4">
          <Card>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-slate-500">Sisa anggaran (net)</p>
                <p className="text-3xl font-bold text-slate-900">{formatKcal(d.remaining_calories)} kkal</p>
              </div>
              <p className="text-sm text-slate-500">Target {formatKcal(d.intake_target)}</p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="text-slate-500">Konsumsi</p>
                <p className="font-semibold">{formatKcal(d.consumed_calories)}</p>
              </div>
              <div>
                <p className="text-slate-500">Aktivitas</p>
                <p className="font-semibold">{formatKcal(d.burned_calories)}</p>
              </div>
              <div>
                <p className="text-slate-500">Net</p>
                <p className="font-semibold">{formatKcal(d.net_calories)}</p>
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Link href="/food/new">
              <Button>Catat makanan</Button>
            </Link>
            <Link href="/food/scan">
              <Button variant="secondary">Scan foto</Button>
            </Link>
            <Link href="/activities/new">
              <Button variant="secondary">Aktivitas</Button>
            </Link>
          </div>

          <Card>
            <h2 className="mb-2 font-medium">Makanan terbaru</h2>
            {d.recent_food.length === 0 ? (
              <EmptyState title="Belum ada log makanan hari ini." />
            ) : (
              <ul className="space-y-2">
                {d.recent_food.map((f) => (
                  <li key={f.id} className="flex justify-between text-sm">
                    <a href={`/food/${f.id}`} className="hover:text-emerald-700">
                      {f.title}
                    </a>
                    <span className="text-slate-500">{f.total_calories} kkal</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-2 font-medium">Aktivitas terbaru</h2>
            {d.recent_activity.length === 0 ? (
              <EmptyState title="Belum ada aktivitas hari ini." />
            ) : (
              <ul className="space-y-2">
                {d.recent_activity.map((a) => (
                  <li key={a.id} className="flex justify-between text-sm">
                    <a href={`/activities/${a.id}`} className="hover:text-emerald-700">
                      {a.name} · {a.duration_minutes} mnt
                    </a>
                    <span className="text-slate-500">{a.calories_burned} kkal</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
}
