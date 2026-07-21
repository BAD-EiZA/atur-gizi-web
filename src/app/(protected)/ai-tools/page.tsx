"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, HelpCircle, Search, Sparkles, Utensils } from "lucide-react";
import { api } from "@/lib/api-client";
import {
  Badge,
  Button,
  Card,
  ErrorBox,
  HelperText,
  Input,
  Label,
  PageTitle,
  Progress,
  SectionTitle,
  Select,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { ResultShell } from "@/components/ai-tools/result-shell";
import { IdleHint, EmptyResult } from "@/components/ai-tools/empty-result";
import { ConfirmDialog } from "@/components/ai-tools/confirm-dialog";
import { AssumptionList, ConfidenceBadge, SourceBadge } from "@/components/ai-tools/badges";

type Tab =
  | "search"
  | "memory"
  | "compare"
  | "context"
  | "recover"
  | "habits"
  | "quality"
  | "target"
  | "simulate"
  | "brief"
  | "plate";

const categories: { title: string; items: { id: Tab; label: string }[] }[] = [
  {
    title: "Catat lebih cepat",
    items: [
      { id: "search", label: "Cari makanan cerdas" },
      { id: "recover", label: "Pulihkan log" },
      { id: "plate", label: "Cek item terlewat" },
      { id: "memory", label: "Memori & alias" },
    ],
  },
  {
    title: "Pahami pilihan",
    items: [
      { id: "compare", label: "Bandingkan makanan" },
      { id: "target", label: "Penjelasan target" },
      { id: "simulate", label: "Simulasi target" },
    ],
  },
  {
    title: "Lihat pola",
    items: [
      { id: "context", label: "Saran pencatatan" },
      { id: "habits", label: "Pola kebiasaan" },
      { id: "quality", label: "Periksa data" },
      { id: "brief", label: "Rencana minggu" },
    ],
  },
];

const tabMeta: Record<Tab, { title: string; desc: string }> = {
  search: {
    title: "Cari makanan cerdas",
    desc: "Cari dari katalog dan memori. Hasil draft — belum disimpan.",
  },
  memory: {
    title: "Memori makanan & alias",
    desc: "Simpan sebutan lokal (naspad, kopi pagi) agar pencatatan lebih cepat.",
  },
  compare: {
    title: "Bandingkan makanan",
    desc: "Bandingkan estimasi kalori dan makro. Bukan label baik/buruk.",
  },
  plate: {
    title: "Cek item yang terlewat",
    desc: "Bukan saran menambah makanan — hanya verifikasi komponen yang mungkin lupa dicatat.",
  },
  context: {
    title: "Saran pencatatan",
    desc: "Saran berdasarkan jam dan kebiasaan. Bukan perintah.",
  },
  recover: {
    title: "Buat ulang draft dari ingatan",
    desc: "Direkonstruksi dari apa yang masih diingat — confidence rendah.",
  },
  habits: {
    title: "Pola kebiasaan",
    desc: "Insight deskriptif. Korelasi ≠ sebab-akibat.",
  },
  quality: {
    title: "Pemeriksa kualitas data",
    desc: "Fokus pada kelengkapan data, bukan penilaian pribadi.",
  },
  target: {
    title: "Penjelasan target",
    desc: "Transparansi formula BMR/TDEE. Estimasi, bukan nasihat medis.",
  },
  simulate: {
    title: "Simulasi target",
    desc: "Simulasi tidak mengubah target tersimpan.",
  },
  brief: {
    title: "Rencana minggu",
    desc: "Brief ringkas untuk fokus minggu — draft yang bisa ditinjau.",
  },
};

export default function AiToolsPage() {
  const [tab, setTab] = useState<Tab>("search");
  const [err, setErr] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmApply, setConfirmApply] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [q, setQ] = useState("");
  const [alias, setAlias] = useState("");
  const [foodA, setFoodA] = useState("nasi goreng");
  const [foodB, setFoodB] = useState("mie goreng");
  const [plateItems, setPlateItems] = useState("nasi, ayam");
  const [recover, setRecover] = useState({
    breakfast: "",
    lunch: "",
    dinner: "",
    snacks: "",
    drinks: "",
  });
  const [sim, setSim] = useState({ activityLevel: "moderate", goal: "maintain" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const qc = useQueryClient();

  const memory = useQuery({
    queryKey: ["meal-memory"],
    queryFn: () =>
      api<{
        data: Array<{
          id: string;
          alias: string;
          resolved_name: string;
          use_count: number;
          calories: number | null;
        }>;
      }>("/v1/ai/meal-memory"),
    enabled: tab === "memory",
  });

  const run = useMutation({
    mutationFn: async () => {
      setErr(null);
      switch (tab) {
        case "search":
          return api(`/v1/ai/food-search?q=${encodeURIComponent(q)}`);
        case "memory":
          return api("/v1/ai/alias-resolve", {
            method: "POST",
            body: JSON.stringify({ text: alias || q }),
          });
        case "compare":
          return api("/v1/ai/compare-foods", {
            method: "POST",
            body: JSON.stringify({ foodA, foodB }),
          });
        case "plate":
          return api("/v1/ai/plate-completion", {
            method: "POST",
            body: JSON.stringify({
              detectedItems: plateItems
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }),
          });
        case "context":
          return api("/v1/ai/contextual-suggestions");
        case "recover":
          return api("/v1/ai/missed-log-recovery", {
            method: "POST",
            body: JSON.stringify(recover),
          });
        case "habits":
          return api("/v1/ai/habit-patterns");
        case "quality":
          return api("/v1/ai/data-quality");
        case "target":
          return api("/v1/ai/explain-target");
        case "simulate":
          return api("/v1/ai/simulate-goal", {
            method: "POST",
            body: JSON.stringify(sim),
          });
        case "brief":
          return api("/v1/ai/weekly-planning-brief");
        default:
          return {};
      }
    },
    onSuccess: (data) => {
      setResult(data);
      // Hasil muncul di bawah form — toast hanya untuk error/aksi background
    },
    onError: (e: Error) => {
      setErr(e.message);
      toast.error("Gagal menjalankan alat", { description: e.message });
    },
  });

  const goToFoodLog = (
    name: string,
    calories?: number,
    macros?: { protein_g?: number | null; carbs_g?: number | null; fat_g?: number | null },
  ) => {
    const params = new URLSearchParams({ name });
    if (calories != null) params.set("calories", String(calories));
    if (macros?.protein_g != null) params.set("protein", String(macros.protein_g));
    if (macros?.carbs_g != null) params.set("carbs", String(macros.carbs_g));
    if (macros?.fat_g != null) params.set("fat", String(macros.fat_g));
    window.location.href = `/food/new?${params.toString()}`;
  };

  const meta = tabMeta[tab];

  return (
    <div className="animate-fade-up space-y-5">
      <PageTitle
        title="Asisten AI"
        subtitle="Pilih alat untuk membuat draft yang dapat ditinjau sebelum disimpan."
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Draft, bukan keputusan</Badge>
            <Badge variant="outline">Bukan alat medis</Badge>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Secondary tool nav */}
        <aside className="lg:col-span-3">
          <Card className="sticky top-20 space-y-5 border-[hsl(var(--border)/0.8)] bg-white/90 p-3 backdrop-blur">
            {categories.map((cat) => (
              <div key={cat.title}>
                <p className="mb-2 px-2 text-[11px] font-medium tracking-wide text-[hsl(var(--muted-foreground))]">
                  {cat.title}
                </p>
                <div className="space-y-1">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={tab === item.id ? "page" : undefined}
                      onClick={() => {
                        setTab(item.id);
                        setResult(null);
                        setErr(null);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm transition duration-300",
                        tab === item.id
                          ? "bg-[hsl(var(--secondary))] font-medium text-[hsl(var(--secondary-foreground))] shadow-[var(--shadow-sm)] ring-1 ring-[hsl(var(--primary)/0.12)]"
                          : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]",
                      )}
                    >
                      {tab === item.id ? <Check className="size-3.5 shrink-0" aria-hidden /> : null}
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </Card>

          {/* Mobile select fallback */}
          <div className="mt-3 lg:hidden">
            <Label>Pilih alat</Label>
            <Select
              value={tab}
              onChange={(e) => {
                setTab(e.target.value as Tab);
                setResult(null);
              }}
            >
              {categories.flatMap((c) =>
                c.items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {c.title}: {i.label}
                  </option>
                )),
              )}
            </Select>
          </div>
        </aside>

        <div className="space-y-4 lg:col-span-9">
          <Card className="space-y-4 bg-gradient-to-br from-white to-emerald-50/30">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                <Sparkles className="size-5" aria-hidden />
              </span>
              <div>
                <SectionTitle>{meta.title}</SectionTitle>
                <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {meta.desc}
                </p>
              </div>
            </div>

            {/* FORMS */}
            {tab === "search" ? (
              <>
                <Label>Cari makanan</Label>
                <div className="flex flex-wrap gap-2">
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="ayam geprek sambal hijau"
                    className="min-w-[12rem] flex-1"
                  />
                  <Button onClick={() => run.mutate()} loading={run.isPending} disabled={!q.trim()}>
                    <Search className="size-4" aria-hidden />
                    Cari
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["ayam geprek", "nasi padang", "kopi susu", "bubur ayam"].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1 text-xs"
                      onClick={() => setQ(ex)}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {tab === "memory" ? (
              <>
                <Label>Alias / sebutan</Label>
                <Input
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="naspad, kopi pagi, sarapan biasa"
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => run.mutate()} loading={run.isPending} disabled={!alias.trim()}>
                    Cari arti alias
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      if (!alias.trim()) return;
                      await api("/v1/ai/meal-memory", {
                        method: "POST",
                        body: JSON.stringify({
                          alias,
                          resolvedName: alias,
                          calories: 200,
                          portionAmount: 1,
                          portionUnit: "porsi",
                        }),
                      });
                      toast.success("Alias disimpan");
                      await qc.invalidateQueries({ queryKey: ["meal-memory"] });
                    }}
                  >
                    Simpan sebagai alias
                  </Button>
                </div>
                <HelperText>Memori hanya mempercepat pencatatan akun Anda. Dapat dihapus kapan saja.</HelperText>
                {memory.isLoading ? <Skeleton className="h-16" /> : null}
                {(memory.data?.data.length ?? 0) > 0 ? (
                  <div className="rounded-xl border border-[hsl(var(--border))]">
                    <p className="border-b border-[hsl(var(--border))] px-3 py-2 text-sm font-medium">
                      Alias tersimpan
                    </p>
                    <ul className="divide-y text-sm">
                      {memory.data!.data.map((m) => (
                        <li key={m.id} className="flex items-center justify-between px-3 py-2">
                          <span>
                            <strong>{m.alias}</strong> → {m.resolved_name}{" "}
                            <Badge variant="outline">×{m.use_count}</Badge>
                          </span>
                          <Button
                            variant="ghost"
                            onClick={async () => {
                              await api(`/v1/ai/meal-memory/${m.id}`, { method: "DELETE" });
                              await qc.invalidateQueries({ queryKey: ["meal-memory"] });
                            }}
                          >
                            Hapus
                          </Button>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-[hsl(var(--border))] p-2">
                      <Button variant="outline" onClick={() => setConfirmReset(true)}>
                        Reset semua memori…
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            {tab === "compare" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                  <div>
                    <Label>Makanan A</Label>
                    <Input value={foodA} onChange={(e) => setFoodA(e.target.value)} />
                  </div>
                  <Button
                    variant="outline"
                    className="mb-0.5"
                    type="button"
                    onClick={() => {
                      setFoodA(foodB);
                      setFoodB(foodA);
                    }}
                  >
                    ⇄
                  </Button>
                  <div>
                    <Label>Makanan B</Label>
                    <Input value={foodB} onChange={(e) => setFoodB(e.target.value)} />
                  </div>
                </div>
                <Button onClick={() => run.mutate()} loading={run.isPending}>
                  Bandingkan
                </Button>
              </>
            ) : null}

            {tab === "plate" ? (
              <>
                <Label>Item di piring (pisahkan koma)</Label>
                <Input value={plateItems} onChange={(e) => setPlateItems(e.target.value)} />
                <HelperText>
                  AI memeriksa komponen yang mungkin belum tercatat. Ini bukan saran untuk menambah makanan.
                </HelperText>
                <Button onClick={() => run.mutate()} loading={run.isPending}>
                  Cek komponen
                </Button>
              </>
            ) : null}

            {tab === "context" ? (
              <>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Berdasarkan jam lokal dan kebiasaan pencatatan Anda.
                </p>
                <Button onClick={() => run.mutate()} loading={run.isPending}>
                  Perbarui saran
                </Button>
              </>
            ) : null}

            {tab === "recover" ? (
              <>
                <HelperText>Buat ulang draft dari hal yang masih diingat — bukan fakta pasti.</HelperText>
                {(["breakfast", "lunch", "dinner", "snacks", "drinks"] as const).map((k) => (
                  <div key={k}>
                    <Label>
                      {k === "breakfast"
                        ? "Sarapan"
                        : k === "lunch"
                          ? "Makan siang"
                          : k === "dinner"
                            ? "Makan malam"
                            : k === "snacks"
                              ? "Camilan"
                              : "Minuman"}
                    </Label>
                    <Input
                      value={recover[k]}
                      onChange={(e) => setRecover({ ...recover, [k]: e.target.value })}
                      placeholder="Opsional"
                    />
                  </div>
                ))}
                <Button onClick={() => run.mutate()} loading={run.isPending}>
                  Buat draft
                </Button>
              </>
            ) : null}

            {tab === "habits" ? (
              <>
                <HelperText>Minimal disarankan 5 hari catatan agar pola lebih bermakna.</HelperText>
                <Button onClick={() => run.mutate()} loading={run.isPending}>
                  Analisis pola
                </Button>
              </>
            ) : null}

            {tab === "quality" ? (
              <Button onClick={() => run.mutate()} loading={run.isPending}>
                Periksa kualitas data
              </Button>
            ) : null}

            {tab === "target" ? (
              <Button onClick={() => run.mutate()} loading={run.isPending}>
                Jelaskan target saya
              </Button>
            ) : null}

            {tab === "simulate" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Aktivitas</Label>
                    <Select
                      value={sim.activityLevel}
                      onChange={(e) => setSim({ ...sim, activityLevel: e.target.value })}
                    >
                      <option value="sedentary">Sangat rendah</option>
                      <option value="light">Ringan (1–3 hari/minggu)</option>
                      <option value="moderate">Sedang</option>
                      <option value="high">Tinggi</option>
                      <option value="very_high">Sangat tinggi</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Tujuan</Label>
                    <Select value={sim.goal} onChange={(e) => setSim({ ...sim, goal: e.target.value })}>
                      <option value="lose_weight">Menurunkan berat</option>
                      <option value="maintain">Mempertahankan</option>
                      <option value="gain_weight">Meningkatkan</option>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => run.mutate()} loading={run.isPending}>
                  Simulasikan
                </Button>
              </>
            ) : null}

            {tab === "brief" ? (
              <Button onClick={() => run.mutate()} loading={run.isPending}>
                Buat brief minggu
              </Button>
            ) : null}

            {err ? (
              <ErrorBox
                message={err}
                action={
                  <Button variant="outline" onClick={() => run.mutate()}>
                    Coba lagi
                  </Button>
                }
              />
            ) : null}
            {run.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-20" />
                <Skeleton className="h-12" />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Menyusun draft…</p>
              </div>
            ) : null}
          </Card>

          {!result && !run.isPending && !err ? (
            <IdleHint>
              Isi formulir di atas, lalu jalankan alat. Hasil muncul di sini sebagai draft yang bisa
              ditinjau — bukan data final.
            </IdleHint>
          ) : null}

          {/* STRUCTURED RESULTS */}
          {result && tab === "search" ? (
            <ResultShell
              technical={result}
              badges={<Badge variant="outline">Katalog + memori + AI</Badge>}
            >
              <SectionTitle>Hasil pencarian</SectionTitle>
              {result.query ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Query: <strong>{result.query}</strong>
                </p>
              ) : null}
              <div className="space-y-2">
                {[
                  ...(result.from_memory ?? []).map(
                    (m: {
                      name: string;
                      calories?: number;
                      source?: string;
                      protein_g?: number;
                      carbs_g?: number;
                      fat_g?: number;
                    }) => ({
                      ...m,
                      sourceLabel: "Memori",
                    }),
                  ),
                  ...(result.from_catalog ?? []).map(
                    (c: {
                      name: string;
                      calories?: number;
                      unit?: string;
                      source?: string;
                      protein_g?: number;
                      carbs_g?: number;
                      fat_g?: number;
                    }) => ({
                      ...c,
                      sourceLabel: "Katalog",
                    }),
                  ),
                  ...(result.from_ai ?? []).map(
                    (a: {
                      name: string;
                      calories?: number;
                      unit?: string;
                      protein_g?: number;
                      carbs_g?: number;
                      fat_g?: number;
                    }) => ({
                      ...a,
                      sourceLabel: "AI",
                    }),
                  ),
                ].map(
                  (
                    item: {
                      name: string;
                      calories?: number;
                      unit?: string;
                      sourceLabel?: string;
                      protein_g?: number;
                      carbs_g?: number;
                      fat_g?: number;
                    },
                    i: number,
                  ) => (
                    <div
                      key={`${item.name}-${i}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[hsl(var(--border))] p-3"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {item.calories != null ? `${item.calories} kkal` : "—"}
                          {item.unit ? ` · ${item.unit}` : ""}
                        </p>
                        <div className="mt-1">
                          <SourceBadge source={item.sourceLabel} />
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          goToFoodLog(item.name, item.calories, {
                            protein_g: item.protein_g,
                            carbs_g: item.carbs_g,
                            fat_g: item.fat_g,
                          })
                        }
                      >
                        Gunakan di catatan
                      </Button>
                    </div>
                  ),
                )}
              </div>
              {(result.from_catalog?.length ?? 0) +
                (result.from_memory?.length ?? 0) +
                (result.from_ai?.length ?? 0) ===
              0 ? (
                <EmptyResult
                  title="Tidak ada hasil"
                  description="Coba kata kunci lain atau catat manual."
                  icon={<Utensils className="size-5" aria-hidden />}
                />
              ) : null}
              <AssumptionList
                items={
                  result.assumptions ??
                  ["Hasil dari katalog, memori, atau AI — selalu tinjau sebelum menyimpan."]
                }
              />
            </ResultShell>
          ) : null}

          {result && tab === "memory" && result.interpretation ? (
            <ResultShell technical={result}>
              <SectionTitle>Interpretasi alias</SectionTitle>
              <p className="text-sm">
                Kami menafsirkan <strong>“{result.input}”</strong> sebagai:
              </p>
              <p className="text-xl font-semibold">{result.interpretation}</p>
              {result.follow_up ? (
                <p className="flex gap-2 text-sm text-amber-900">
                  <HelpCircle className="size-4 shrink-0" aria-hidden />
                  {result.follow_up}
                </p>
              ) : null}
              <div className="space-y-2">
                {(result.candidates ?? []).map(
                  (
                    c: {
                      name: string;
                      calories?: number;
                      unit?: string;
                      protein_g?: number | null;
                      carbs_g?: number | null;
                      fat_g?: number | null;
                    },
                    i: number,
                  ) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"
                    >
                      <span>
                        {c.name}
                        {c.calories != null ? ` · ${c.calories} kkal` : ""}
                        {c.unit ? ` · ${c.unit}` : ""}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            goToFoodLog(c.name, c.calories, {
                              protein_g: c.protein_g,
                              carbs_g: c.carbs_g,
                              fat_g: c.fat_g,
                            })
                          }
                        >
                          Gunakan
                        </Button>
                        <Button
                          variant="outline"
                          onClick={async () => {
                            await api("/v1/ai/meal-memory", {
                              method: "POST",
                              body: JSON.stringify({
                                alias: result.input,
                                resolvedName: c.name,
                                calories: c.calories,
                                proteinG: c.protein_g,
                                carbsG: c.carbs_g,
                                fatG: c.fat_g,
                                portionUnit: c.unit,
                              }),
                            });
                            toast.success("Alias disimpan");
                            await qc.invalidateQueries({ queryKey: ["meal-memory"] });
                          }}
                        >
                          Simpan alias
                        </Button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </ResultShell>
          ) : null}

          {result && tab === "compare" && result.food_a ? (
            <ResultShell technical={result}>
              <SectionTitle>Perbandingan</SectionTitle>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[20rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                      <th className="py-2 pr-3 font-medium">Aspek</th>
                      <th className="py-2 pr-3 font-medium">{result.food_a.name}</th>
                      <th className="py-2 font-medium">{result.food_b?.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <td className="py-2 pr-3">Kalori</td>
                      <td className="py-2 pr-3 tabular-nums">{result.food_a.calories_range}</td>
                      <td className="py-2 tabular-nums">{result.food_b?.calories_range}</td>
                    </tr>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <td className="py-2 pr-3">Protein</td>
                      <td className="py-2 pr-3 tabular-nums">{result.food_a.protein_g ?? "—"} g</td>
                      <td className="py-2 tabular-nums">{result.food_b?.protein_g ?? "—"} g</td>
                    </tr>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <td className="py-2 pr-3">Karbo</td>
                      <td className="py-2 pr-3 tabular-nums">{result.food_a.carbs_g ?? "—"} g</td>
                      <td className="py-2 tabular-nums">{result.food_b?.carbs_g ?? "—"} g</td>
                    </tr>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <td className="py-2 pr-3">Lemak</td>
                      <td className="py-2 pr-3 tabular-nums">{result.food_a.fat_g ?? "—"} g</td>
                      <td className="py-2 tabular-nums">{result.food_b?.fat_g ?? "—"} g</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3">Ketidakpastian</td>
                      <td className="py-2 pr-3">{result.food_a.uncertainty}</td>
                      <td className="py-2">{result.food_b?.uncertainty}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {result.note ||
                  "Perbedaan terbesar biasanya dari minyak, porsi, dan topping. Bukan label baik/buruk."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    goToFoodLog(result.food_a.name, undefined, {
                      protein_g: result.food_a.protein_g,
                      carbs_g: result.food_a.carbs_g,
                      fat_g: result.food_a.fat_g,
                    })
                  }
                >
                  Catat {result.food_a.name}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    goToFoodLog(result.food_b?.name, undefined, {
                      protein_g: result.food_b?.protein_g,
                      carbs_g: result.food_b?.carbs_g,
                      fat_g: result.food_b?.fat_g,
                    })
                  }
                >
                  Catat {result.food_b?.name}
                </Button>
              </div>
            </ResultShell>
          ) : null}

          {result && tab === "plate" && result.missing_components ? (
            <ResultShell technical={result} badges={<Badge variant="warning">Verifikasi</Badge>}>
              <SectionTitle>Mungkin belum tercatat</SectionTitle>
              <HelperText>
                AI memeriksa komponen yang mungkin belum tercatat. Ini bukan saran untuk menambah makanan.
              </HelperText>
              <div className="space-y-3">
                {(result.missing_components as Array<{ name: string; why: string; options: string[] }>).map(
                  (c) => (
                    <div key={c.name} className="rounded-xl border border-[hsl(var(--border))] p-3">
                      <p className="font-medium">{c.name}</p>
                      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{c.why}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(c.options ?? []).map((o) => (
                          <button
                            key={o}
                            type="button"
                            className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs hover:bg-[hsl(var(--muted))]"
                            onClick={() => toast.message(`Anda memilih: ${o} untuk ${c.name}`)}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
              <Button variant="secondary" onClick={() => toast.message("Tidak ada yang ditambahkan")}>
                Tidak ada yang terlewat
              </Button>
            </ResultShell>
          ) : null}

          {result && tab === "context" && result.suggestions ? (
            <ResultShell technical={result}>
              <SectionTitle>Saran untuk sekarang</SectionTitle>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Pukul ~{result.context?.local_hour ?? "—"} · saran meal:{" "}
                {result.context?.suggested_meal_type ?? "—"}
              </p>
              {(result.suggestions as Array<{ title: string; items: string[] }>).map((s) => (
                <div key={s.title} className="rounded-xl border p-3">
                  <p className="font-medium">{s.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(s.items ?? []).length === 0 ? (
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Belum ada item</span>
                    ) : (
                      s.items.map((item) => (
                        <Link
                          key={item}
                          href={
                            item.toLowerCase().includes("pindai")
                              ? "/food/scan"
                              : item.toLowerCase().includes("manual")
                                ? "/food/new"
                                : item.toLowerCase().includes("barcode")
                                  ? "/barcode"
                                  : `/food/new?name=${encodeURIComponent(item)}`
                          }
                          className="rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-medium hover:bg-[hsl(var(--secondary))]"
                        >
                          {item}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <Link href="/food/new">
                  <Button>Catat manual</Button>
                </Link>
                <Link href="/food/scan">
                  <Button variant="secondary">Pindai foto</Button>
                </Link>
              </div>
            </ResultShell>
          ) : null}

          {result && tab === "recover" ? (
            <ResultShell
              technical={result}
              badges={
                <>
                  <Badge variant="warning">Direkonstruksi</Badge>
                  <ConfidenceBadge label="Rendah" />
                </>
              }
            >
              <SectionTitle>Draft rekonstruksi</SectionTitle>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {result.label || "Berdasarkan ingatan Anda"}
              </p>
              <ul className="space-y-2">
                {(result.draft_items ?? []).map(
                  (d: { name: string; meal_type: string; calories: number }, i: number) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-xl border p-3 text-sm"
                    >
                      <span>
                        {d.name} · {d.meal_type}
                      </span>
                      <span className="tabular-nums">{d.calories} kkal</span>
                    </li>
                  ),
                )}
              </ul>
              {(result.draft_items ?? []).length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Isi setidaknya satu field ingatan untuk membuat draft.
                </p>
              ) : (
                <Button
                  onClick={() => {
                    const first = result.draft_items[0];
                    goToFoodLog(first.name, first.calories);
                  }}
                >
                  Edit & simpan sebagai rekonstruksi
                </Button>
              )}
            </ResultShell>
          ) : null}

          {result && tab === "habits" ? (
            <ResultShell technical={result}>
              <SectionTitle>Pola kebiasaan</SectionTitle>
              {(result.data_points?.food_logs ?? 0) < 5 ? (
                <div className="space-y-3">
                  <p className="text-sm">
                    Data tersedia: makanan {result.data_points?.food_logs ?? 0} · aktivitas{" "}
                    {result.data_points?.activity_logs ?? 0}
                  </p>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                      <span>Minimal disarankan 5 catatan makanan</span>
                      <span>
                        {Math.min(5, result.data_points?.food_logs ?? 0)} / 5
                      </span>
                    </div>
                    <Progress
                      value={((result.data_points?.food_logs ?? 0) / 5) * 100}
                      label="Progres data pola"
                    />
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Belum cukup data untuk menemukan pola yang stabil.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/food/new">
                      <Button>Catat makanan</Button>
                    </Link>
                    <Link href="/activities/new">
                      <Button variant="secondary">Tambah aktivitas</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(result.patterns ?? []).map(
                    (p: { title: string; statement: string; kind: string }) => (
                      <div key={p.title} className="rounded-xl border p-3">
                        <div className="flex flex-wrap gap-2">
                          <p className="font-medium">{p.title}</p>
                          <Badge variant="outline">{p.kind}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{p.statement}</p>
                      </div>
                    ),
                  )}
                </div>
              )}
            </ResultShell>
          ) : null}

          {result && tab === "quality" && result.issues ? (
            <ResultShell technical={result}>
              <SectionTitle>Kualitas data</SectionTitle>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Periode: sampel catatan terbaru</p>
              <ul className="space-y-2">
                {(result.issues as Array<{ code: string; message: string; severity: string }>).map(
                  (issue) => (
                    <li
                      key={issue.code}
                      className="flex flex-wrap items-start justify-between gap-2 rounded-xl border p-3 text-sm"
                    >
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            issue.severity === "info" || issue.code === "ok"
                              ? "success"
                              : issue.severity === "low"
                                ? "outline"
                                : "warning"
                          }
                        >
                          {issue.severity === "info" || issue.code === "ok"
                            ? "Informasi"
                            : "Perlu ditinjau"}
                        </Badge>
                        <span>{issue.message}</span>
                      </div>
                      {issue.code === "weight_missing" ? (
                        <Link href="/onboarding">
                          <Button variant="outline">Perbarui profil</Button>
                        </Link>
                      ) : null}
                      {issue.code === "ai_unreviewed" ? (
                        <Link href="/food/scan">
                          <Button variant="outline">Ke pindai makanan</Button>
                        </Link>
                      ) : null}
                      {issue.code === "missing_portion" ? (
                        <Link href="/history">
                          <Button variant="outline">Lengkapi di histori</Button>
                        </Link>
                      ) : null}
                    </li>
                  ),
                )}
              </ul>
            </ResultShell>
          ) : null}

          {result && tab === "target" && (result.calorie_target != null || result.explanation) ? (
            <ResultShell technical={result}>
              <SectionTitle>Target harian Anda</SectionTitle>
              {result.calorie_target != null ? (
                <p className="text-3xl font-bold tabular-nums">
                  {result.calorie_target}{" "}
                  <span className="text-base font-medium text-[hsl(var(--muted-foreground))]">kkal</span>
                </p>
              ) : null}
              <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {result.explanation}
              </p>
              {result.inputs ? (
                <div className="grid gap-2 rounded-xl bg-[hsl(var(--muted))] p-3 text-sm sm:grid-cols-2">
                  <p>Berat: {result.inputs.weight_kg ?? "—"} kg</p>
                  <p>Tinggi: {result.inputs.height_cm ?? "—"} cm</p>
                  <p>Usia: {result.inputs.age_years ?? "—"}</p>
                  <p>Aktivitas: {result.inputs.activity_level ?? "—"}</p>
                  <p>Formula: {result.inputs.metabolic_formula ?? "—"}</p>
                  <p>Versi: {result.inputs.formula_version ?? "—"}</p>
                </div>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border p-3 text-center">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">BMR (istirahat)</p>
                  <p className="font-semibold tabular-nums">{result.bmr_kcal ?? "—"}</p>
                </div>
                <div className="rounded-xl border p-3 text-center">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">TDEE (harian)</p>
                  <p className="font-semibold tabular-nums">{result.tdee_kcal ?? "—"}</p>
                </div>
                <div className="rounded-xl border p-3 text-center">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Tujuan</p>
                  <p className="font-semibold">{result.goal ?? "—"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/onboarding">
                  <Button variant="secondary">Edit data profil</Button>
                </Link>
                <Button variant="outline" onClick={() => setTab("simulate")}>
                  Bandingkan skenario
                </Button>
              </div>
            </ResultShell>
          ) : null}

          {result && tab === "simulate" && result.simulated_target != null ? (
            <ResultShell technical={result} badges={<Badge variant="secondary">Simulasi</Badge>}>
              <SectionTitle>Hasil simulasi</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Target saat ini</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {result.current_target ?? "—"} kkal
                  </p>
                </div>
                <div className="rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--secondary))] p-4">
                  <p className="text-sm text-[hsl(var(--secondary-foreground))]">Skenario</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {result.simulated_target} kkal
                  </p>
                  {result.delta != null ? (
                    <p className="text-sm tabular-nums">
                      {result.delta > 0 ? "+" : ""}
                      {result.delta} kkal/hari
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {result.message || "Ini hanya simulasi. Target Anda belum berubah."}
              </p>
              <AssumptionList
                items={[
                  "Simulasi tidak mengubah target tersimpan.",
                  "Terapkan hanya setelah meninjau di profil/onboarding.",
                ]}
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setConfirmApply(true)}>Terapkan setelah meninjau…</Button>
                <Button variant="ghost" onClick={() => setResult(null)}>
                  Batalkan
                </Button>
              </div>
            </ResultShell>
          ) : null}

          {result && tab === "brief" ? (
            <ResultShell technical={result}>
              <SectionTitle>Brief minggu</SectionTitle>
              <div className="space-y-3 text-sm">
                {[
                  ["Ringkasan minggu lalu", result.last_week_pattern],
                  ["Rencana yang belum selesai", result.unfinished_plans],
                  ["Bahan / pantry", result.leftover_ingredients],
                  ["Fokus kecil", result.habit_nudge],
                  ["Agenda aktivitas", result.activity_agenda],
                ].map(([t, body]) => (
                  <div key={String(t)} className="rounded-xl border p-3">
                    <p className="font-medium">{t}</p>
                    <p className="mt-1 text-[hsl(var(--muted-foreground))]">{body || "—"}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/insights">
                  <Button variant="secondary">Ke insight</Button>
                </Link>
                <Link href="/food/new">
                  <Button>Catat makanan</Button>
                </Link>
              </div>
            </ResultShell>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset semua memori?"
        description="Semua alias dan memori makanan AI akan dihapus. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, reset"
        danger
        loading={resetting}
        onCancel={() => setConfirmReset(false)}
        onConfirm={async () => {
          setResetting(true);
          try {
            await api("/v1/ai/meal-memory/reset", { method: "POST", body: "{}" });
            toast.success("Memori direset");
            await qc.invalidateQueries({ queryKey: ["meal-memory"] });
            setConfirmReset(false);
          } catch (e) {
            toast.error((e as Error).message);
          } finally {
            setResetting(false);
          }
        }}
      />

      <ConfirmDialog
        open={confirmApply}
        title="Tinjau target di onboarding?"
        description="Simulasi tidak mengubah target otomatis. Anda akan diarahkan ke onboarding untuk meninjau dan menyimpan perubahan secara sadar."
        confirmLabel="Buka onboarding"
        onCancel={() => setConfirmApply(false)}
        onConfirm={() => {
          setConfirmApply(false);
          window.location.href = "/onboarding";
        }}
      />
    </div>
  );
}
