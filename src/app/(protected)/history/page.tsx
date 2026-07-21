"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { History as HistoryIcon } from "lucide-react";
import { api } from "@/lib/api-client";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBox,
  Input,
  PageTitle,
  Select,
  Skeleton,
} from "@/components/ui";

type Item =
  | {
      kind: "food";
      id: string;
      log_date: string;
      title: string;
      calories: number;
      meal_type: string;
      protein_g?: number | null;
      carbs_g?: number | null;
      fat_g?: number | null;
    }
  | {
      kind: "activity";
      id: string;
      log_date: string;
      title: string;
      calories: number;
      duration_minutes: number;
    };

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function HistoryPage() {
  const [range, setRange] = useState("14");
  const [filter, setFilter] = useState<"all" | "food" | "activity">("all");
  const [q, setQ] = useState("");

  const from = useMemo(() => daysAgo(Number(range)), [range]);
  const to = useMemo(() => daysAgo(0), []);

  const list = useQuery({
    queryKey: ["history", from, to],
    queryFn: () => api<{ data: Item[] }>(`/v1/history?from=${from}&to=${to}`),
  });

  const filtered = (list.data?.data ?? []).filter((item) => {
    if (filter !== "all" && item.kind !== filter) return false;
    if (q && !item.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const byDay = filtered.reduce<Record<string, Item[]>>((acc, item) => {
    (acc[item.log_date] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="animate-fade-up">
      <PageTitle
        title="Riwayat"
        subtitle="Lihat, cari, dan kelola catatan makanan serta aktivitasmu."
        actions={
          <Link href="/export">
            <Button variant="outline">Ekspor data</Button>
          </Link>
        }
      />

      <Card className="mb-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Rentang waktu
          </label>
          <Select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7">7 hari terakhir</option>
            <option value="14">14 hari terakhir</option>
            <option value="30">30 hari terakhir</option>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Jenis catatan
          </label>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "food" | "activity")}
          >
            <option value="all">Semua catatan</option>
            <option value="food">Makanan</option>
            <option value="activity">Aktivitas</option>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Cari catatan
          </label>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama makanan atau aktivitas..."
            aria-label="Cari catatan"
          />
        </div>
      </Card>

      {list.isLoading ? <Skeleton className="h-40" /> : null}

      {list.isError ? (
        <ErrorBox
          message="Data belum dapat dimuat."
          action={<Button variant="outline" onClick={() => list.refetch()}>Muat ulang</Button>}
        />
      ) : null}

      {!list.isLoading && !list.isError && filtered.length === 0 ? (
        <EmptyState
          title="Belum ada catatan dalam rentang waktu ini."
          description="Pilih catatan untuk melihat, mengubah, atau menghapus detail."
          icon={<HistoryIcon className="size-5" aria-hidden />}
          action={
            <>
              <Link href="/food/new">
                <Button>Catat makanan</Button>
              </Link>
              <Link href="/activities/new">
                <Button variant="secondary">Catat aktivitas</Button>
              </Link>
            </>
          }
        />
      ) : !list.isLoading && !list.isError ? (
        <div className="space-y-4">
          {Object.entries(byDay)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([day, items]) => (
              <Card key={day}>
                <h2 className="mb-2 text-sm font-semibold text-[hsl(var(--foreground))]">
                  {new Date(day + "T00:00:00").toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <ul className="divide-y divide-[hsl(var(--border))]">
                  {items.map((item) => (
                    <li key={`${item.kind}-${item.id}`}>
                      <Link
                        href={item.kind === "food" ? `/food/${item.id}` : `/activities/${item.id}`}
                        className="flex items-center justify-between py-3 text-sm hover:text-[hsl(var(--primary))]"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant={item.kind === "food" ? "secondary" : "outline"}>
                            {item.kind === "food" ? "Makanan" : "Aktivitas"}
                          </Badge>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              {item.kind === "food"
                                ? `${item.meal_type}${
                                    item.protein_g != null || item.carbs_g != null || item.fat_g != null
                                      ? ` · P ${Number(item.protein_g) || 0} · K ${Number(item.carbs_g) || 0} · L ${Number(item.fat_g) || 0}`
                                      : ""
                                  }`
                                : `${item.duration_minutes} mnt`}
                            </p>
                          </div>
                        </div>
                        <span className="tabular-nums text-[hsl(var(--muted-foreground))]">
                          {item.calories} kkal
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
        </div>
      ) : null}
    </div>
  );
}
