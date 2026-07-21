"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { fmtMacro, kcalFromMacros } from "@/lib/nutrition";
import type { FoodLog } from "@/lib/types";
import { Button, Card, ErrorBox, Input, Label, PageTitle, Select } from "@/components/ui";

export default function FoodDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const q = useQuery({
    queryKey: ["food", id],
    queryFn: () => api<FoodLog>(`/v1/food-logs/${id}`),
  });

  const [form, setForm] = useState({
    title: "",
    mealType: "lunch",
    name: "",
    portionAmount: 1,
    portionUnit: "serving",
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
  });

  const setMacro = (key: "proteinG" | "carbsG" | "fatG", value: number) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      next.calories = kcalFromMacros(next.proteinG, next.carbsG, next.fatG);
      return next;
    });
  };

  const startEdit = () => {
    if (!q.data) return;
    const item = q.data.items[0];
    setForm({
      title: q.data.title,
      mealType: q.data.meal_type,
      name: item?.name ?? q.data.title,
      portionAmount: item?.portion_amount ?? 1,
      portionUnit: item?.portion_unit ?? "serving",
      calories: item?.calories ?? q.data.total_calories,
      proteinG: Number(item?.protein_g ?? q.data.protein_g ?? 0),
      carbsG: Number(item?.carbs_g ?? q.data.carbs_g ?? 0),
      fatG: Number(item?.fat_g ?? q.data.fat_g ?? 0),
    });
    setEditing(true);
  };

  const save = useMutation({
    mutationFn: () =>
      api(`/v1/food-logs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title || form.name,
          mealType: form.mealType,
          items: [
            {
              name: form.name,
              portionAmount: Number(form.portionAmount),
              portionUnit: form.portionUnit,
              calories: Number(form.calories),
              proteinG: Number(form.proteinG) || undefined,
              carbsG: Number(form.carbsG) || undefined,
              fatG: Number(form.fatG) || undefined,
            },
          ],
        }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["food", id] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      setEditing(false);
    },
    onError: (e: Error) => setErr(e.message),
  });

  const remove = useMutation({
    mutationFn: () => api(`/v1/food-logs/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/history");
    },
    onError: (e: Error) => setErr(e.message),
  });

  const fav = useMutation({
    mutationFn: () => {
      const item = q.data?.items[0];
      return api("/v1/favorites/foods", {
        method: "POST",
        body: JSON.stringify({
          name: item?.name ?? q.data?.title,
          portionAmount: item?.portion_amount ?? 1,
          portionUnit: item?.portion_unit ?? "serving",
          calories: item?.calories ?? q.data?.total_calories,
          proteinG: item?.protein_g ?? q.data?.protein_g,
          carbsG: item?.carbs_g ?? q.data?.carbs_g,
          fatG: item?.fat_g ?? q.data?.fat_g,
        }),
      });
    },
  });

  if (q.isLoading) return <p className="text-sm text-slate-500">Memuat...</p>;
  if (!q.data) return <ErrorBox message="Log tidak ditemukan." />;

  return (
    <div>
      <PageTitle title="Detail makanan" subtitle={q.data.log_date} />
      {err ? <ErrorBox message={err} /> : null}
      {!editing ? (
        <Card className="space-y-3 text-sm">
          <p className="text-lg font-semibold">{q.data.title}</p>
          <p className="text-[hsl(var(--muted-foreground))]">{q.data.meal_type}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-[hsl(var(--border))] px-3 py-2">
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Kalori</p>
              <p className="font-semibold tabular-nums">{q.data.total_calories} kkal</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] px-3 py-2">
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Protein</p>
              <p className="font-semibold tabular-nums">{fmtMacro(Number(q.data.protein_g) || 0)} g</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] px-3 py-2">
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Karbohidrat</p>
              <p className="font-semibold tabular-nums">{fmtMacro(Number(q.data.carbs_g) || 0)} g</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] px-3 py-2">
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Lemak</p>
              <p className="font-semibold tabular-nums">{fmtMacro(Number(q.data.fat_g) || 0)} g</p>
            </div>
          </div>
          <ul className="divide-y">
            {q.data.items.map((i, idx) => (
              <li key={i.id ?? idx} className="py-2">
                <p>
                  {i.name} — {i.portion_amount} {i.portion_unit} · {i.calories} kkal
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  P {fmtMacro(Number(i.protein_g) || 0)}g · K {fmtMacro(Number(i.carbs_g) || 0)}g · L{" "}
                  {fmtMacro(Number(i.fat_g) || 0)}g
                </p>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={startEdit}>Edit</Button>
            <Button variant="secondary" onClick={() => fav.mutate()}>
              Simpan favorit
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm("Hapus log makanan ini?")) remove.mutate();
              }}
            >
              Hapus
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="space-y-3">
          <div>
            <Label>Jenis makan</Label>
            <Select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })}>
              <option value="breakfast">Sarapan</option>
              <option value="lunch">Makan siang</option>
              <option value="dinner">Makan malam</option>
              <option value="snack">Camilan</option>
              <option value="other">Lainnya</option>
            </Select>
          </div>
          <div>
            <Label>Nama</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Porsi</Label>
              <Input
                type="number"
                value={form.portionAmount}
                onChange={(e) => setForm({ ...form, portionAmount: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">Satuan</Label>
              <Input
                value={form.portionUnit}
                onChange={(e) => setForm({ ...form, portionUnit: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Kalori</Label>
              <Input
                type="number"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Protein (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.proteinG}
                onChange={(e) => setMacro("proteinG", Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-xs">Karbohidrat (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.carbsG}
                onChange={(e) => setMacro("carbsG", Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-xs">Lemak (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.fatG}
                onChange={(e) => setMacro("fatG", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              Simpan
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Batal
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
