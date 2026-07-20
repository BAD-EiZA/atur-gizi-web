"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, track } from "@/lib/api-client";
import { Button, Card, ErrorBox, Input, Label, PageTitle } from "@/components/ui";

type Product = {
  id: string;
  barcode: string;
  name: string;
  brand: string | null;
  calories: number;
};

export default function BarcodePage() {
  const [code, setCode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const qc = useQueryClient();

  const lookup = useMutation({
    mutationFn: () => api<Product>(`/v1/barcodes/${encodeURIComponent(code.trim())}`),
    onSuccess: (p) => {
      setProduct(p);
      setErr(null);
      void track("barcode_lookup");
    },
    onError: (e: Error) => {
      setProduct(null);
      setErr(e.message);
    },
  });

  const log = useMutation({
    mutationFn: () =>
      api("/v1/food-logs", {
        method: "POST",
        idempotent: true,
        body: JSON.stringify({
          consumedAt: new Date().toISOString(),
          mealType: "snack",
          title: product!.name,
          items: [
            {
              name: product!.name,
              portionAmount: 1,
              portionUnit: "serving",
              calories: product!.calories,
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
    <div className="animate-fade-up">
      <PageTitle title="Barcode" subtitle="Cari produk demo: 8991002101151, 8996001301135, 8999999000001" />
      <Card className="space-y-3">
        <div>
          <Label>Kode barcode</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Scan / ketik barcode" />
        </div>
        <Button onClick={() => lookup.mutate()} disabled={!code.trim() || lookup.isPending}>
          Cari
        </Button>
        {err ? <ErrorBox message={err} /> : null}
        {product ? (
          <div className="rounded-xl bg-emerald-50 p-3 text-sm">
            <p className="font-medium">{product.name}</p>
            <p className="text-slate-600">
              {product.brand ?? "—"} · {product.calories} kkal / porsi
            </p>
            <Button className="mt-2" onClick={() => log.mutate()} disabled={log.isPending}>
              Catat sebagai makanan
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
