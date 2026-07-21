"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { atwaterWarning, kcalFromMacros, PORTION_UNITS } from "@/lib/nutrition";
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

type SearchHit = {
  name: string;
  calories?: number;
  unit?: string;
  source?: string;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
};

export default function NewFoodPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const [searchQ, setSearchQ] = useState("");
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);

  useEffect(() => {
    const name = searchParams.get("name");
    if (!name) return;
    const proteinG = Number(searchParams.get("protein") ?? searchParams.get("protein_g") ?? 0);
    const carbsG = Number(searchParams.get("carbs") ?? searchParams.get("carbs_g") ?? 0);
    const fatG = Number(searchParams.get("fat") ?? searchParams.get("fat_g") ?? 0);
    const caloriesParam = searchParams.get("calories");
    const fromMacros = kcalFromMacros(proteinG, carbsG, fatG);
    setForm((f) => ({
      ...f,
      name,
      proteinG: proteinG || f.proteinG,
      carbsG: carbsG || f.carbsG,
      fatG: fatG || f.fatG,
      calories: caloriesParam
        ? Number(caloriesParam)
        : fromMacros > 0
          ? fromMacros
          : f.calories,
    }));
  }, [searchParams]);

  const favs = useQuery({
    queryKey: ["favorites-foods"],
    queryFn: () => api<{ data: Fav[] }>("/v1/favorites/foods"),
  });

  const searchMut = useMutation({
    mutationFn: () =>
      api<{
        from_catalog: Array<{
          name: string;
          calories: number;
          unit: string;
          source?: string;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
        }>;
        from_memory: Array<{
          name: string;
          calories?: number | null;
          source?: string;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
        }>;
        from_ai: Array<{
          name: string;
          calories?: number;
          unit?: string;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
        }>;
      }>(`/v1/ai/food-search?q=${encodeURIComponent(searchQ)}`),
    onSuccess: (data) => {
      const hits: SearchHit[] = [
        ...data.from_memory.map((m) => ({
          name: m.name,
          calories: m.calories ?? undefined,
          protein_g: m.protein_g ?? undefined,
          carbs_g: m.carbs_g ?? undefined,
          fat_g: m.fat_g ?? undefined,
          source: "memory",
        })),
        ...data.from_catalog.map((c) => ({
          name: c.name,
          calories: c.calories,
          unit: c.unit,
          protein_g: c.protein_g,
          carbs_g: c.carbs_g,
          fat_g: c.fat_g,
          source: "catalog",
        })),
        ...(data.from_ai ?? []).map((a) => ({
          name: a.name,
          calories: a.calories,
          unit: a.unit,
          protein_g: a.protein_g,
          carbs_g: a.carbs_g,
          fat_g: a.fat_g,
          source: "ai",
        })),
      ];
      setSearchHits(hits);
    },
  });

  const setMacro = (key: "proteinG" | "carbsG" | "fatG", value: number) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      next.calories = kcalFromMacros(next.proteinG, next.carbsG, next.fatG);
      return next;
    });
  };

  const macroKcal = useMemo(
    () => kcalFromMacros(form.proteinG, form.carbsG, form.fatG),
    [form.proteinG, form.carbsG, form.fatG],
  );
  const atwWarn = atwaterWarning(form.calories, form.proteinG, form.carbsG, form.fatG);

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
    <div className="mx-auto max-w-3xl animate-fade-up">
      <PageTitle
        title="Catat makanan"
        subtitle="Input manual. Semua angka divalidasi di server. Estimasi dapat dikoreksi kapan saja."
      />

      <Card className="mb-4 space-y-3 border-[hsl(var(--primary)/0.12)] bg-gradient-to-br from-emerald-50/40 to-white">
        <p className="text-sm font-semibold">Pencarian cerdas</p>
        <div className="flex flex-wrap gap-2">
          <Input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Cari: naspad, ayam geprek, kopi pagi..."
            className="min-w-[12rem] flex-1"
          />
          <Button
            variant="secondary"
            loading={searchMut.isPending}
            disabled={!searchQ.trim()}
            onClick={() => searchMut.mutate()}
          >
            Cari AI
          </Button>
        </div>
        {searchHits.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {searchHits.slice(0, 10).map((h, i) => (
              <button
                key={`${h.name}-${i}`}
                type="button"
                className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-medium"
                onClick={() => {
                  const p = Number(h.protein_g) || 0;
                  const c = Number(h.carbs_g) || 0;
                  const f = Number(h.fat_g) || 0;
                  const fromM = kcalFromMacros(p, c, f);
                  setForm((prev) => ({
                    ...prev,
                    name: h.name,
                    portionUnit: h.unit ?? prev.portionUnit,
                    proteinG: p || prev.proteinG,
                    carbsG: c || prev.carbsG,
                    fatG: f || prev.fatG,
                    calories:
                      h.calories ??
                      (fromM > 0 ? fromM : prev.calories),
                  }));
                }}
              >
                {h.name}
                {h.calories != null ? ` · ${h.calories} kkal` : ""}
                {h.source ? ` · ${h.source}` : ""}
              </button>
            ))}
          </div>
        ) : null}
      </Card>

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

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canSave) mut.mutate();
        }}
      >
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
            <Select
              id="unit"
              value={form.portionUnit}
              onChange={(e) => setForm({ ...form, portionUnit: e.target.value })}
            >
              {PORTION_UNITS.map((u) => (
                <option key={u.unit} value={u.unit}>
                  {u.unit}
                  {u.hint ? ` — ${u.hint}` : ""}
                </option>
              ))}
            </Select>
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
                step="0.1"
                value={form.proteinG}
                onChange={(e) => setMacro("proteinG", Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="c">Karbohidrat (g)</Label>
              <Input
                id="c"
                type="number"
                min={0}
                step="0.1"
                value={form.carbsG}
                onChange={(e) => setMacro("carbsG", Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="f">Lemak (g)</Label>
              <Input
                id="f"
                type="number"
                min={0}
                step="0.1"
                value={form.fatG}
                onChange={(e) => setMacro("fatG", Number(e.target.value))}
              />
            </div>
          </div>
          {macroKcal > 0 ? (
            <HelperText>
              Kalori dihitung otomatis dari makro (~{macroKcal} kkal: P×4 + K×4 + L×9). Bisa diubah
              manual.
            </HelperText>
          ) : null}
          {atwWarn ? <p className="mt-2 text-xs text-amber-800">{atwWarn}</p> : null}
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
          <Button type="submit" loading={mut.isPending} disabled={!canSave}>
            Simpan catatan
          </Button>
          <Button variant="ghost" type="button" onClick={() => router.push("/food/scan")}>
            Pindai foto saja
          </Button>
        </div>
      </Card>
      </form>
    </div>
  );
}
