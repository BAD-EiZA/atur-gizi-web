"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { AiAnalysis } from "@/lib/types";
import { Button, Card, ErrorBox, Input, Label, PageTitle, Select } from "@/components/ui";

type EditItem = {
  name: string;
  portion_amount: number;
  portion_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  confidence?: number;
};

export default function FoodScanPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [items, setItems] = useState<EditItem[]>([]);
  const [mealType, setMealType] = useState("lunch");
  const [file, setFile] = useState<File | null>(null);

  const analyze = useMutation({
    mutationFn: async () => {
      const sig = await api<{
        folder: string;
        mock?: boolean;
      }>("/v1/media/upload-signature", { method: "POST", body: "{}" });

      // Dev: skip real Cloudinary; use mock public_id + optional base64
      const publicId = `${sig.folder}/mock_${Date.now()}`;
      let imageBase64: string | undefined;
      if (file) {
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        imageBase64 = btoa(binary);
      }

      return api<AiAnalysis>("/v1/food-analyses", {
        method: "POST",
        body: JSON.stringify({
          cloudinaryPublicId: publicId,
          mediaFormat: file?.type?.split("/")[1] ?? "jpeg",
          mediaBytes: file?.size,
          imageBase64,
          mimeType: file?.type || "image/jpeg",
        }),
      });
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setItems(
        (data.result?.items ?? []).map((i) => ({
          name: i.name,
          portion_amount: i.portion_amount,
          portion_unit: i.portion_unit,
          calories: i.calories,
          protein_g: i.protein_g,
          carbs_g: i.carbs_g,
          fat_g: i.fat_g,
          fiber_g: i.fiber_g,
          confidence: i.confidence,
        })),
      );
      setErr(null);
    },
    onError: (e: Error) => setErr(e.message),
  });

  const confirm = useMutation({
    mutationFn: () =>
      api(`/v1/food-analyses/${analysis!.id}/confirm`, {
        method: "POST",
        body: JSON.stringify({
          mealType,
          consumedAt: new Date().toISOString(),
          title: items.map((i) => i.name).join(", "),
          items: items.map((i) => ({
            name: i.name,
            portionAmount: i.portion_amount,
            portionUnit: i.portion_unit,
            calories: i.calories,
            proteinG: i.protein_g,
            carbsG: i.carbs_g,
            fatG: i.fat_g,
            fiberG: i.fiber_g,
            aiConfidence: i.confidence,
          })),
        }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/dashboard");
    },
    onError: (e: Error) => setErr(e.message),
  });

  const updateItem = (idx: number, key: keyof EditItem, value: string | number) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };

  return (
    <div>
      <PageTitle
        title="AI Food Snap"
        subtitle="Foto dihapus setelah analisis. Kuota 10/hari. Hasil wajib ditinjau sebelum simpan."
      />
      <Card className="space-y-3">
        <div>
          <Label>Foto makanan (JPEG/PNG/WebP, max 10MB)</Label>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button onClick={() => analyze.mutate()} disabled={analyze.isPending}>
          {analyze.isPending ? "Menganalisis..." : "Analisis (mock OK tanpa Cloudinary/Gemini)"}
        </Button>
        {analysis?.quota ? (
          <p className="text-xs text-slate-500">
            Kuota AI: {analysis.quota.used}/{analysis.quota.quota} (sisa {analysis.quota.remaining})
          </p>
        ) : null}
        {err ? <ErrorBox message={err} /> : null}
      </Card>

      {analysis?.result ? (
        <Card className="mt-4 space-y-3">
          <p className="text-sm text-slate-600">{analysis.disclaimer}</p>
          <p className="text-sm">
            Keyakinan: <strong>{analysis.result.overall_confidence_label}</strong> · Total estimasi{" "}
            {analysis.result.total_estimated_calories} kkal
          </p>
          {analysis.result.warnings?.map((w) => (
            <p key={w} className="text-xs text-amber-700">
              {w}
            </p>
          ))}
          <div>
            <Label>Waktu makan</Label>
            <Select value={mealType} onChange={(e) => setMealType(e.target.value)}>
              <option value="breakfast">Sarapan</option>
              <option value="lunch">Makan siang</option>
              <option value="dinner">Makan malam</option>
              <option value="snack">Camilan</option>
              <option value="other">Lainnya</option>
            </Select>
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-slate-100 p-3 space-y-2">
              <Input value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  value={item.portion_amount}
                  onChange={(e) => updateItem(idx, "portion_amount", Number(e.target.value))}
                />
                <Input value={item.portion_unit} onChange={(e) => updateItem(idx, "portion_unit", e.target.value)} />
                <Input
                  type="number"
                  value={item.calories}
                  onChange={(e) => updateItem(idx, "calories", Number(e.target.value))}
                />
              </div>
            </div>
          ))}
          <Button onClick={() => confirm.mutate()} disabled={confirm.isPending || items.length === 0}>
            Simpan hasil yang sudah ditinjau
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              if (!analysis) return;
              await api(`/v1/food-analyses/${analysis.id}`, { method: "DELETE" });
              setAnalysis(null);
              setItems([]);
            }}
          >
            Batalkan
          </Button>
        </Card>
      ) : null}
    </div>
  );
}
