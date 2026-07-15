"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { AiAnalysis } from "@/lib/types";
import { Button, Card, ErrorBox, Input, Label, PageTitle, Select } from "@/components/ui";
import {
  fileToBase64,
  uploadToCloudinary,
  type UploadSignature,
} from "@/lib/cloudinary-upload";

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
  const [status, setStatus] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [items, setItems] = useState<EditItem[]>([]);
  const [mealType, setMealType] = useState("lunch");
  const [file, setFile] = useState<File | null>(null);

  const analyze = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Pilih foto makanan terlebih dahulu.");

      setStatus("Meminta tanda tangan upload...");
      const sig = await api<UploadSignature>("/v1/media/upload-signature", {
        method: "POST",
        body: "{}",
      });

      setStatus(sig.mock ? "Mode mock upload..." : "Mengunggah ke Cloudinary...");
      const uploaded = await uploadToCloudinary(file, sig);

      setStatus("Menganalisis dengan Gemini...");
      // Mock: send base64. Production: backend fetches from Cloudinary (avoids Vercel body limit).
      const payload: Record<string, unknown> = {
        cloudinaryPublicId: uploaded.public_id,
        mediaDeliveryType: uploaded.type || sig.delivery_type,
        mediaVersion: uploaded.version != null ? String(uploaded.version) : undefined,
        mediaFormat: uploaded.format || file.type.split("/")[1],
        mediaBytes: uploaded.bytes ?? file.size,
        mimeType: file.type || "image/jpeg",
      };
      if (sig.mock) {
        payload.imageBase64 = await fileToBase64(file);
      }

      return api<AiAnalysis>("/v1/food-analyses", {
        method: "POST",
        body: JSON.stringify(payload),
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
      setStatus(null);
    },
    onError: (e: Error) => {
      setErr(e.message);
      setStatus(null);
    },
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
        subtitle="Upload Cloudinary + analisis Gemini. Foto dihapus setelah analisis. Kuota 10/hari."
      />
      <Card className="space-y-3">
        <div>
          <Label>Foto makanan (JPEG/PNG/WebP, max 10MB)</Label>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            capture="environment"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setAnalysis(null);
              setItems([]);
              setErr(null);
            }}
          />
        </div>
        <Button onClick={() => analyze.mutate()} disabled={analyze.isPending || !file}>
          {analyze.isPending ? "Memproses..." : "Unggah & analisis AI"}
        </Button>
        {status ? <p className="text-xs text-slate-500">{status}</p> : null}
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
            <div key={idx} className="space-y-2 rounded-xl border border-slate-100 p-3">
              <Input value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  value={item.portion_amount}
                  onChange={(e) => updateItem(idx, "portion_amount", Number(e.target.value))}
                />
                <Input
                  value={item.portion_unit}
                  onChange={(e) => updateItem(idx, "portion_unit", e.target.value)}
                />
                <Input
                  type="number"
                  value={item.calories}
                  onChange={(e) => updateItem(idx, "calories", Number(e.target.value))}
                />
              </div>
            </div>
          ))}
          <Button onClick={() => confirm.mutate()} disabled={confirm.isPending || items.length === 0}>
            {confirm.isPending ? "Menyimpan..." : "Simpan hasil yang sudah ditinjau"}
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
