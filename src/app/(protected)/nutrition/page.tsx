"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api-client";
import { useMe } from "@/hooks/use-me";
import {
  BLOCKING_COPY,
  SCREENING_FIELDS,
  type CurrentGoal,
  type GoalPlan,
  type GoalPreview,
  type HistoryItem,
  type ScreeningAnswers,
  type ScreeningState,
  bmiCategoryLabel,
  defaultScreeningAnswers,
  feasibilityLabel,
  labelBlocking,
  labelWarning,
} from "@/lib/nutrition-v2";
import { Button, ErrorBox, HelperText, Input, Label, Select } from "@/components/ui";
import { cn, formatKcal } from "@/lib/utils";

type Step = "overview" | "screening" | "goal" | "preview" | "history";

const ease = "duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]";

function Shell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[2rem] bg-black/[0.03] p-1.5 ring-1 ring-black/[0.04]",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-[calc(2rem-0.375rem)] bg-white p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]",
          "md:p-7",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-[hsl(var(--secondary))] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--secondary-foreground))]">
      {children}
    </span>
  );
}

function Metric({
  label,
  value,
  hint,
  wide,
}: {
  label: string;
  value: string;
  hint?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] bg-[hsl(var(--muted))]/70 p-4 ring-1 ring-black/[0.03]",
        wide && "md:col-span-2",
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-[hsl(var(--foreground))] md:text-3xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function StepRail({
  step,
  onChange,
}: {
  step: Step;
  onChange: (s: Step) => void;
}) {
  const items: { id: Step; label: string }[] = [
    { id: "overview", label: "Ringkas" },
    { id: "screening", label: "Screening" },
    { id: "goal", label: "Target" },
    { id: "preview", label: "Pratinjau" },
    { id: "history", label: "Riwayat" },
  ];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item, i) => {
        const active = item.id === step;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-all",
              ease,
              active
                ? "bg-[hsl(var(--foreground))] text-white shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
                : "bg-white/80 text-[hsl(var(--muted-foreground))] ring-1 ring-black/[0.04] hover:bg-white",
            )}
          >
            <span className="mr-2 tabular-nums opacity-50">{i + 1}</span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function PillCta({
  children,
  onClick,
  disabled,
  loading,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "group inline-flex min-h-12 items-center gap-3 rounded-full px-6 py-3 text-sm font-medium transition-all",
        ease,
        "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-[hsl(var(--primary))] text-white shadow-[0_10px_30px_rgba(16,185,129,0.22)]",
        variant === "secondary" &&
          "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
        variant === "ghost" &&
          "bg-transparent text-[hsl(var(--muted-foreground))] ring-1 ring-black/[0.06]",
      )}
    >
      <span>{loading ? "Memproses…" : children}</span>
      <span
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full transition-transform",
          ease,
          "group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105",
          variant === "primary" ? "bg-white/15" : "bg-black/[0.05]",
        )}
        aria-hidden
      >
        ↗
      </span>
    </button>
  );
}

