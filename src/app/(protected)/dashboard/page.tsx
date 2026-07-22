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
import { InfoTip, TipLabel } from "@/components/info-tip";
import { fmtMacro } from "@/lib/nutrition";
import { formatKcal } from "@/lib/utils";

type FavoriteFood = {
  id: string;
  name: string;
  calories: number;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
};

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
        subtitle={d?.motivational_message ?? "Pantau makanan dan aktivitasmu hari ini."}
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
            <Link href="/nutrition">
              <Button variant="outline">Target gizi</Button>
            </Link>
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
          message="Data belum dapat dimuat."
          action={<Button variant="outline" onClick={() => q.refetch()}>Muat ulang</Button>}
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
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                    Sisa kalori hari ini
                  </span>
                  <InfoTip
                    tip={d.budget_mode === "eat_back" ? "remaining_net" : "remaining_intake"}
                  />
                </div>
                <Stat
                  label=""
                  value={formatKcal(d.remaining_calories)}
                  unit="kkal"
                  hint={`Target harian ${formatKcal(d.intake_target)} kkal`}
                />
              </div>
              <Badge variant="secondary">{d.date}</Badge>
            </div>
            <div className="relative mt-6">
              <div className="mb-1.5 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span className="inline-flex items-center gap-1">
                  Progres menuju target harian
                  <InfoTip tip="progress" side="bottom" />
                </span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <Progress value={pct} label="Progres menuju target harian" className="h-3" />
            </div>
            <div className="relative mt-6 grid grid-cols-2 gap-3 border-t border-[hsl(var(--border))] pt-5 text-center sm:grid-cols-4">
              <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-[hsl(var(--border)/0.6)]">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  <TipLabel tip="consumed">Kalori masuk</TipLabel>
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">{formatKcal(d.consumed_calories)}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-[hsl(var(--border)/0.6)]">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  <TipLabel tip="burned">Kalori aktivitas</TipLabel>
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-[hsl(var(--activity))]">
                  {formatKcal(d.burned_calories)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-[hsl(var(--border)/0.6)]">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  <TipLabel tip="remaining_intake">Sisa kalori</TipLabel>
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">
                  {formatKcal(d.remaining_intake ?? d.intake_target - d.consumed_calories)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-[hsl(var(--border)/0.6)]">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  <TipLabel tip="remaining_net">Sisa setelah aktivitas</TipLabel>
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">
                  {formatKcal(d.remaining_net ?? d.remaining_calories)}
                </p>
              </div>
            </div>
            <div className="relative mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-[hsl(var(--muted)/0.5)] px-2 py-2">
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  <TipLabel tip="protein">Protein</TipLabel>
                </p>
                <p className="text-sm font-semibold tabular-nums">
                  {fmtMacro(d.consumed_protein_g ?? 0)}
                  {d.protein_target_g != null ? ` / ${fmtMacro(d.protein_target_g)}` : ""} g
                </p>
              </div>
              <div className="rounded-xl bg-[hsl(var(--muted)/0.5)] px-2 py-2">
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  <TipLabel tip="carbs">Karbohidrat</TipLabel>
                </p>
                <p className="text-sm font-semibold tabular-nums">
                  {fmtMacro(d.consumed_carbs_g ?? 0)}
                  {d.carbs_target_g != null ? ` / ${fmtMacro(d.carbs_target_g)}` : ""} g
                </p>
              </div>
              <div className="rounded-xl bg-[hsl(var(--muted)/0.5)] px-2 py-2">
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  <TipLabel tip="fat">Lemak</TipLabel>
                </p>
                <p className="text-sm font-semibold tabular-nums">
                  {fmtMacro(d.consumed_fat_g ?? 0)}
                  {d.fat_target_g != null ? ` / ${fmtMacro(d.fat_target_g)}` : ""} g
                </p>
              </div>
            </div>
            <HelperText>
              {d.budget_mode === "eat_back"
                ? "Sisa kalori dihitung dengan memasukkan aktivitas."
                : "Sisa kalori dihitung dari target dikurangi kalori makanan. Aktivitas tidak menambah sisa kalori."}{" "}
              <InfoTip tip="budget_mode" />{" "}
              <Link href="/settings" className="font-medium text-[hsl(var(--primary))]">
                Ubah cara perhitungan
              </Link>
            </HelperText>
          </Card>

          {/* Side panel */}
          <Card className="lg:col-span-4" interactive>
            <SectionTitle>Ringkasan hari ini</SectionTitle>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[hsl(var(--muted-foreground))]">Makanan tercatat</dt>
                <dd className="font-medium tabular-nums">{d.food_log_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[hsl(var(--muted-foreground))]">Waktu aktif</dt>
                <dd className="font-medium tabular-nums">{d.activity_duration_minutes} mnt</dd>
              </div>
              {d.target ? (
                <div className="flex justify-between">
                  <dt className="text-[hsl(var(--muted-foreground))]">Target kalori</dt>
                  <dd className="font-medium tabular-nums">
                    {formatKcal(d.target.calorie_target)} kkal
                  </dd>
                </div>
              ) : null}
            </dl>
            <Link
              href="/insights"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--primary))]"
            >
              <Sparkles size={16} aria-hidden />
              Lihat ringkasan mingguan
            </Link>
          </Card>

          {/* Quick actions */}
          <div className="lg:col-span-12">
            <SectionTitle>Tambah cepat</SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { href: "/food/new", label: "Catat makanan", icon: Utensils },
                { href: "/food/scan", label: "Pindai makanan", icon: Camera },
                { href: "/activities/new", label: "Catat aktivitas", icon: Activity },
                { href: "/insights", label: "Lihat ringkasan", icon: Sparkles },
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
                {favorites.data!.data.slice(0, 6).map((food) => {
                  const params = new URLSearchParams({
                    name: food.name,
                    calories: String(food.calories),
                  });
                  if (food.protein_g != null) params.set("protein", String(food.protein_g));
                  if (food.carbs_g != null) params.set("carbs", String(food.carbs_g));
                  if (food.fat_g != null) params.set("fat", String(food.fat_g));
                  return (
                    <Link
                      key={food.id}
                      href={`/food/new?${params.toString()}`}
                      className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-sm font-medium transition hover:border-[hsl(var(--primary)/0.4)]"
                    >
                      {food.name} · {food.calories} kkal
                    </Link>
                  );
                })}
              </div>
            </Card>
          ) : null}

          {/* Timeline food */}
          <Card className="lg:col-span-6">
            <div className="mb-3 flex items-center justify-between">
              <SectionTitle>Makanan hari ini</SectionTitle>
              <Link href="/food/new" className="text-sm text-[hsl(var(--primary))]">
                + Tambah
              </Link>
            </div>
            {d.recent_food.length === 0 ? (
              <EmptyState
                title="Belum ada makanan yang dicatat hari ini."
                description="Catat manual, pilih favorit, atau pindai foto."
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
                      <Button variant="secondary">Pindai makanan</Button>
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
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {f.meal_type}
                          {f.protein_g != null || f.carbs_g != null || f.fat_g != null
                            ? ` · P ${fmtMacro(Number(f.protein_g) || 0)} g · K ${fmtMacro(Number(f.carbs_g) || 0)} g · L ${fmtMacro(Number(f.fat_g) || 0)} g`
                            : ""}
                        </p>
                      </div>
                      <span className="tabular-nums text-[hsl(var(--muted-foreground))]">
                        {formatKcal(f.total_calories)} kkal
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
              <SectionTitle>Aktivitas hari ini</SectionTitle>
              <Link href="/activities/new" className="text-sm text-[hsl(var(--primary))]">
                + Tambah
              </Link>
            </div>
            {d.recent_activity.length === 0 ? (
              <EmptyState
                title="Belum ada aktivitas yang dicatat hari ini."
                description="Catat jalan, latihan, atau olahraga lain dengan perkiraan kalori."
                icon={<Activity className="size-5" aria-hidden />}
                action={
                  <Link href="/activities/new">
                    <Button variant="secondary">Catat aktivitas</Button>
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
            Buka Riwayat untuk melihat, mengubah, atau menghapus catatan. Semua angka dapat dikoreksi.
          </p>
        </div>
      ) : null}
    </div>
  );
}
