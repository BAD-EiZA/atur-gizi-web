"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Activity, Camera, Copy, Plus, Sparkles, Utensils } from "lucide-react";
import { api } from "@/lib/api-client";
import type { Dashboard } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  HelperText,
  Input,
  PageTitle,
  Progress,
  SectionTitle,
  Skeleton,
  Stat,
} from "@/components/ui";
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
      <PageTitle
        title="Hari ini"
        subtitle={d?.motivational_message ?? "Langkah kecil sudah cukup."}
        actions={
          <div className="flex flex-wrap gap-2">
            <Input
              type="date"
              value={date || d?.date || ""}
              onChange={(e) => setDate(e.target.value)}
              className="w-auto max-w-[11rem]"
              aria-label="Pilih tanggal"
            />
            <Button variant="secondary" onClick={() => setDate("")}>
              Hari ini
            </Button>
          </div>
        }
      />

      {q.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-12">
          <Skeleton className="h-48 lg:col-span-8" />
          <Skeleton className="h-48 lg:col-span-4" />
          <Skeleton className="h-32 lg:col-span-12" />
        </div>
      ) : null}

      {d ? (
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Primary summary */}
          <Card className="lg:col-span-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <Stat
                label="Sisa anggaran kalori (net)"
                value={formatKcal(d.remaining_calories)}
                unit="kkal"
                hint={`Target ${formatKcal(d.intake_target)} kkal · net = konsumsi − aktivitas`}
              />
              <Badge variant="secondary">{d.date}</Badge>
            </div>
            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>Progres menuju target</span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <Progress value={pct} label="Progres kalori harian" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[hsl(var(--border))] pt-4 text-center">
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Konsumsi</p>
                <p className="text-lg font-semibold tabular-nums">{formatKcal(d.consumed_calories)}</p>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Aktivitas</p>
                <p className="text-lg font-semibold tabular-nums text-[hsl(var(--activity))]">
                  {formatKcal(d.burned_calories)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Net</p>
                <p className="text-lg font-semibold tabular-nums">{formatKcal(d.net_calories)}</p>
              </div>
            </div>
            <HelperText>
              Angka adalah estimasi. Aktivitas menambah ruang kalori (mode net).
            </HelperText>
          </Card>

          {/* Side panel */}
          <Card className="lg:col-span-4">
            <SectionTitle>Ringkasan cepat</SectionTitle>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[hsl(var(--muted-foreground))]">Catatan makanan</dt>
                <dd className="font-medium tabular-nums">{d.food_log_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[hsl(var(--muted-foreground))]">Durasi aktivitas</dt>
                <dd className="font-medium tabular-nums">{d.activity_duration_minutes} mnt</dd>
              </div>
              {d.target ? (
                <div className="flex justify-between">
                  <dt className="text-[hsl(var(--muted-foreground))]">Target aktif</dt>
                  <dd className="font-medium tabular-nums">{d.target.calorie_target} kkal</dd>
                </div>
              ) : null}
            </dl>
            <Link
              href="/insights"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--primary))]"
            >
              <Sparkles size={16} aria-hidden />
              Lihat insight mingguan
            </Link>
          </Card>

          {/* Quick actions */}
          <div className="lg:col-span-12">
            <SectionTitle>Tambah cepat</SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { href: "/food/new", label: "Catat makanan", icon: Utensils },
                { href: "/food/scan", label: "Pindai AI", icon: Camera },
                { href: "/activities/new", label: "Aktivitas", icon: Activity },
                { href: "/barcode", label: "Barcode", icon: Plus },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="flex min-h-14 items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-3 text-sm font-medium shadow-sm transition hover:border-[hsl(var(--primary)/0.3)] hover:shadow-md"
                  >
                    <span className="rounded-lg bg-[hsl(var(--secondary))] p-2 text-[hsl(var(--secondary-foreground))]">
                      <Icon size={16} aria-hidden />
                    </span>
                    {a.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Timeline food */}
          <Card className="lg:col-span-6">
            <div className="mb-3 flex items-center justify-between">
              <SectionTitle>Makanan</SectionTitle>
              <Link href="/food/new" className="text-sm text-[hsl(var(--primary))]">
                + Tambah
              </Link>
            </div>
            {d.recent_food.length === 0 ? (
              <EmptyState
                title="Belum ada makanan tercatat"
                description="Mulai dari catat manual, pilih favorit, atau pindai foto."
                icon={<Utensils className="size-5" aria-hidden />}
                action={
                  <>
                    <Link href="/food/new">
                      <Button>
                        <Plus className="size-4" aria-hidden />
                        Catat makanan
                      </Button>
                    </Link>
                    <Link href="/food/scan">
                      <Button variant="secondary">Pindai foto</Button>
                    </Link>
                  </>
                }
              />
            ) : (
              <ul className="divide-y divide-[hsl(var(--border))]">
                {d.recent_food.map((f) => (
                  <li key={f.id}>
                    <Link
                      href={`/food/${f.id}`}
                      className="flex items-center justify-between py-3 text-sm transition hover:text-[hsl(var(--primary))]"
                    >
                      <div>
                        <p className="font-medium">{f.title}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{f.meal_type}</p>
                      </div>
                      <span className="tabular-nums text-[hsl(var(--muted-foreground))]">
                        {f.total_calories} kkal
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Timeline activity */}
          <Card className="lg:col-span-6">
            <div className="mb-3 flex items-center justify-between">
              <SectionTitle>Aktivitas</SectionTitle>
              <Link href="/activities/new" className="text-sm text-[hsl(var(--primary))]">
                + Tambah
              </Link>
            </div>
            {d.recent_activity.length === 0 ? (
              <EmptyState
                title="Belum ada aktivitas hari ini"
                description="Catat jalan, latihan, atau olahraga lain dengan estimasi kalori."
                icon={<Activity className="size-5" aria-hidden />}
                action={
                  <Link href="/activities/new">
                    <Button variant="secondary">Tambah aktivitas</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-[hsl(var(--border))]">
                {d.recent_activity.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/activities/${a.id}`}
                      className="flex items-center justify-between py-3 text-sm transition hover:text-[hsl(var(--primary))]"
                    >
                      <div>
                        <p className="font-medium">{a.name}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {a.duration_minutes} mnt
                        </p>
                      </div>
                      <span className="tabular-nums text-[hsl(var(--muted-foreground))]">
                        {a.calories_burned} kkal
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <p className="lg:col-span-12 text-xs text-[hsl(var(--muted-foreground))]">
            <Copy className="mr-1 inline size-3" aria-hidden />
            Tip: buka histori untuk mengedit atau menghapus catatan. Semua estimasi dapat dikoreksi.
          </p>
        </div>
      ) : null}
    </div>
  );
}
