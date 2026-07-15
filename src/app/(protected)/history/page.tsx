"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, EmptyState, PageTitle } from "@/components/ui";

type Item =
  | { kind: "food"; id: string; log_date: string; title: string; calories: number; meal_type: string }
  | { kind: "activity"; id: string; log_date: string; title: string; calories: number; duration_minutes: number };

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function HistoryPage() {
  const from = useMemo(() => daysAgo(14), []);
  const to = useMemo(() => daysAgo(0), []);
  const q = useQuery({
    queryKey: ["history", from, to],
    queryFn: () => api<{ data: Item[] }>(`/v1/history?from=${from}&to=${to}`),
  });

  return (
    <div>
      <PageTitle title="Histori" subtitle={`14 hari terakhir (${from} – ${to})`} />
      <Card>
        {q.isLoading ? <p className="text-sm text-slate-500">Memuat...</p> : null}
        {!q.isLoading && (q.data?.data.length ?? 0) === 0 ? (
          <EmptyState title="Belum ada log pada rentang ini." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {(q.data?.data ?? []).map((item) => (
              <li key={`${item.kind}-${item.id}`} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {item.log_date} · {item.kind === "food" ? item.meal_type : `${item.duration_minutes} mnt`}
                  </p>
                </div>
                <span className="text-slate-600">{item.calories} kkal</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
