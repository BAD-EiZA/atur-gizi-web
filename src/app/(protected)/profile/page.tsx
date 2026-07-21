"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { toast } from "sonner";
import { useMe } from "@/hooks/use-me";
import { api, clearTokenCache } from "@/lib/api-client";
import {
  Badge,
  Button,
  Card,
  ErrorBox,
  HelperText,
  Input,
  PageTitle,
  SectionTitle,
} from "@/components/ui";
import { InfoTip, LabelWithTip } from "@/components/info-tip";

type WeightRow = {
  id: string;
  weight_kg: number;
  logged_at: string;
  note: string | null;
};

function EnergySuggestionCard() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["energy-suggestion"],
    queryFn: () =>
      api<{
        available: boolean;
        message?: string;
        suggested_target?: number;
        adaptive_tdee_kcal?: number;
        avg_intake_kcal?: number;
        weight_slope_kg_wk?: number | null;
        window_days?: number;
      }>("/v1/me/energy-suggestion"),
  });
  const accept = useMutation({
    mutationFn: () => api("/v1/me/energy-suggestion/accept", { method: "POST", body: "{}" }),
    onSuccess: async () => {
      toast.success("Target adaptif diterapkan.");
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      await qc.invalidateQueries({ queryKey: ["energy-suggestion"] });
    },
  });
  if (!q.data) return null;
  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-1.5">
        <SectionTitle>Saran TDEE adaptif</SectionTitle>
        <InfoTip tip="adaptive_tdee" />
      </div>
      {!q.data.available ? (
        <HelperText>{q.data.message}</HelperText>
      ) : (
        <>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{q.data.message}</p>
          <dl className="grid gap-1 text-sm sm:grid-cols-2">
            <div>
              <dt className="inline-flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                TDEE adaptif <InfoTip tip="tdee" />
              </dt>
              <dd className="font-semibold tabular-nums">{q.data.adaptive_tdee_kcal} kkal</dd>
            </div>
            <div>
              <dt className="inline-flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                Saran target <InfoTip tip="calorie_target" />
              </dt>
              <dd className="font-semibold tabular-nums">{q.data.suggested_target} kkal</dd>
            </div>
            <div>
              <dt className="text-[hsl(var(--muted-foreground))]">Rata-rata asupan</dt>
              <dd className="tabular-nums">{q.data.avg_intake_kcal} kkal</dd>
            </div>
            <div>
              <dt className="inline-flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                Tren berat <InfoTip tip="weight_log" />
              </dt>
              <dd className="tabular-nums">
                {q.data.weight_slope_kg_wk != null
                  ? `${q.data.weight_slope_kg_wk > 0 ? "+" : ""}${q.data.weight_slope_kg_wk} kg/minggu`
                  : "—"}{" "}
                · {q.data.window_days} hari
              </dd>
            </div>
          </dl>
          <Button onClick={() => accept.mutate()} loading={accept.isPending}>
            Terapkan saran target
          </Button>
        </>
      )}
    </Card>
  );
}

