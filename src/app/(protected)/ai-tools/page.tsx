"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  SectionTitle,
  Select,
  Skeleton,
} from "@/components/ui";

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

const tabs: { id: Tab; label: string }[] = [
  { id: "search", label: "Cari makanan" },
  { id: "memory", label: "Memori" },
  { id: "compare", label: "Bandingkan" },
  { id: "plate", label: "Lengkapi piring" },
  { id: "context", label: "Kontekstual" },
  { id: "recover", label: "Pulihkan log" },
  { id: "habits", label: "Pola" },
  { id: "quality", label: "Kualitas data" },
  { id: "target", label: "Jelaskan target" },
  { id: "simulate", label: "Simulasi" },
  { id: "brief", label: "Brief minggu" },
];

export default function AiToolsPage() {
  const [tab, setTab] = useState<Tab>("search");
  const [err, setErr] = useState<string | null>(null);
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
  const [sim, setSim] = useState({
    activityLevel: "moderate",
    goal: "maintain",
  });
  const [result, setResult] = useState<unknown>(null);
  const qc = useQueryClient();

  const memory = useQuery({
    queryKey: ["meal-memory"],
    queryFn: () => api<{ data: Array<{ id: string; alias: string; resolved_name: string; use_count: number }> }>("/v1/ai/meal-memory"),
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
              detectedItems: plateItems.split(",").map((s) => s.trim()).filter(Boolean),
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
      toast.message("Draft AI siap ditinjau");
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <PageTitle
        title="Alat AI"
        subtitle="AI membuat draft. Anda meninjau dan mengedit. Bukan diagnosis medis."
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setResult(null);
              setErr(null);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium sm:text-sm ${
              tab === t.id
                ? "bg-[hsl(var(--primary))] text-white"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="space-y-3">
        {tab === "search" ? (
          <>
            <SectionTitle>AI Smart Search</SectionTitle>
            <HelperText>Semantic search katalog + memori + draft AI.</HelperText>
            <Label>Query makanan</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ayam geprek sambal sedikit" />
            <Button onClick={() => run.mutate()} loading={run.isPending} disabled={!q.trim()}>
              Cari
            </Button>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Atau buka{" "}
              <Link href="/food/new" className="text-[hsl(var(--primary))]">
                Catat makanan
              </Link>{" "}
              untuk memakai hasil.
            </p>
          </>
        ) : null}

        {tab === "memory" ? (
          <>
            <SectionTitle>AI Meal Memory & Alias</SectionTitle>
            <Label>Alias / sebutan</Label>
            <Input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="naspad, kopi pagi, sarapan biasa" />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => run.mutate()} loading={run.isPending} disabled={!alias.trim()}>
                Resolve alias
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
                  toast.success("Memori disimpan (draft). Edit via resolve.");
                  await qc.invalidateQueries({ queryKey: ["meal-memory"] });
                }}
              >
                Simpan alias cepat
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (!confirm("Reset semua memori AI?")) return;
                  await api("/v1/ai/meal-memory/reset", { method: "POST", body: "{}" });
                  toast.message("Memori direset");
                  await qc.invalidateQueries({ queryKey: ["meal-memory"] });
                }}
              >
                Reset memori
              </Button>
            </div>
            {memory.isLoading ? <Skeleton className="h-20" /> : null}
            <ul className="divide-y text-sm">
              {(memory.data?.data ?? []).map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2">
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
          </>
        ) : null}

        {tab === "compare" ? (
          <>
            <SectionTitle>AI Food Comparison</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Makanan A</Label>
                <Input value={foodA} onChange={(e) => setFoodA(e.target.value)} />
              </div>
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
            <SectionTitle>AI Plate Completion</SectionTitle>
            <HelperText>Item terdeteksi (pisahkan koma). AI menyarankan yang mungkin terlewat.</HelperText>
            <Input value={plateItems} onChange={(e) => setPlateItems(e.target.value)} />
            <Button onClick={() => run.mutate()} loading={run.isPending}>
              Cek komponen
            </Button>
          </>
        ) : null}

        {tab === "context" ? (
          <>
            <SectionTitle>AI Contextual Logging</SectionTitle>
            <HelperText>Saran berdasarkan jam dan kebiasaan. Bukan perintah.</HelperText>
            <Button onClick={() => run.mutate()} loading={run.isPending}>
              Muat saran
            </Button>
          </>
        ) : null}

        {tab === "recover" ? (
          <>
            <SectionTitle>AI Missed Log Recovery</SectionTitle>
            <HelperText>Draft dari ingatan — label “direkonstruksi”, bukan fakta pasti.</HelperText>
            {(["breakfast", "lunch", "dinner", "snacks", "drinks"] as const).map((k) => (
              <div key={k}>
                <Label>{k}</Label>
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
            <SectionTitle>AI Habit Pattern Finder</SectionTitle>
            <Button onClick={() => run.mutate()} loading={run.isPending}>
              Analisis pola
            </Button>
          </>
        ) : null}

        {tab === "quality" ? (
          <>
            <SectionTitle>AI Data Quality Assistant</SectionTitle>
            <Button onClick={() => run.mutate()} loading={run.isPending}>
              Periksa kualitas data
            </Button>
          </>
        ) : null}

        {tab === "target" ? (
          <>
            <SectionTitle>AI Explain My Target</SectionTitle>
            <Button onClick={() => run.mutate()} loading={run.isPending}>
              Jelaskan target saya
            </Button>
          </>
        ) : null}

        {tab === "simulate" ? (
          <>
            <SectionTitle>AI Goal Scenario Simulator</SectionTitle>
            <HelperText>Simulasi tidak mengubah target tersimpan.</HelperText>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Aktivitas</Label>
                <Select
                  value={sim.activityLevel}
                  onChange={(e) => setSim({ ...sim, activityLevel: e.target.value })}
                >
                  <option value="sedentary">Sangat rendah</option>
                  <option value="light">Ringan</option>
                  <option value="moderate">Sedang</option>
                  <option value="high">Tinggi</option>
                  <option value="very_high">Sangat tinggi</option>
                </Select>
              </div>
              <div>
                <Label>Tujuan</Label>
                <Select value={sim.goal} onChange={(e) => setSim({ ...sim, goal: e.target.value })}>
                  <option value="lose_weight">Menurunkan</option>
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
          <>
            <SectionTitle>AI Weekly Planning Brief</SectionTitle>
            <Button onClick={() => run.mutate()} loading={run.isPending}>
              Buat brief minggu
            </Button>
          </>
        ) : null}

        {err ? <ErrorBox message={err} /> : null}
      </Card>

      {result ? (
        <Card>
          <SectionTitle>Hasil (draft)</SectionTitle>
          <Badge variant="secondary" className="mt-1">
            Estimasi · tinjau manual
          </Badge>
          <pre className="mt-3 max-h-[28rem] overflow-auto rounded-xl bg-[hsl(var(--muted))] p-3 text-xs leading-relaxed">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      ) : null}
    </div>
  );
}
