"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, track } from "@/lib/api-client";
import { fmtMacro } from "@/lib/nutrition";
import { Button, Card, ErrorBox, Input, Label, PageTitle, Select } from "@/components/ui";
import { InfoTip, LabelWithTip } from "@/components/info-tip";

type Product = {
  id: string;
  barcode: string;
  name: string;
  brand: string | null;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  serving_size?: string | null;
  nutrient_basis?: string | null;
  serving_quantity_g?: number | null;
  calories_100g?: number | null;
  calories_serving?: number | null;
  protein_100g?: number | null;
  carbs_100g?: number | null;
  fat_100g?: number | null;
  protein_serving?: number | null;
  carbs_serving?: number | null;
  fat_serving?: number | null;
};

export default function BarcodePage() {
  const [code, setCode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [basis, setBasis] = useState<"serving" | "100g" | "custom">("serving");
  const [grams, setGrams] = useState(100);
  const [servings, setServings] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const qc = useQueryClient();

  const lookup = useMutation({
    mutationFn: () => api<Product>(`/v1/barcodes/${encodeURIComponent(code.trim())}`),
    onSuccess: (p) => {
      setProduct(p);
      setBasis(p.nutrient_basis === "100g" ? "100g" : "serving");
      setGrams(p.serving_quantity_g && p.serving_quantity_g > 0 ? p.serving_quantity_g : 100);
      setServings(1);
      setErr(null);
      void track("barcode_lookup");
    },
    onError: (e: Error) => {
      setProduct(null);
      setErr(e.message);
    },
  });

  const nutrition = useMemo(() => {
    if (!product) return null;
    if (basis === "100g") {
      const kcal = product.calories_100g ?? product.calories;
      const scale = grams / 100;
      return {
        calories: Math.round(kcal * scale),
        protein: (Number(product.protein_100g ?? product.protein_g) || 0) * scale,
        carbs: (Number(product.carbs_100g ?? product.carbs_g) || 0) * scale,
        fat: (Number(product.fat_100g ?? product.fat_g) || 0) * scale,
        unit: `${grams} g`,
        amount: grams,
      };
    }
    if (basis === "custom") {
      const per100 = product.calories_100g ?? product.calories;
      const scale = grams / 100;
      return {
        calories: Math.round(per100 * scale),
        protein: (Number(product.protein_100g ?? product.protein_g) || 0) * scale,
        carbs: (Number(product.carbs_100g ?? product.carbs_g) || 0) * scale,
        fat: (Number(product.fat_100g ?? product.fat_g) || 0) * scale,
        unit: `${grams} g`,
        amount: grams,
      };
    }
    // serving
    const kcal = product.calories_serving ?? product.calories;
    const s = Math.max(0.1, servings);
    return {
      calories: Math.round(kcal * s),
      protein: (Number(product.protein_serving ?? product.protein_g) || 0) * s,
      carbs: (Number(product.carbs_serving ?? product.carbs_g) || 0) * s,
      fat: (Number(product.fat_serving ?? product.fat_g) || 0) * s,
      unit: product.serving_size || "serving",
      amount: s,
    };
  }, [product, basis, grams, servings]);

  const log = useMutation({
    mutationFn: () => {
      if (!product || !nutrition) throw new Error("Tidak ada produk");
      return api("/v1/food-logs", {
        method: "POST",
        idempotent: true,
        body: JSON.stringify({
          consumedAt: new Date().toISOString(),
          mealType: "snack",
          title: product.name,
          items: [
            {
              name: product.name,
              portionAmount: nutrition.amount,
              portionUnit: nutrition.unit,
              calories: nutrition.calories,
              proteinG: nutrition.protein || undefined,
              carbsG: nutrition.carbs || undefined,
              fatG: nutrition.fat || undefined,
            },
          ],
        }),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/dashboard");
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <div className="animate-fade-up">
      <PageTitle
        title="Barcode"
        subtitle="Open Food Facts + demo: 8991002101151, 8996001301135, 8999999000001"
      />
      <Card className="space-y-3">
        <div>
          <Label>Kode barcode</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Scan / ketik barcode" />
        </div>
        <Button onClick={() => lookup.mutate()} disabled={!code.trim() || lookup.isPending}>
          Cari
        </Button>
        {err ? <ErrorBox message={err} /> : null}
        {product && nutrition ? (
          <div className="space-y-3 rounded-xl bg-emerald-50 p-3 text-sm">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-slate-600">{product.brand ?? "—"}</p>
              <p className="mt-1 inline-flex flex-wrap items-center gap-1 text-xs text-slate-500">
                <span>
                  Basis data: {product.nutrient_basis ?? "serving"}
                  {product.serving_size ? ` · label ${product.serving_size}` : ""}
                </span>
                <InfoTip tip="nutrient_basis" side="bottom" />
              </p>
            </div>
            <div>
              <LabelWithTip tip="nutrient_basis" className="text-xs">
                Hitung sebagai
              </LabelWithTip>
              <Select
                value={basis}
                onChange={(e) => setBasis(e.target.value as "serving" | "100g" | "custom")}
              >
                <option value="serving">Per serving label</option>
                <option value="100g">Per 100 g (skala gram)</option>
                <option value="custom">Custom gram</option>
              </Select>
            </div>
            {basis === "serving" ? (
              <div>
                <Label className="text-xs">Jumlah serving</Label>
                <Input
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                />
              </div>
            ) : (
              <div>
                <Label className="text-xs">Gram</Label>
                <Input
                  type="number"
                  min={1}
                  value={grams}
                  onChange={(e) => setGrams(Number(e.target.value))}
                />
              </div>
            )}
            <p className="font-semibold tabular-nums">
              {nutrition.calories} kkal · P {fmtMacro(nutrition.protein)}g · K{" "}
              {fmtMacro(nutrition.carbs)}g · L {fmtMacro(nutrition.fat)}g
            </p>
            <Button onClick={() => log.mutate()} disabled={log.isPending}>
              Catat sebagai makanan
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