export default function NutritionPage() {
  const qc = useQueryClient();
  const me = useMe();
  const [step, setStep] = useState<Step>("overview");
  const [err, setErr] = useState<string | null>(null);
  const [answers, setAnswers] = useState<ScreeningAnswers>(defaultScreeningAnswers());
  const [goalType, setGoalType] = useState<"maintain" | "lose" | "gain">("maintain");
  const [method, setMethod] = useState<"weekly_rate" | "target_date">("weekly_rate");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [weeklyChangeKg, setWeeklyChangeKg] = useState("0.3");
  const [targetDate, setTargetDate] = useState("");
  const [preview, setPreview] = useState<GoalPreview | null>(null);
  const [acceptedWarnings, setAcceptedWarnings] = useState<string[]>([]);
  const [aggressiveOk, setAggressiveOk] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  const screeningQ = useQuery({
    queryKey: ["nutrition-screening"],
    queryFn: () => api<ScreeningState>("/v2/nutrition/safety-screening"),
  });
  const currentQ = useQuery({
    queryKey: ["nutrition-goal-current"],
    queryFn: () => api<{ goal: CurrentGoal | null }>("/v2/nutrition/goals/current"),
  });
  const historyQ = useQuery({
    queryKey: ["nutrition-goal-history"],
    queryFn: () => api<{ data: HistoryItem[]; nextCursor: string | null }>("/v2/nutrition/goals?limit=20"),
  });
  const basicsQ = useQuery({
    queryKey: ["nutrition-basics"],
    queryFn: () =>
      api<{
        available: boolean;
        bmi: GoalPreview["bmi"];
        ree: GoalPreview["ree"];
        tdee: GoalPreview["tdee"];
        decision?: NutritionDecisionLike;
        adultBlocked?: boolean;
      }>("/v2/nutrition/basics/current"),
  });

  useEffect(() => {
    if (screeningQ.data?.status === "complete" && screeningQ.data.answers) {
      setAnswers(screeningQ.data.answers);
    }
  }, [screeningQ.data]);

  useEffect(() => {
    const w = me.data?.profile?.current_weight_kg;
    if (w != null && !targetWeightKg) {
      setTargetWeightKg(String(Math.max(20, Math.round((w - 3) * 10) / 10)));
    }
  }, [me.data?.profile?.current_weight_kg, targetWeightKg]);

  const saveScreening = useMutation({
    mutationFn: () =>
      api<ScreeningState>("/v2/nutrition/safety-screening", {
        method: "PUT",
        idempotent: true,
        body: JSON.stringify({
          expectedVersion:
            screeningQ.data?.status === "complete" ? screeningQ.data.version : null,
          consentVersion: "nutrition-screening-consent-v1",
          ...answers,
        }),
      }),
    onSuccess: async () => {
      toast.success("Screening disimpan.");
      setErr(null);
      await qc.invalidateQueries({ queryKey: ["nutrition-screening"] });
      setStep("goal");
    },
    onError: (e: Error) => setErr(e.message),
  });

  const previewMut = useMutation({
    mutationFn: () => {
      const goal = buildGoalPayload(goalType, method, targetWeightKg, weeklyChangeKg, targetDate);
      return api<GoalPreview>("/v2/nutrition/preview", {
        method: "POST",
        body: JSON.stringify({ goal }),
      });
    },
    onSuccess: (data) => {
      setPreview(data);
      setAcceptedWarnings([]);
      setAggressiveOk(false);
      setConfirmStep(false);
      setErr(null);
      setStep("preview");
    },
    onError: (e: Error) => setErr(e.message),
  });

  const activateMut = useMutation({
    mutationFn: async () => {
      if (!preview?.previewId) throw new Error("Preview tidak tersedia.");
      const draft = await api<{ goal: { id: string; warningCodes: string[] } }>(
        "/v2/nutrition/goals",
        {
          method: "POST",
          idempotent: true,
          body: JSON.stringify({ previewId: preview.previewId }),
        },
      );
      const warnings = (draft.goal.warningCodes ?? preview.decision.warningCodes) as string[];
      return api(`/v2/nutrition/goals/${draft.goal.id}/activate`, {
        method: "POST",
        idempotent: true,
        body: JSON.stringify({
          acceptedWarningCodes: warnings,
          confirmationTextVersion:
            preview.expectedConfirmationTextVersion ?? "nutrition-goal-confirmation-v1",
          ...(warnings.includes("GOAL_RATE_AGGRESSIVE")
            ? { aggressiveRiskAccepted: true }
            : {}),
        }),
      });
    },
    onSuccess: async () => {
      toast.success("Target diaktifkan.");
      setPreview(null);
      setConfirmStep(false);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["nutrition-goal-current"] }),
        qc.invalidateQueries({ queryKey: ["nutrition-goal-history"] }),
        qc.invalidateQueries({ queryKey: ["dashboard"] }),
        qc.invalidateQueries({ queryKey: ["me"] }),
      ]);
      setStep("overview");
    },
    onError: (e: Error) => {
      if (e instanceof ApiError) setErr(e.message);
      else setErr(e.message);
    },
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) =>
      api(`/v2/nutrition/goals/${id}/cancel`, {
        method: "POST",
        idempotent: true,
        body: "{}",
      }),
    onSuccess: async () => {
      toast.success("Target dibatalkan.");
      await qc.invalidateQueries({ queryKey: ["nutrition-goal-current"] });
      await qc.invalidateQueries({ queryKey: ["nutrition-goal-history"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => setErr(e.message),
  });

  const confirmCompletionMut = useMutation({
    mutationFn: (id: string) =>
      api(`/v2/nutrition/goals/${id}/confirm-completion`, {
        method: "POST",
        idempotent: true,
        body: "{}",
      }),
    onSuccess: async () => {
      toast.success("Target ditandai selesai.");
      await qc.invalidateQueries({ queryKey: ["nutrition-goal-current"] });
      await qc.invalidateQueries({ queryKey: ["nutrition-goal-history"] });
    },
    onError: (e: Error) => setErr(e.message),
  });

  const reevaluateMut = useMutation({
    mutationFn: (id: string) =>
      api<{ goal?: { eligible?: boolean; status?: string } }>(
        `/v2/nutrition/goals/${id}/reevaluate-completion`,
        {
          method: "POST",
          idempotent: true,
          body: "{}",
        },
      ),
    onSuccess: async (data) => {
      toast.message(
        data.goal?.eligible
          ? "Target memenuhi syarat selesai."
          : "Belum eligible — butuh 2 hari pengukuran qualify.",
      );
      await qc.invalidateQueries({ queryKey: ["nutrition-goal-current"] });
    },
    onError: (e: Error) => setErr(e.message),
  });

  const current = currentQ.data?.goal ?? null;
  const basics = basicsQ.data;
  const adultOk = me.data?.adult_automatic_allowed !== false;

  const warnings = preview?.decision.warningCodes ?? [];
  const allWarningsAccepted =
    warnings.length === 0 ||
    warnings.every((w) => acceptedWarnings.includes(w));
  const needsAggressive = warnings.includes("GOAL_RATE_AGGRESSIVE");
  const canActivate =
    !!preview?.previewId &&
    preview.decision.automaticPlanAllowed &&
    allWarningsAccepted &&
    (!needsAggressive || aggressiveOk) &&
    (warnings.length === 0 || confirmStep);

  const weight = me.data?.profile?.current_weight_kg;

  const history = historyQ.data?.data ?? [];

  const subtitle = useMemo(() => {
    if (!adultOk) return "Mode pencatatan: target otomatis dewasa tidak tersedia untuk usia ini.";
    if (current) return `Target berjalan: ${current.status.replaceAll("_", " ")}`;
    return "Rancang target kalori dan berat dengan peninjauan keamanan.";
  }, [adultOk, current]);

  return (
    <div className="mesh-bg relative min-h-[100dvh]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.03] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')]" />

      <div className="relative mx-auto max-w-6xl space-y-8 px-4 py-10 md:py-14">
        <header
          className={cn(
            "space-y-5 opacity-0 animate-[fade-up_0.8s_cubic-bezier(0.32,0.72,0,1)_forwards]",
          )}
        >
          <Eyebrow>Nutrition v2</Eyebrow>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[hsl(var(--foreground))] md:text-5xl">
                Target yang tenang,
                <span className="block text-[hsl(var(--primary))]">terukur, dan aman.</span>
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:text-base">
                {subtitle} Semua angka adalah estimasi — bukan diagnosis.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/profile">
                <Button variant="outline">Profil</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary">Dashboard</Button>
              </Link>
            </div>
          </div>
          <StepRail step={step} onChange={setStep} />
        </header>

        {err ? <ErrorBox message={err} /> : null}

        {step === "overview" ? (
          <section className="grid gap-4 md:grid-cols-12">
            <div className={cn("md:col-span-7 opacity-0 animate-[fade-up_0.9s_cubic-bezier(0.32,0.72,0,1)_0.05s_forwards]")}>
              <Shell>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Eyebrow>Target berjalan</Eyebrow>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                      {current ? statusLabel(current.status) : "Belum ada target aktif"}
                    </h2>
                    <HelperText className="mt-2">
                      {current
                        ? `${typeLabel(current.type)} · ${current.method ?? "—"}`
                        : "Mulai dari screening, lalu susun target."}
                    </HelperText>
                  </div>
                  {current?.targetKcalPerDay != null ? (
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
                        Target kalori
                      </p>
                      <p className="text-3xl font-semibold tabular-nums tracking-tight">
                        {formatKcal(current.targetKcalPerDay)}
                      </p>
                    </div>
                  ) : null}
                </div>

                {current ? (
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <Metric
                      label="Berat target"
                      value={
                        current.targetWeightKg != null
                          ? `${current.targetWeightKg} kg`
                          : "—"
                      }
                    />
                    <Metric
                      label="Kelayakan"
                      value={feasibilityLabel(current.feasibility)}
                    />
                    <Metric
                      label="Diaktifkan"
                      value={
                        current.activatedAt
                          ? current.activatedAt.slice(0, 10)
                          : "—"
                      }
                    />
                  </div>
                ) : null}

                <div className="mt-8 flex flex-wrap gap-3">
                  {!current ? (
                    <PillCta onClick={() => setStep("screening")}>Mulai rancang target</PillCta>
                  ) : (
                    <>
                      <PillCta
                        variant="secondary"
                        onClick={() => reevaluateMut.mutate(current.id)}
                        loading={reevaluateMut.isPending}
                      >
                        Evaluasi penyelesaian
                      </PillCta>
                      {current.status === "eligible_for_completion" ? (
                        <PillCta
                          onClick={() => confirmCompletionMut.mutate(current.id)}
                          loading={confirmCompletionMut.isPending}
                        >
                          Konfirmasi selesai
                        </PillCta>
                      ) : null}
                      <PillCta
                        variant="ghost"
                        onClick={() => cancelMut.mutate(current.id)}
                        loading={cancelMut.isPending}
                      >
                        Batalkan target
                      </PillCta>
                    </>
                  )}
                </div>
              </Shell>
            </div>

            <div className="grid gap-4 md:col-span-5">
              <div className="opacity-0 animate-[fade-up_0.9s_cubic-bezier(0.32,0.72,0,1)_0.1s_forwards]">
                <Shell>
                  <Eyebrow>Metrik tubuh</Eyebrow>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">Estimasi dasar</h3>
                  {basicsQ.isLoading ? (
                    <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">Memuat…</p>
                  ) : basics?.available && basics.bmi ? (
                    <div className="mt-5 grid gap-3">
                      <Metric
                        label="BMI"
                        value={`${basics.bmi.value.toFixed(1)}`}
                        hint={bmiCategoryLabel(basics.bmi.category)}
                      />
                      <Metric
                        label="Kalori istirahat"
                        value={
                          basics.ree ? `${formatKcal(basics.ree.kcalPerDay)} kkal` : "—"
                        }
                        hint="Diperkirakan · Mifflin–St Jeor"
                      />
                      <Metric
                        label="Kebutuhan harian"
                        value={
                          basics.tdee ? `${formatKcal(basics.tdee.kcalPerDay)} kkal` : "—"
                        }
                        hint="Diperkirakan · aktivitas profil"
                      />
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {basics?.decision?.blockingCodes?.[0]
                        ? labelBlocking(basics.decision.blockingCodes[0])
                        : "Lengkapi profil untuk melihat estimasi."}
                    </p>
                  )}
                </Shell>
              </div>

              <div className="opacity-0 animate-[fade-up_0.9s_cubic-bezier(0.32,0.72,0,1)_0.15s_forwards]">
                <Shell>
                  <Eyebrow>Screening</Eyebrow>
                  <p className="mt-3 text-lg font-semibold tracking-tight">
                    {screeningQ.data?.status === "complete"
                      ? "Sudah diisi"
                      : "Belum lengkap"}
                  </p>
                  <HelperText className="mt-2">
                    Wajib sebelum target otomatis. Jawaban disimpan terenkripsi.
                  </HelperText>
                  <div className="mt-5">
                    <PillCta variant="secondary" onClick={() => setStep("screening")}>
                      {screeningQ.data?.status === "complete" ? "Perbarui" : "Isi screening"}
                    </PillCta>
                  </div>
                </Shell>
              </div>
            </div>
          </section>
        ) : null}

        {step === "screening" ? (
          <section className="opacity-0 animate-[fade-up_0.8s_cubic-bezier(0.32,0.72,0,1)_forwards]">
            <Shell>
              <div className="max-w-2xl">
                <Eyebrow>Keamanan</Eyebrow>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
                  Screening singkat
                </h2>
                <HelperText className="mt-2">
                  Jawaban `tidak tahu` atau `lebih baik tidak bilang` dianggap belum aman untuk
                  rencana otomatis.
                </HelperText>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {SCREENING_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className="rounded-[1.5rem] bg-[hsl(var(--muted))]/50 p-4 ring-1 ring-black/[0.03]"
                  >
                    <Label>{field.label}</Label>
                    <Select
                      value={answers[field.key]}
                      onChange={(e) =>
                        setAnswers((a) => ({
                          ...a,
                          [field.key]: e.target.value as ScreeningAnswers[keyof ScreeningAnswers],
                        }))
                      }
                    >
                      <option value="no">Tidak</option>
                      <option value="yes">Ya</option>
                      <option value="unknown">Tidak tahu</option>
                      <option value="prefer_not_to_say">Lebih baik tidak bilang</option>
                    </Select>
                    <HelperText className="mt-2">{field.hint}</HelperText>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <PillCta
                  onClick={() => saveScreening.mutate()}
                  loading={saveScreening.isPending}
                >
                  Simpan & lanjut
                </PillCta>
                <PillCta variant="ghost" onClick={() => setStep("overview")}>
                  Kembali
                </PillCta>
              </div>
            </Shell>
          </section>
        ) : null}

        {step === "goal" ? (
          <section className="grid gap-4 md:grid-cols-12 opacity-0 animate-[fade-up_0.8s_cubic-bezier(0.32,0.72,0,1)_forwards]">
            <div className="md:col-span-7">
              <Shell>
                <Eyebrow>Rencana</Eyebrow>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
                  Susun target
                </h2>
                <HelperText className="mt-2">
                  Berat saat ini: {weight ?? "—"} kg. Usia otomatis dihitung server.
                </HelperText>

                <div className="mt-8 space-y-5">
                  <div>
                    <Label>Tujuan</Label>
                    <Select
                      value={goalType}
                      onChange={(e) =>
                        setGoalType(e.target.value as "maintain" | "lose" | "gain")
                      }
                    >
                      <option value="maintain">Pertahankan</option>
                      <option value="lose">Turunkan berat</option>
                      <option value="gain">Naikkan berat</option>
                    </Select>
                  </div>

                  {goalType !== "maintain" ? (
                    <>
                      <div>
                        <Label>Metode</Label>
                        <Select
                          value={method}
                          onChange={(e) =>
                            setMethod(e.target.value as "weekly_rate" | "target_date")
                          }
                        >
                          <option value="weekly_rate">Laju mingguan</option>
                          <option value="target_date">Tanggal target</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Berat target (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min={20}
                          max={350}
                          value={targetWeightKg}
                          onChange={(e) => setTargetWeightKg(e.target.value)}
                        />
                      </div>
                      {method === "weekly_rate" ? (
                        <div>
                          <Label>Perubahan per minggu (kg)</Label>
                          <Input
                            type="number"
                            step="0.05"
                            min={0.05}
                            max={2}
                            value={weeklyChangeKg}
                            onChange={(e) => setWeeklyChangeKg(e.target.value)}
                          />
                          <HelperText className="mt-2">
                            Awal yang tenang: 0.25–0.5 kg/minggu. Maks sistem 0.9 kg atau 1% berat.
                          </HelperText>
                        </div>
                      ) : (
                        <div>
                          <Label>Tanggal target</Label>
                          <Input
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                          />
                          <HelperText className="mt-2">Maksimal 365 hari dari hari ini.</HelperText>
                        </div>
                      )}
                    </>
                  ) : (
                    <HelperText>
                      Mode pertahankan memakai perkiraan TDEE sebagai target kalori awal.
                    </HelperText>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <PillCta
                    onClick={() => previewMut.mutate()}
                    loading={previewMut.isPending}
                    disabled={!adultOk}
                  >
                    Pratinjau target
                  </PillCta>
                  <PillCta variant="ghost" onClick={() => setStep("screening")}>
                    Screening
                  </PillCta>
                </div>
                {!adultOk ? (
                  <p className="mt-4 text-sm text-amber-800">
                    {BLOCKING_COPY.AGE_UNSUPPORTED}
                  </p>
                ) : null}
              </Shell>
            </div>

            <div className="md:col-span-5">
              <Shell>
                <Eyebrow>Panduan</Eyebrow>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  <li>Target BMI turun di bawah 18.5 diblokir.</li>
                  <li>Kenaikan otomatis hanya jika BMI saat ini dan target &lt; 30.</li>
                  <li>Durasi weekly rate maksimal 52 minggu.</li>
                  <li>Target kalori di bawah REE selalu diblokir.</li>
                </ul>
              </Shell>
            </div>
          </section>
        ) : null}

        {step === "preview" && preview ? (
          <section className="space-y-4 opacity-0 animate-[fade-up_0.8s_cubic-bezier(0.32,0.72,0,1)_forwards]">
            <Shell>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Eyebrow>Pratinjau</Eyebrow>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
                    Hasil perhitungan
                  </h2>
                  <HelperText className="mt-2">
                    Berlaku 15 menit · single-use ·{" "}
                    {preview.expiresAt
                      ? `kedaluwarsa ${new Date(preview.expiresAt).toLocaleTimeString("id-ID")}`
                      : "—"}
                  </HelperText>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em]",
                    preview.decision.severity === "block" && "bg-red-50 text-red-700",
                    preview.decision.severity === "warning" && "bg-amber-50 text-amber-800",
                    preview.decision.severity === "none" && "bg-emerald-50 text-emerald-800",
                  )}
                >
                  {preview.decision.severity}
                </span>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Metric
                  label="BMI"
                  value={preview.bmi ? preview.bmi.value.toFixed(1) : "—"}
                  hint={
                    preview.bmi ? bmiCategoryLabel(preview.bmi.category) : undefined
                  }
                />
                <Metric
                  label="REE"
                  value={preview.ree ? `${formatKcal(preview.ree.kcalPerDay)}` : "—"}
                  hint="kkal/hari · estimasi"
                />
                <Metric
                  label="TDEE"
                  value={preview.tdee ? `${formatKcal(preview.tdee.kcalPerDay)}` : "—"}
                  hint="kkal/hari · estimasi"
                />
                <Metric
                  label="Target kalori"
                  value={
                    preview.calories
                      ? `${formatKcal(preview.calories.targetKcalPerDay)}`
                      : "Tidak tersedia"
                  }
                  hint={
                    preview.calories
                      ? `${preview.calories.adjustmentType} ${formatKcal(preview.calories.dailyAdjustmentKcal)}`
                      : "Diblokir safety gate"
                  }
                />
              </div>

              {preview.goal ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Metric
                    label="Durasi"
                    value={
                      preview.goal.estimatedWeeks != null
                        ? `${preview.goal.estimatedWeeks} mgg`
                        : "—"
                    }
                  />
                  <Metric
                    label="Kelayakan"
                    value={feasibilityLabel(preview.goal.feasibility)}
                  />
                  <Metric
                    label="Estimasi tanggal"
                    value={preview.goal.estimatedTargetDate ?? "—"}
                  />
                </div>
              ) : null}

              {preview.decision.blockingCodes.length > 0 ? (
                <div className="mt-6 rounded-[1.5rem] bg-red-50/80 p-4 ring-1 ring-red-100">
                  <p className="text-sm font-medium text-red-900">Tidak dapat diaktifkan</p>
                  <ul className="mt-2 space-y-1 text-sm text-red-800/90">
                    {preview.decision.blockingCodes.map((c) => (
                      <li key={c}>· {labelBlocking(c)}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {warnings.length > 0 && preview.decision.automaticPlanAllowed ? (
                <div className="mt-6 space-y-3 rounded-[1.5rem] bg-amber-50/80 p-4 ring-1 ring-amber-100">
                  <p className="text-sm font-medium text-amber-950">Perlu konfirmasi</p>
                  {warnings.map((code) => (
                    <label key={code} className="flex items-start gap-3 text-sm text-amber-950/90">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={acceptedWarnings.includes(code)}
                        onChange={(e) => {
                          setAcceptedWarnings((prev) =>
                            e.target.checked
                              ? [...prev, code]
                              : prev.filter((x) => x !== code),
                          );
                          setConfirmStep(false);
                        }}
                      />
                      <span>{labelWarning(code)}</span>
                    </label>
                  ))}
                  {needsAggressive ? (
                    <label className="flex items-start gap-3 text-sm font-medium text-amber-950">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={aggressiveOk}
                        onChange={(e) => {
                          setAggressiveOk(e.target.checked);
                          setConfirmStep(false);
                        }}
                      />
                      <span>
                        Saya memahami laju agresif dan tetap ingin melanjutkan.
                      </span>
                    </label>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                {preview.decision.automaticPlanAllowed ? (
                  !confirmStep && warnings.length > 0 ? (
                    <PillCta
                      onClick={() => setConfirmStep(true)}
                      disabled={!allWarningsAccepted || (needsAggressive && !aggressiveOk)}
                    >
                      Lanjut konfirmasi
                    </PillCta>
                  ) : (
                    <PillCta
                      onClick={() => activateMut.mutate()}
                      loading={activateMut.isPending}
                      disabled={!canActivate}
                    >
                      Aktifkan target
                    </PillCta>
                  )
                ) : (
                  <PillCta variant="secondary" onClick={() => setStep("goal")}>
                    Ubah rencana
                  </PillCta>
                )}
                <PillCta variant="ghost" onClick={() => setStep("goal")}>
                  Kembali
                </PillCta>
              </div>
            </Shell>
          </section>
        ) : null}

        {step === "history" ? (
          <section className="opacity-0 animate-[fade-up_0.8s_cubic-bezier(0.32,0.72,0,1)_forwards]">
            <Shell>
              <Eyebrow>Riwayat</Eyebrow>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
                Target lama & baru
              </h2>
              <HelperText className="mt-2">
                Menggabungkan target legacy v1 dan nutrition v2.
              </HelperText>
              <ul className="mt-8 divide-y divide-black/[0.04]">
                {history.length === 0 ? (
                  <li className="py-6 text-sm text-[hsl(var(--muted-foreground))]">
                    Belum ada riwayat.
                  </li>
                ) : (
                  history.map((item) => (
                    <li
                      key={`${item.origin}-${item.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 py-4"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {typeLabel(item.type)} · {item.origin === "legacy_v1" ? "v1" : "v2"}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {item.createdAt.slice(0, 10)} · {statusLabel(item.status)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">
                        {item.targetKcalPerDay != null
                          ? `${formatKcal(item.targetKcalPerDay)} kkal`
                          : "—"}
                      </p>
                    </li>
                  ))
                )}
              </ul>
              <div className="mt-6">
                <PillCta variant="ghost" onClick={() => setStep("overview")}>
                  Kembali
                </PillCta>
              </div>
            </Shell>
          </section>
        ) : null}
      </div>
    </div>
  );
}

type NutritionDecisionLike = {
  blockingCodes?: string[];
  warningCodes?: string[];
};

function buildGoalPayload(
  goalType: "maintain" | "lose" | "gain",
  method: "weekly_rate" | "target_date",
  targetWeightKg: string,
  weeklyChangeKg: string,
  targetDate: string,
): GoalPlan {
  if (goalType === "maintain") return { type: "maintain" };
  const tw = Number(targetWeightKg);
  if (!Number.isFinite(tw)) throw new Error("Berat target tidak valid.");
  if (method === "weekly_rate") {
    const wc = Number(weeklyChangeKg);
    if (!Number.isFinite(wc) || wc <= 0) throw new Error("Laju mingguan tidak valid.");
    return {
      type: goalType,
      method: "weekly_rate",
      targetWeightKg: tw,
      weeklyChangeKg: wc,
    };
  }
  if (!targetDate) throw new Error("Tanggal target wajib.");
  return {
    type: goalType,
    method: "target_date",
    targetWeightKg: tw,
    targetDate,
  };
}

function typeLabel(type: string) {
  if (type === "lose" || type === "lose_weight") return "Turun berat";
  if (type === "gain" || type === "gain_weight") return "Naik berat";
  if (type === "maintain") return "Pertahankan";
  if (type === "manual") return "Manual";
  return type;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: "Draf",
    active: "Aktif",
    eligible_for_completion: "Siap diselesaikan",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    replaced: "Diganti",
  };
  return map[status] ?? status;
}