export default function ProfilePage() {
  const { data, refetch } = useMe();
  const router = useRouter();
  const qc = useQueryClient();
  const [weight, setWeight] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [p, setP] = useState("");
  const [c, setC] = useState("");
  const [f, setF] = useState("");

  const weights = useQuery({
    queryKey: ["weight-logs"],
    queryFn: () => api<{ data: WeightRow[] }>("/v1/weight-logs?limit=14"),
  });

  const macros = useQuery({
    queryKey: ["macros"],
    queryFn: () =>
      api<{ protein_g: number; carbs_g: number; fat_g: number; calorie_target: number }>(
        "/v1/macros/targets",
      ),
  });

  const logWeight = useMutation({
    mutationFn: () =>
      api("/v1/weight-logs", {
        method: "POST",
        body: JSON.stringify({ weightKg: Number(weight) }),
      }),
    onSuccess: async () => {
      setWeight("");
      setErr(null);
      await qc.invalidateQueries({ queryKey: ["weight-logs"] });
      await refetch();
    },
    onError: (e: Error) => setErr(e.message),
  });

  const saveMacros = useMutation({
    mutationFn: () =>
      api("/v1/me/macro-targets", {
        method: "PATCH",
        body: JSON.stringify({
          proteinG: p ? Number(p) : undefined,
          carbsG: c ? Number(c) : undefined,
          fatG: f ? Number(f) : undefined,
        }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["macros"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => setErr(e.message),
  });

  const initials = (data?.display_name || data?.email || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const series = [...(weights.data?.data ?? [])].reverse();
  const maxW = Math.max(...series.map((w) => w.weight_kg), 1);
  const minW = Math.min(...series.map((w) => w.weight_kg), maxW);

  return (
    <div className="mx-auto max-w-3xl animate-fade-up space-y-5">
      <PageTitle title="Profil" subtitle="Data dasar, berat, dan target makro." />

      <Card className="flex flex-wrap items-center gap-4">
        <div
          className="flex size-16 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-lg font-bold text-[hsl(var(--secondary-foreground))]"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold">{data?.display_name || "Pengguna"}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {data?.email || "Email dikelola Kinde"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">
              {data?.onboarding_completed ? "Onboarding selesai" : "Onboarding belum selesai"}
            </Badge>
          </div>
        </div>
        <Button variant="secondary" onClick={() => router.push("/settings")}>
          Buka setelan
        </Button>
      </Card>

      <Card className="space-y-3 text-sm">
        <SectionTitle>Informasi dasar</SectionTitle>
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-[hsl(var(--muted-foreground))]">Berat</dt>
            <dd className="font-medium tabular-nums">
              {data?.profile?.current_weight_kg ?? "—"} kg
            </dd>
          </div>
          <div>
            <dt className="text-[hsl(var(--muted-foreground))]">Tinggi</dt>
            <dd className="font-medium tabular-nums">{data?.profile?.height_cm ?? "—"} cm</dd>
          </div>
          <div>
            <dt className="text-[hsl(var(--muted-foreground))]">Zona waktu</dt>
            <dd className="font-medium">{data?.settings?.timezone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[hsl(var(--muted-foreground))]">Mode kalori</dt>
            <dd className="font-medium">
              {data?.settings?.calorie_budget_mode === "eat_back" ? "Eat-back" : "Intake only"}
            </dd>
          </div>
        </dl>
        <HelperText>
          Ubah berat di bawah — target kalori & makro dihitung ulang otomatis.
        </HelperText>
        <Link href="/onboarding">
          <Button variant="outline" type="button">
            Perbarui target / onboarding
          </Button>
        </Link>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-1.5">
          <SectionTitle>Catat berat</SectionTitle>
          <InfoTip tip="weight_log" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="min-w-[8rem] flex-1">
            <LabelWithTip tip="weight_log">Berat (kg)</LabelWithTip>
            <Input
              type="number"
              step="0.1"
              min={20}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={String(data?.profile?.current_weight_kg ?? "")}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => logWeight.mutate()}
              disabled={!weight || logWeight.isPending}
              loading={logWeight.isPending}
            >
              Simpan berat
            </Button>
          </div>
        </div>
        {series.length > 1 ? (
          <div className="flex h-16 items-end gap-1">
            {series.map((w) => {
              const h =
                maxW === minW ? 50 : ((w.weight_kg - minW) / (maxW - minW)) * 80 + 20;
              return (
                <div
                  key={w.id}
                  className="flex-1 rounded-t bg-[hsl(var(--primary)/0.7)]"
                  style={{ height: `${h}%` }}
                  title={`${w.weight_kg} kg · ${w.logged_at.slice(0, 10)}`}
                />
              );
            })}
          </div>
        ) : null}
        <ul className="divide-y text-xs text-[hsl(var(--muted-foreground))]">
          {(weights.data?.data ?? []).slice(0, 5).map((w) => (
            <li key={w.id} className="flex justify-between py-1.5">
              <span>{w.logged_at.slice(0, 10)}</span>
              <span className="font-medium tabular-nums text-[hsl(var(--foreground))]">
                {w.weight_kg} kg
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-1.5">
          <SectionTitle>Target makro (g/hari)</SectionTitle>
          <InfoTip tip="macro_targets" />
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Saat ini: P {macros.data?.protein_g ?? "—"} · K {macros.data?.carbs_g ?? "—"} · L{" "}
          {macros.data?.fat_g ?? "—"} (target {macros.data?.calorie_target ?? "—"} kkal)
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <LabelWithTip tip="protein" className="text-xs">
              Protein
            </LabelWithTip>
            <Input type="number" value={p} onChange={(e) => setP(e.target.value)} placeholder="g" />
          </div>
          <div>
            <LabelWithTip tip="carbs" className="text-xs">
              Karbo
            </LabelWithTip>
            <Input type="number" value={c} onChange={(e) => setC(e.target.value)} placeholder="g" />
          </div>
          <div>
            <LabelWithTip tip="fat" className="text-xs">
              Lemak
            </LabelWithTip>
            <Input type="number" value={f} onChange={(e) => setF(e.target.value)} placeholder="g" />
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => saveMacros.mutate()}
          disabled={saveMacros.isPending || (!p && !c && !f)}
        >
          Simpan target makro
        </Button>
      </Card>

      <EnergySuggestionCard />

      {err ? <ErrorBox message={err} /> : null}

      <Card className="space-y-3">
        <SectionTitle>Akun</SectionTitle>
        <div className="flex flex-wrap gap-2">
          <LogoutLink
            postLogoutRedirectURL="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--secondary-foreground))]"
            onClick={() => clearTokenCache()}
          >
            Keluar
          </LogoutLink>
          <Link href="/export">
            <Button variant="outline">Ekspor data</Button>
          </Link>
        </div>
      </Card>

      <Card className="space-y-2 border-red-200 bg-red-50/50">
        <SectionTitle>Zona berbahaya</SectionTitle>
        <p className="text-sm text-red-900/80">Hapus akun menghapus semua data domain.</p>
        <Link href="/account/delete">
          <Button variant="danger">Hapus akun</Button>
        </Link>
      </Card>
    </div>
  );
}
