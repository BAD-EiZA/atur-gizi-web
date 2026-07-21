"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { fmtMacro, kcalFromMacros } from "@/lib/nutrition";
import { Button, Card, EmptyState, ErrorBox, Input, Label, PageTitle, Select } from "@/components/ui";
import { InfoTip, LabelWithTip } from "@/components/info-tip";

type Plan = {
  id: string;
  title: string;
  plan_date: string;
  meal_type: string;
  total_calories: number;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
};

export default function MealPlansPage() {
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [mealType, setMealType] = useState("lunch");
  const [calories, setCalories] = useState(500);
  const [proteinG, setProteinG] = useState(0);
  const [carbsG, setCarbsG] = useState(0);
  const [fatG, setFatG] = useState(0);

  const setMacro = (key: "p" | "c" | "f", value: number) => {
    const p = key === "p" ? value : proteinG;
    const c = key === "c" ? value : carbsG;
    const f = key === "f" ? value : fatG;
    if (key === "p") setProteinG(value);
    if (key === "c") setCarbsG(value);
    if (key === "f") setFatG(value);
    setCalories(kcalFromMacros(p, c, f) || calories);
  };

  const list = useQuery({
    queryKey: ["meal-plans"],
    queryFn: () => api<{ data: Plan[] }>("/v1/meal-plans"),
  });

  const create = useMutation({
    mutationFn: () =>
      api("/v1/meal-plans", {
        method: "POST",
        body: JSON.stringify({
          title,
          planDate,
          mealType,
          totalCalories: Number(calories),
          proteinG: Number(proteinG) || undefined,
          carbsG: Number(carbsG) || undefined,
          fatG: Number(fatG) || undefined,
          items: [
            {
              name: title,
              calories: Number(calories),
              protein_g: Number(proteinG) || undefined,
              carbs_g: Number(carbsG) || undefined,
              fat_g: Number(fatG) || undefined,
            },
          ],
        }),
      }),
    onSuccess: async () => {
      setTitle("");
      setProteinG(0);
      setCarbsG(0);
      setFatG(0);
      await qc.invalidateQueries({ queryKey: ["meal-plans"] });
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <div className="animate-fade-up space-y-4">
      <PageTitle
        title="Rencana makan"
        subtitle="Meal plan sederhana per tanggal dengan makro."
        actions={<InfoTip tip="meal_plan" />}
      />
      <Card className="space-y-2">
        <div>
          <Label>Judul</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Tanggal</Label>
            <Input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} />
          </div>
          <div>
            <LabelWithTip tip="atwater">Kalori</LabelWithTip>
            <Input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <LabelWithTip tip="protein" className="text-xs">
              Protein (g)
            </LabelWithTip>
            <Input type="number" step="0.1" value={proteinG} onChange={(e) => setMacro("p", Number(e.target.value))} />
          </div>
          <div>
            <LabelWithTip tip="carbs" className="text-xs">
              Karbohidrat
            </LabelWithTip>
            <Input type="number" step="0.1" value={carbsG} onChange={(e) => setMacro("c", Number(e.target.value))} />
          </div>
          <div>
            <LabelWithTip tip="fat" className="text-xs">
              Lemak (g)
            </LabelWithTip>
            <Input type="number" step="0.1" value={fatG} onChange={(e) => setMacro("f", Number(e.target.value))} />
          </div>
        </div>
        <Select value={mealType} onChange={(e) => setMealType(e.target.value)}>
          <option value="breakfast">Sarapan</option>
          <option value="lunch">Siang</option>
          <option value="dinner">Malam</option>
          <option value="snack">Camilan</option>
        </Select>
        {err ? <ErrorBox message={err} /> : null}
        <Button onClick={() => create.mutate()} disabled={!title || create.isPending}>
          Tambah rencana
        </Button>
      </Card>
      <Card>
        {(list.data?.data.length ?? 0) === 0 ? (
          <EmptyState title="Belum ada meal plan." />
        ) : (
          <ul className="divide-y text-sm">
            {list.data!.data.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-slate-500">
                    {p.plan_date} · {p.meal_type} · {p.total_calories} kkal
                    {p.protein_g != null || p.carbs_g != null || p.fat_g != null
                      ? ` · P ${fmtMacro(Number(p.protein_g) || 0)} · K ${fmtMacro(Number(p.carbs_g) || 0)} · L ${fmtMacro(Number(p.fat_g) || 0)}`
                      : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await api(`/v1/meal-plans/${p.id}`, { method: "DELETE" });
                    await qc.invalidateQueries({ queryKey: ["meal-plans"] });
                  }}
                >
                  Hapus
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
