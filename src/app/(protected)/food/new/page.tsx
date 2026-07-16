"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import {
  Button,
  Card,
  ErrorBox,
  HelperText,
  Input,
  Label,
  PageTitle,
  Select,
} from "@/components/ui";

type Fav = {
  id: string;
  name: string;
  portion_amount: number;
  portion_unit: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
};

export default function NewFoodPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    mealType: "lunch",
    name: "",
    portionAmount: 1,
    portionUnit: "porsi",
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    notes: "",
  });

  const favs = useQuery({
    queryKey: ["favorites-foods"],
    queryFn: () => api<{ data: Fav[] }>("/v1/favorites/foods"),
  });

  const macroKcal = useMemo(
    () => Math.round(Number(form.proteinG) * 4 + Number(form.carbsG) * 4 + Number(form.fatG) * 9),
    [form.proteinG, form.carbsG, form.fatG],
  );
  const macroDiff = Math.abs(macroKcal - Number(form.calories));
  const showMacroWarn = macroKcal > 0 && form.calories > 0 && macroDiff > 80;

  const canSave =
    form.name.trim().length > 0 &&
    Number(form.portionAmount) > 0 &&
    Number(form.calories) >= 0 &&
    Number(form.calories) < 20000;

  const mut = useMutation({
    mutationFn: () =>
      api("/v1/food-logs", {
        method: "POST",
        idempotent: true,
        body: JSON.stringify({
          consumedAt: new Date().toISOString(),
          mealType: form.mealType,
          title: form.name,
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
      toast.success("Catatan makanan tersimpan. Total hari ini diperbarui.");
      router.push("/dashboard");
    },
    onError: (e: Error) => setErr(e.message),
  });

  const applyFav = (f: Fav) => {
    setForm((prev) => ({
      ...prev,
      name: f.name,
      portionAmount: f.portion_amount,
      portionUnit: f.portion_unit,
      calories: f.calories,
      proteinG: f.protein_g ?? 0,
      carbsG: f.carbs_g ?? 0,
      fatG: f.fat_g ?? 0,
    }));
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        title="Catat makanan"
        subtitle="Input manual. Semua angka divalidasi di server. Estimasi dapat dikoreksi kapan saja."
      />

      {(favs.data?.data.length ?? 0) > 0 ? (
        <Card className="mb-4">
          <p className="mb-2 text-sm font-medium">Dari favorit</p>
          <div className="flex flex-wrap gap-2">
            {favs.data!.data.slice(0, 8).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => applyFav(f)}
                className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-medium hover:border-[hsl(var(--primary)/0.4)]"
              >
                {f.name} · {f.calories} kkal
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="space-y-4">
        <div>
          <Label htmlFor="mealType">Jenis makan</Label>
          <Select
            id="mealType"
            value={form.mealType}
            onChange={(e) => setForm({ ...form, mealType: e.target.value })}
          >
            <option value="breakfast">Sarapan</option>
            <option value="lunch">Makan siang</option>
            <option value="dinner">Makan malam</option>
            <option value="snack">Camilan</option>
            <option value="other">Lainnya</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="name">Nama makanan</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Contoh: Nasi putih + ayam goreng"
            required
          />
          <HelperText>Nama ini menjadi judul catatan.</HelperText>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="portion">Jumlah</Label>
            <Input
              id="portion"
              type="number"
              min={0.01}
              step="any"
              value={form.portionAmount}
              onChange={(e) => setForm({ ...form, portionAmount: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="unit">Satuan</Label>
            <Input
              id="unit"
              value={form.portionUnit}
              onChange={(e) => setForm({ ...form, portionUnit: e.target.value })}
              placeholder="porsi, g, centong..."
            />
          </div>
          <div>
            <Label htmlFor="kcal">Kalori (kkal)</Label>
            <Input
              id="kcal"
              type="number"
              min={0}
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Makronutrien (opsional)</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="p">Protein (g)</Label>
              <Input
                id="p"
                type="number"
                min={0}
                value={form.proteinG}
                onChange={(e) => setForm({ ...form, proteinG: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="c">Karbohidrat (g)</Label>
              <Input
                id="c"
                type="number"
                min={0}
                value={form.carbsG}
                onChange={(e) => setForm({ ...form, carbsG: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="f">Lemak (g)</Label>
              <Input
                id="f"
                type="number"
                min={0}
                value={form.fatG}
                onChange={(e) => setForm({ ...form, fatG: Number(e.target.value) })}
              />
            </div>
          </div>
          {macroKcal > 0 ? (
            <HelperText>Estimasi dari makro: ~{macroKcal} kkal (P4 + K4 + L9).</HelperText>
          ) : null}
          {showMacroWarn ? (
            <p className="mt-2 text-xs text-amber-800">
              Angka kalori dan makro berbeda cukup jauh (~{macroDiff} kkal). Periksa kembali sebelum
              menyimpan.
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="notes">Catatan (opsional)</Label>
          <Input
            id="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Mis. porsi rumah, restoran, dll."
          />
        </div>
        {err ? <ErrorBox message={err} /> : null}
        {!canSave && form.name === "" ? (
          <HelperText>Isi nama makanan untuk mengaktifkan tombol simpan.</HelperText>
        ) : null}
        <div className="sticky bottom-20 z-10 flex flex-wrap gap-2 border-t border-[hsl(var(--border))] bg-white/95 pt-3 md:static md:border-0 md:bg-transparent md:pt-0">
          <Button onClick={() => mut.mutate()} loading={mut.isPending} disabled={!canSave}>
            Simpan catatan
          </Button>
          <Button variant="ghost" type="button" onClick={() => router.push("/food/scan")}>
            Pindai foto saja
          </Button>
        </div>
      </Card>
    </div>
  );
}
