"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button, Card, EmptyState, ErrorBox, Input, Label, PageTitle, Select } from "@/components/ui";

type Plan = {
  id: string;
  title: string;
  plan_date: string;
  meal_type: string;
  total_calories: number;
};

export default function MealPlansPage() {
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [mealType, setMealType] = useState("lunch");
  const [calories, setCalories] = useState(500);

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
          items: [{ name: title, calories: Number(calories) }],
        }),
      }),
    onSuccess: async () => {
      setTitle("");
      await qc.invalidateQueries({ queryKey: ["meal-plans"] });
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <div className="animate-fade-up space-y-4">
      <PageTitle title="Rencana makan" subtitle="Meal plan sederhana per tanggal." />
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
            <Label>Kalori</Label>
            <Input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} />
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
