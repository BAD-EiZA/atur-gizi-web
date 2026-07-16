"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button, Card, ErrorBox, Input, Label, PageTitle, Select } from "@/components/ui";

export default function NewFoodPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);
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
    notes: "",
  });

  const mut = useMutation({
    mutationFn: () =>
      api("/v1/food-logs", {
        method: "POST",
        idempotent: true,
        body: JSON.stringify({
          consumedAt: new Date().toISOString(),
          mealType: form.mealType,
          title: form.title || form.name,
          notes: form.notes || undefined,
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
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/dashboard");
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <div>
      <PageTitle title="Catat makanan" subtitle="Input manual. Semua angka divalidasi di server." />
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
          <Label>Judul (opsional)</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <Label>Nama makanan</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label>Porsi</Label>
            <Input type="number" value={form.portionAmount} onChange={(e) => setForm({ ...form, portionAmount: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Satuan</Label>
            <Input value={form.portionUnit} onChange={(e) => setForm({ ...form, portionUnit: e.target.value })} />
          </div>
          <div>
            <Label>Kalori</Label>
            <Input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label>Protein (g)</Label>
            <Input type="number" value={form.proteinG} onChange={(e) => setForm({ ...form, proteinG: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Karbo (g)</Label>
            <Input type="number" value={form.carbsG} onChange={(e) => setForm({ ...form, carbsG: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Lemak (g)</Label>
            <Input type="number" value={form.fatG} onChange={(e) => setForm({ ...form, fatG: Number(e.target.value) })} />
          </div>
        </div>
        {err ? <ErrorBox message={err} /> : null}
        <Button onClick={() => mut.mutate()} disabled={mut.isPending || !form.name}>
          Simpan
        </Button>
      </Card>
    </div>
  );
}
