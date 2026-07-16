"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { Button, Card, ErrorBox, Input, Label, PageTitle, Select } from "@/components/ui";
import type { Me } from "@/lib/types";

type Preview = {
  bmr_kcal: number | null;
  tdee_kcal: number | null;
  calorie_target: number;
  disclaimer: string;
  onboarding_completed?: boolean;
};

const DRAFT_KEY = "atur_gizi_onboarding_draft_v1";

export default function OnboardingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    displayName: "",
    dateOfBirth: "2000-01-01",
    heightCm: 165,
    weightKg: 60,
    metabolicFormula: "mifflin_b",
    activityLevel: "moderate",
    fitnessGoal: "maintain",
    targetRate: 15,
    manualTarget: 2000,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta",
    unitSystem: "metric",
    estimatesAccepted: false,
  });
  const [preview, setPreview] = useState<Preview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { step?: number; form?: typeof form };
      if (parsed.form) setForm((f) => ({ ...f, ...parsed.form }));
      if (typeof parsed.step === "number") setStep(parsed.step);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, form }));
  }, [step, form]);

  const set = (k: string, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const previewMut = useMutation({
    mutationFn: () =>
      api<Preview>("/v1/onboarding/preview-target", {
        method: "POST",
        body: JSON.stringify({
          dateOfBirth: form.dateOfBirth,
          heightCm: Number(form.heightCm),
          weightKg: Number(form.weightKg),
          metabolicFormula: form.metabolicFormula,
          activityLevel: form.activityLevel,
          fitnessGoal: form.fitnessGoal,
          targetRate: Number(form.targetRate),
          manualTarget: Number(form.manualTarget),
        }),
      }),
    onSuccess: (d) => {
      setPreview(d);
      setErr(null);
    },
    onError: (e: Error) => setErr(e.message),
  });

  const completeMut = useMutation({
    mutationFn: () =>
      api<Preview>("/v1/onboarding/complete", {
        method: "POST",
        idempotent: true,
        body: JSON.stringify({
          displayName: form.displayName || undefined,
          dateOfBirth: form.dateOfBirth,
          heightCm: Number(form.heightCm),
          weightKg: Number(form.weightKg),
          metabolicFormula: form.metabolicFormula,
          activityLevel: form.activityLevel,
          fitnessGoal: form.fitnessGoal,
          targetRate: Number(form.targetRate),
          manualTarget: Number(form.manualTarget),
          timezone: form.timezone,
          unitSystem: form.unitSystem,
          estimatesAccepted: form.estimatesAccepted,
        }),
      }),
    onSuccess: async () => {
      localStorage.removeItem(DRAFT_KEY);
      await qc.invalidateQueries({ queryKey: ["me"] });
      await qc.fetchQuery({
        queryKey: ["me"],
        queryFn: async () => {
          await api("/v1/users/sync", { method: "POST", body: "{}" });
          return api<Me>("/v1/me");
        },
      });
      router.replace("/dashboard");
    },
    onError: (e: Error) => {
      if (e instanceof ApiError) setErr(e.message);
      else setErr(e.message);
    },
  });

  const steps = ["Profil", "Aktivitas & tujuan", "Preview & setuju"];

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <PageTitle
        title="Onboarding"
        subtitle={`Langkah ${step + 1}/3 · ${steps[step]}. Usia min. 15. Draft tersimpan lokal.`}
      />
      <div className="mb-4 flex gap-1">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-emerald-500" : "bg-slate-200"}`}
          />
        ))}
      </div>
      <Card className="space-y-4">
        {step === 0 ? (
          <>
            <div>
              <Label>Nama tampilan</Label>
              <Input value={form.displayName} onChange={(e) => set("displayName", e.target.value)} />
            </div>
            <div>
              <Label>Tanggal lahir</Label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tinggi (cm)</Label>
                <Input type="number" value={form.heightCm} onChange={(e) => set("heightCm", e.target.value)} />
              </div>
              <div>
                <Label>Berat (kg)</Label>
                <Input type="number" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={form.unitSystem} onChange={(e) => set("unitSystem", e.target.value)}>
                <option value="metric">Metrik</option>
                <option value="imperial">Imperial</option>
              </Select>
            </div>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <div>
              <Label>Formula metabolik</Label>
              <Select value={form.metabolicFormula} onChange={(e) => set("metabolicFormula", e.target.value)}>
                <option value="mifflin_a">Mifflin–St Jeor A</option>
                <option value="mifflin_b">Mifflin–St Jeor B</option>
                <option value="manual">Manual</option>
              </Select>
            </div>
            <div>
              <Label>Tingkat aktivitas</Label>
              <Select value={form.activityLevel} onChange={(e) => set("activityLevel", e.target.value)}>
                <option value="sedentary">Sangat rendah</option>
                <option value="light">Ringan</option>
                <option value="moderate">Sedang</option>
                <option value="high">Tinggi</option>
                <option value="very_high">Sangat tinggi</option>
              </Select>
            </div>
            <div>
              <Label>Tujuan</Label>
              <Select value={form.fitnessGoal} onChange={(e) => set("fitnessGoal", e.target.value)}>
                <option value="lose_weight">Menurunkan berat</option>
                <option value="maintain">Mempertahankan</option>
                <option value="gain_weight">Meningkatkan</option>
                <option value="manual">Target manual</option>
              </Select>
            </div>
            {form.fitnessGoal === "manual" || form.metabolicFormula === "manual" ? (
              <div>
                <Label>Target kalori manual</Label>
                <Input type="number" value={form.manualTarget} onChange={(e) => set("manualTarget", e.target.value)} />
              </div>
            ) : null}
          </>
        ) : null}
        {step === 2 ? (
          <>
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.estimatesAccepted}
                onChange={(e) => set("estimatesAccepted", e.target.checked)}
                className="mt-1"
              />
              Saya memahami semua angka adalah estimasi, bukan nasihat medis.
            </label>
            {preview ? (
              <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
                <p>BMR: {preview.bmr_kcal ?? "—"} kkal</p>
                <p>TDEE: {preview.tdee_kcal ?? "—"} kkal</p>
                <p className="font-semibold">Target harian: {preview.calorie_target} kkal</p>
                <p className="mt-2 text-xs">{preview.disclaimer}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Tekan Preview target sebelum menyimpan.</p>
            )}
          </>
        ) : null}
        {err ? <ErrorBox message={err} /> : null}
        <div className="flex flex-wrap gap-2">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Kembali
            </Button>
          ) : null}
          {step < 2 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              Lanjut
            </Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => previewMut.mutate()} disabled={previewMut.isPending}>
                Preview target
              </Button>
              <Button
                type="button"
                onClick={() => completeMut.mutate()}
                disabled={completeMut.isPending || !form.estimatesAccepted}
              >
                {completeMut.isPending ? "Menyimpan..." : "Simpan & lanjut"}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
