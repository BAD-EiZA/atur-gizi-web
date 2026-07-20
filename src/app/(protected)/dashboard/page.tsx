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
  ErrorBox,
  HelperText,
  Input,
  PageTitle,
  Progress,
  SectionTitle,
  Skeleton,
  Stat,
} from "@/components/ui";
import { formatKcal } from "@/lib/utils";

type FavoriteFood = { id: string; name: string; calories: number };

export default function DashboardPage() {
  const [date, setDate] = useState("");
  const q = useQuery({
    queryKey: ["dashboard", date],
    queryFn: () => api<Dashboard>(`/v1/dashboard${date ? `?date=${date}` : ""}`),
  });
  const favorites = useQuery({
    queryKey: ["favorites-foods"],
    queryFn: () => api<{ data: FavoriteFood[] }>("/v1/favorites/foods"),
  });

  const d = q.data;
  const pct = Math.min(100, Math.max(0, d?.progress_pct ?? 0));

  return (
    <div className="animate-fade-up">
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

      {q.isError ? (
        <ErrorBox
          message="Gagal memuat ringkasan hari ini."
          action={<Button variant="outline" onClick={() => q.refetch()}>Coba lagi</Button>}
        />
      ) : null}

      {d ? (
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Primary summary */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-white to-white lg:col-span-8">
            <div
              className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[hsl(var(--primary)/0.08)] blur-2xl"
              aria-hidden
            />
            <div className="relative flex flex-wrap items-start justify-between gap-3">
              <Stat
                label="Sisa anggaran kalori (net)"
                value={formatKcal(d.remaining_calories)}
                unit="kkal"
                hint={`Target ${formatKcal(d.intake_target)} kkal · net = konsumsi − aktivitas`}
              />
              <Badge variant="secondary">{d.date}</Badge>
            </div>
            <div className="relative mt-6">
              <div className="mb-1.5 flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>Progres menuju target</span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <Progress value={pct} label="Progres kalori harian" className="h-3" />
            </div>
            <div className="relative mt-6 grid grid-cols-3 gap-3 border-t border-[hsl(var(--border))] pt-5 text-center">
              <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-[hsl(var(--border)/0.6)]">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Konsumsi</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">{formatKcal(d.consumed_calories)}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-[hsl(var(--border)/0.6)]">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Aktivitas</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-[hsl(var(--activity))]">
                  {formatKcal(d.burned_calories)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-[hsl(var(--border)/0.6)]">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Net</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">{formatKcal(d.net_calories)}</p>
              </div>
            </div>
            <HelperText>
              Angka adalah estimasi. Aktivitas menambah ruang kalori (mode net).
            </HelperText>
          </Card>

          {/* Side panel */}
          <Card className="lg:col-span-4" interactive>
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
                { href: "/food/scan", label: "Pindai makanan", icon: Camera },
                { href: "/activities/new", label: "Aktivitas", icon: Activity },
                { href: "/insights", label: "Review minggu", icon: Sparkles },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="group flex min-h-16 items-center gap-3 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 text-sm font-medium shadow-[var(--shadow-sm)] transition duration-500 hover:border-[hsl(var(--primary)/0.3)] hover:shadow-[var(--shadow-md)]"
                  >
                    <span className="rounded-xl bg-[hsl(var(--secondary))] p-2.5 text-[hsl(var(--secondary-foreground))] transition group-hover:scale-105">
                      <Icon size={16} aria-hidden />
                    </span>
                    {a.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {(favorites.data?.data.length ?? 0) > 0 ? (
            <Card className="lg:col-span-12">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <SectionTitle>Catat ulang cepat</SectionTitle>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                    Pilih favorit, lalu tinjau porsi sebelum menyimpan.
                  </p>
                </div>
                <Link href="/food/new" className="text-sm font-medium text-[hsl(var(--primary))]">Kelola favorit</Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {favorites.data!.data.slice(0, 6).map((food) => (
                  <Link
                    key={food.id}
                    href={`/food/new?name=${encodeURIComponent(food.name)}&calories=${food.calories}`}
                    className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-sm font-medium transition hover:border-[hsl(var(--primary)/0.4)]"
                  >
                    {food.name} · {food.calories} kkal
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}

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
