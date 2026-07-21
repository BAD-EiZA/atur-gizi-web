"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { AiAnalysis } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  ErrorBox,
  HelperText,
  Input,
  Label,
  PageTitle,
  Progress,
  Select,
} from "@/components/ui";
import {
  fileToBase64,
  uploadToCloudinary,
  type UploadSignature,
} from "@/lib/cloudinary-upload";
import { atwaterWarning, fmtMacro, kcalFromMacros, sumMacros } from "@/lib/nutrition";

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
  confidence_label?: string;
};

function confVariant(label?: string): "success" | "warning" | "danger" | "outline" {
  if (!label) return "outline";
  const l = label.toLowerCase();
  if (l.includes("tinggi") || l.includes("high")) return "success";
  if (l.includes("sedang") || l.includes("medium")) return "warning";
  return "danger";
}

export default function FoodScanPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [items, setItems] = useState<EditItem[]>([]);
  const [mealType, setMealType] = useState("lunch");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const analyze = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Pilih foto makanan terlebih dahulu.");

      setProgress(15);
      setStatus("Meminta tanda tangan unggah...");
      const sig = await api<UploadSignature>("/v1/media/upload-signature", {
        method: "POST",
        body: "{}",
      });

      setProgress(40);
      setStatus(sig.mock ? "Mode mock unggah..." : "Mengunggah ke Cloudinary...");
      const uploaded = await uploadToCloudinary(file, sig);

      setProgress(65);
      setStatus("Mengenali makanan dan memperkirakan porsi...");
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

      setProgress(85);
      setStatus("Menghitung nutrisi (hasil belum disimpan)...");
      return api<AiAnalysis>("/v1/food-analyses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setReviewed(false);
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
          confidence_label: i.confidence_label,
        })),
      );
      setErr(null);
      setStatus(null);
      setProgress(100);
      toast.message("Draft AI siap ditinjau", {
        description: "Hasil belum disimpan sebelum kamu konfirmasi.",
      });
    },
    onError: (e: Error) => {
      setErr(e.message);
      setStatus(null);
      setProgress(0);
    },
  });

  const confirm = useMutation({
    mutationFn: () =>
      api(`/v1/food-analyses/${analysis!.id}/confirm`, {
        method: "POST",
        idempotent: true,
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
      toast.success("Hasil AI yang sudah ditinjau tersimpan.");
      router.push("/dashboard");
    },
    onError: (e: Error) => setErr(e.message),
  });

  const updateItem = (idx: number, key: keyof EditItem, value: string | number) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const next = { ...it, [key]: value };
        if (key === "protein_g" || key === "carbs_g" || key === "fat_g") {
          next.calories = kcalFromMacros(
            Number(next.protein_g),
            Number(next.carbs_g),
            Number(next.fat_g),
          );
        }
        return next;
      }),
    );
  };

  const totals = sumMacros(items);
  const atwWarn = atwaterWarning(totals.calories, totals.protein_g, totals.carbs_g, totals.fat_g);
  const lowConf =
    (analysis?.result?.overall_confidence != null && analysis.result.overall_confidence < 0.55) ||
    Boolean(analysis?.result?.require_review);

  const onFile = (f: File | null) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (f && (!allowedTypes.includes(f.type) || f.size > 50 * 1024 * 1024)) {
      setErr("Gunakan foto JPEG, PNG, atau WebP dengan ukuran maksimal 50 MB.");
      return;
    }
    setFile(f);
    setAnalysis(null);
    setItems([]);
    setErr(null);
    setProgress(0);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <PageTitle
        title="Pindai makanan dengan AI"
        subtitle="AI membuat draft. Kamu memegang keputusan. Foto dihapus setelah analisis (kecuali diaktifkan di setelan)."
      />

      <Card className="space-y-5">
        <div
          className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[hsl(var(--primary)/0.25)] bg-gradient-to-b from-emerald-50/50 to-[hsl(var(--muted)/0.4)] px-4 py-12 text-center transition hover:border-[hsl(var(--primary)/0.45)]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) onFile(f);
          }}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Pratinjau foto makanan"
              className="mb-4 max-h-64 rounded-2xl object-contain shadow-[var(--shadow-md)]"
            />
          ) : (
            <div className="mb-4 rounded-2xl bg-white p-4 text-[hsl(var(--primary))] shadow-[var(--shadow-sm)] ring-1 ring-[hsl(var(--border))]">
              <ImagePlus className="size-7" aria-hidden />
            </div>
          )}
          <p className="text-sm font-semibold">Seret foto ke sini atau pilih file</p>
          <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
            Tips: pencahayaan cukup, semua makanan terlihat, JPEG/PNG/WebP max 50 MB.
          </p>
          <Label htmlFor="photo" className="mt-4 !mb-0">
            <span className="sr-only">Pilih foto</span>
          </Label>
          <Input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="mt-3 max-w-xs"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <ul className="list-inside list-disc text-xs text-[hsl(var(--muted-foreground))]">
          <li>Hasil AI adalah perkiraan awal, bukan data final.</li>
          <li>Edit porsi, kalori, dan makro sebelum menyimpan.</li>
          <li>Kuota AI 10 kali per hari per pengguna.</li>
        </ul>

        <Button
          onClick={() => analyze.mutate()}
          loading={analyze.isPending}
          disabled={!file}
        >
          <Camera className="size-4" aria-hidden />
          {analyze.isPending ? "Memproses..." : "Unggah & analisis"}
        </Button>
        {!file ? <HelperText>Pilih foto untuk mengaktifkan tombol analisis.</HelperText> : null}

        {analyze.isPending || progress > 0 ? (
          <div>
            <div className="mb-1 flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
              <span>{status ?? "Siap"}</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <Progress value={progress} label="Progres analisis AI" />
          </div>
        ) : null}

        {analysis?.quota ? (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Kuota AI: {analysis.quota.used}/{analysis.quota.quota} (sisa {analysis.quota.remaining})
          </p>
        ) : null}
        {err ? <ErrorBox message={err} /> : null}
      </Card>

      {analysis?.result ? (
        <Card className="mt-5 animate-fade-up space-y-5 border-[hsl(var(--primary)/0.15)] bg-gradient-to-b from-emerald-50/50 to-white shadow-[var(--shadow-md)]">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Draft AI</Badge>
            <Badge variant="outline">Belum disimpan</Badge>
            <Badge variant={confVariant(analysis.result.overall_confidence_label)}>
              {analysis.result.overall_confidence_label}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2">
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Kalori</p>
              <p className="text-sm font-semibold tabular-nums">{Math.round(totals.calories)} kkal</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2">
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Protein</p>
              <p className="text-sm font-semibold tabular-nums">{fmtMacro(totals.protein_g)} g</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2">
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Karbohidrat</p>
              <p className="text-sm font-semibold tabular-nums">{fmtMacro(totals.carbs_g)} g</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2">
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Lemak</p>
              <p className="text-sm font-semibold tabular-nums">{fmtMacro(totals.fat_g)} g</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            {analysis.disclaimer}
          </p>
          {analysis.result.warnings?.map((w) => (
            <p key={w} className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {w}
            </p>
          ))}

          <div>
            <Label htmlFor="meal">Jenis makan</Label>
            <Select id="meal" value={mealType} onChange={(e) => setMealType(e.target.value)}>
              <option value="breakfast">Sarapan</option>
              <option value="lunch">Makan siang</option>
              <option value="dinner">Makan malam</option>
              <option value="snack">Camilan</option>
              <option value="other">Lainnya</option>
            </Select>
          </div>

          {items.map((item, idx) => (
            <div
              key={idx}
              className="space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-white p-4 shadow-[var(--shadow-sm)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={confVariant(item.confidence_label)}>
                  {item.confidence_label ?? "Perlu ditinjau"}
                </Badge>
              </div>
              <Input
                value={item.name}
                onChange={(e) => updateItem(idx, "name", e.target.value)}
                aria-label={`Nama item ${idx + 1}`}
              />
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <Label className="text-xs">Porsi</Label>
                  <Input
                    type="number"
                    value={item.portion_amount}
                    onChange={(e) => updateItem(idx, "portion_amount", Number(e.target.value))}
                    aria-label="Jumlah porsi"
                  />
                </div>
                <div>
                  <Label className="text-xs">Satuan</Label>
                  <Input
                    value={item.portion_unit}
                    onChange={(e) => updateItem(idx, "portion_unit", e.target.value)}
                    aria-label="Satuan"
                  />
                </div>
                <div>
                  <Label className="text-xs">Kalori</Label>
                  <Input
                    type="number"
                    value={item.calories}
                    onChange={(e) => updateItem(idx, "calories", Number(e.target.value))}
                    aria-label="Kalori"
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <Label className="text-xs">Protein (g)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={item.protein_g}
                    onChange={(e) => updateItem(idx, "protein_g", Number(e.target.value))}
                    aria-label="Protein"
                  />
                </div>
                <div>
                  <Label className="text-xs">Karbohidrat (g)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={item.carbs_g}
                    onChange={(e) => updateItem(idx, "carbs_g", Number(e.target.value))}
                    aria-label="Karbohidrat"
                  />
                </div>
                <div>
                  <Label className="text-xs">Lemak (g)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={item.fat_g}
                    onChange={(e) => updateItem(idx, "fat_g", Number(e.target.value))}
                    aria-label="Lemak"
                  />
                </div>
              </div>
            </div>
          ))}

          {atwWarn ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">{atwWarn}</p>
          ) : null}
          {lowConf ? (
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4"
                checked={reviewed}
                onChange={(e) => setReviewed(e.target.checked)}
              />
              <span>
                Keyakinan AI rendah — saya sudah meninjau porsi dan angka sebelum menyimpan.
              </span>
            </label>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => confirm.mutate()}
              loading={confirm.isPending}
              disabled={items.length === 0 || (lowConf && !reviewed)}
            >
              Simpan hasil yang sudah ditinjau
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                if (!analysis) return;
                await api(`/v1/food-analyses/${analysis.id}`, { method: "DELETE" });
                setAnalysis(null);
                setItems([]);
                setProgress(0);
                toast.message("Analisis dibatalkan");
              }}
            >
              Batalkan
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
