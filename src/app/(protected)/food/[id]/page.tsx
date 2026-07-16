"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api-client";
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
      proteinG: item?.protein_g ?? 0,
      carbsG: item?.carbs_g ?? 0,
      fatG: item?.fat_g ?? 0,
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
          proteinG: item?.protein_g,
          carbsG: item?.carbs_g,
          fatG: item?.fat_g,
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
        <Card className="space-y-2 text-sm">
          <p className="text-lg font-semibold">{q.data.title}</p>
          <p>
            {q.data.meal_type} · {q.data.total_calories} kkal
          </p>
          <ul className="divide-y">
            {q.data.items.map((i, idx) => (
              <li key={i.id ?? idx} className="py-2">
                {i.name} — {i.portion_amount} {i.portion_unit} · {i.calories} kkal
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
            <Input type="number" value={form.portionAmount} onChange={(e) => setForm({ ...form, portionAmount: Number(e.target.value) })} />
            <Input value={form.portionUnit} onChange={(e) => setForm({ ...form, portionUnit: e.target.value })} />
            <Input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })} />
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
