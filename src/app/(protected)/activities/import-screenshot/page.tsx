"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import {
  fileToBase64,
  uploadToCloudinary,
  type UploadSignature,
} from "@/lib/cloudinary-upload";
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
import { InfoTip, LabelWithTip } from "@/components/info-tip";

type Draft = {
  is_activity_screen: boolean;
  detected_app: string;
  activity_name: string;
  activity_type_id: string | null;
  activity_type_slug: string | null;
  activity_type_guess: string;
  duration_minutes: number | null;
  calories_burned: number | null;
  distance_m: number | null;
  distance_km: number | null;
  avg_hr: number | null;
  started_at: string | null;
  intensity: string;
  confidence: number;
  image_quality: string;
  needs_user_input: boolean;
  fields_found: string[];
  warnings: string[];
};

type AnalyzeResult = {
  draft: Draft;
  disclaimer: string;
  quota?: { used: number; quota: number; remaining: number };
};

const APP_LABEL: Record<string, string> = {
  apple_health: "Apple Health",
  apple_fitness: "Apple Fitness",
  fitbit: "Fitbit",
  strava: "Strava",
  garmin: "Garmin",
  samsung_health: "Samsung Health",
  google_fit: "Google Fit",
  other: "App lain",
  unknown: "Tidak dikenal",
};

export default function ImportActivityScreenshotPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [quota, setQuota] = useState<AnalyzeResult["quota"] | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(false);

  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [calories, setCalories] = useState(0);
  const [distanceKm, setDistanceKm] = useState("");
  const [avgHr, setAvgHr] = useState("");
  const [intensity, setIntensity] = useState("moderate");
  const [activityTypeId, setActivityTypeId] = useState<string | null>(null);
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const onFile = (f: File | null) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (f && (!allowed.includes(f.type) || f.size > 50 * 1024 * 1024)) {
      setErr("Gunakan JPEG, PNG, atau WebP max 50 MB.");
      return;
    }
    setFile(f);
    setDraft(null);
    setErr(null);
    setProgress(0);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const applyDraft = (d: Draft) => {
    setDraft(d);
    setReviewed(false);
    setName(d.activity_name || "Aktivitas");
    setDuration(d.duration_minutes && d.duration_minutes > 0 ? d.duration_minutes : 30);
    setCalories(d.calories_burned != null && d.calories_burned >= 0 ? d.calories_burned : 0);
    setDistanceKm(d.distance_km != null ? String(d.distance_km) : "");
    setAvgHr(d.avg_hr != null ? String(d.avg_hr) : "");
    setIntensity(d.intensity || "moderate");
    setActivityTypeId(d.activity_type_id);
    if (d.started_at) {
      const day = d.started_at.slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(day)) setLogDate(day);
    }
  };

  const analyze = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Pilih screenshot terlebih dahulu.");
      setProgress(15);
      setStatus("Meminta tanda tangan unggah...");
      const sig = await api<UploadSignature>("/v1/media/upload-signature", {
        method: "POST",
        body: "{}",
      });
      setProgress(40);
      setStatus(sig.mock ? "Mode mock unggah..." : "Mengunggah screenshot...");
      const uploaded = await uploadToCloudinary(file, sig);
      setProgress(70);
      setStatus("Membaca layar aktivitas (AI)...");
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
      setProgress(90);
      return api<AnalyzeResult>("/v1/activity-screenshot-analyses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (res) => {
      setProgress(100);
      setStatus("Selesai — tinjau draf di bawah");
      setDisclaimer(res.disclaimer);
      setQuota(res.quota ?? null);
      applyDraft(res.draft);
      if (!res.draft.is_activity_screen) {
        setErr("Gambar sepertinya bukan layar aktivitas. Coba screenshot ringkasan workout.");
      } else {
        setErr(null);
        toast.success("Screenshot terbaca. Periksa angka sebelum simpan.");
      }
    },
    onError: (e: Error) => {
      setProgress(0);
      setStatus(null);
      setErr(e.message);
    },
  });

  const save = useMutation({
    mutationFn: () => {
      if (!(Number(duration) > 0)) throw new Error("Durasi wajib diisi.");
      const distanceM = distanceKm ? Number(distanceKm) * 1000 : undefined;
      const body: Record<string, unknown> = {
        activityTypeId: activityTypeId || undefined,
        customName: activityTypeId ? undefined : name || "Aktivitas",
        durationMinutes: Number(duration),
        intensity,
        caloriesBurned: Number(calories) >= 0 ? Number(calories) : undefined,
        deviceCalories: Number(calories) >= 0 ? Number(calories) : undefined,
        distanceM: distanceM && distanceM > 0 ? distanceM : undefined,
        avgHr: avgHr ? Number(avgHr) : undefined,
        logDate: logDate || undefined,
        source: "device",
        notes: draft
          ? `Impor screenshot · ${APP_LABEL[draft.detected_app] ?? draft.detected_app} · conf ${Math.round((draft.confidence || 0) * 100)}%`
          : "Impor screenshot",
      };
      if (activityTypeId && name) {
        body.notes = `${body.notes} · ${name}`;
      }
      return api("/v1/activity-logs", {
        method: "POST",
        idempotent: true,
        body: JSON.stringify(body),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Aktivitas dari screenshot tersimpan.");
      router.push("/dashboard");
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl animate-fade-up space-y-4">
      <PageTitle
        title="Impor lewat screenshot"
        subtitle="Screenshot ringkasan workout dari Apple Fitness, Fitbit, Strava, Garmin, dll. AI membaca angka — Anda yang mengonfirmasi."
        actions={
          <span className="inline-flex items-center gap-2">
            <InfoTip tip="screenshot_import" />
            <Link href="/activities/new" className="text-sm font-medium text-[hsl(var(--primary))]">
              Catat manual
            </Link>
          </span>
        }
      />

      <Card className="space-y-3 text-sm">
        <p className="font-medium">Tips foto yang bagus</p>
        <ul className="list-inside list-disc text-xs text-[hsl(var(--muted-foreground))]">
          <li>Buka layar ringkasan workout (bukan feed / beranda).</li>
          <li>Pastikan durasi, kalori, dan jarak terbaca jelas — jangan crop angka penting.</li>
          <li>JPEG / PNG / WebP, max 50 MB. Satu aktivitas per foto.</li>
        </ul>
      </Card>

      <Card className="space-y-4">
        <div
          className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[hsl(var(--primary)/0.25)] bg-gradient-to-b from-sky-50/50 to-[hsl(var(--muted)/0.4)] px-4 py-10 text-center"
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
              alt="Pratinjau screenshot"
              className="mb-4 max-h-72 rounded-2xl object-contain shadow-[var(--shadow-md)]"
            />
          ) : (
            <div className="mb-4 rounded-2xl bg-white p-4 text-[hsl(var(--primary))] shadow-[var(--shadow-sm)] ring-1 ring-[hsl(var(--border))]">
              <ImagePlus className="size-7" aria-hidden />
            </div>
          )}
          <p className="text-sm font-semibold">Seret screenshot atau pilih file</p>
          <p className="mt-1.5 max-w-sm text-xs text-[hsl(var(--muted-foreground))]">
            Apple Fitness · Fitbit · Strava · Garmin · Samsung Health
          </p>
          <Label htmlFor="shot" className="mt-4 !mb-0">
            <span className="sr-only">Pilih screenshot</span>
          </Label>
          <Input
            id="shot"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-3 max-w-xs"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <Button
          onClick={() => analyze.mutate()}
          loading={analyze.isPending}
          disabled={!file}
        >
          {analyze.isPending ? "Membaca..." : "Baca screenshot (AI)"}
        </Button>
        {!file ? <HelperText>Pilih gambar untuk mengaktifkan tombol.</HelperText> : null}

        {analyze.isPending || progress > 0 ? (
          <div>
            <div className="mb-1 flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
              <span>{status ?? "Siap"}</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <Progress value={progress} label="Progres baca screenshot" />
          </div>
        ) : null}

        {quota ? (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Kuota AI: {quota.used}/{quota.quota} (sisa {quota.remaining})
          </p>
        ) : null}
        {err ? <ErrorBox message={err} /> : null}
      </Card>

      {draft ? (
        <Card className="space-y-4 border-[hsl(var(--primary)/0.15)]">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Draf AI</Badge>
            <Badge variant="outline">{APP_LABEL[draft.detected_app] ?? draft.detected_app}</Badge>
            <Badge variant={draft.confidence >= 0.7 ? "success" : "warning"}>
              <span className="inline-flex items-center gap-1">
                Keyakinan {Math.round((draft.confidence || 0) * 100)}%
                <InfoTip tip="ai_confidence" />
              </span>
            </Badge>
            {!draft.is_activity_screen ? <Badge variant="danger">Bukan layar aktivitas?</Badge> : null}
          </div>
          {disclaimer ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{disclaimer}</p>
          ) : null}
          {draft.warnings?.map((w) => (
            <p key={w} className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {w}
            </p>
          ))}

          <div>
            <Label>Nama aktivitas</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Durasi (menit)</Label>
              <Input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div>
              <LabelWithTip tip="burned">Kalori terbakar</LabelWithTip>
              <Input
                type="number"
                min={0}
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
              />
            </div>
            <div>
              <LabelWithTip tip="distance">Jarak (km)</LabelWithTip>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="Opsional"
              />
            </div>
            <div>
              <LabelWithTip tip="avg_hr">HR rata-rata</LabelWithTip>
              <Input
                type="number"
                min={60}
                max={220}
                value={avgHr}
                onChange={(e) => setAvgHr(e.target.value)}
                placeholder="Opsional"
              />
            </div>
            <div>
              <Label>Tanggal</Label>
              <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
            </div>
            <div>
              <LabelWithTip tip="intensity">Intensitas</LabelWithTip>
              <Select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
                <option value="low">Ringan</option>
                <option value="moderate">Sedang</option>
                <option value="high">Berat</option>
              </Select>
            </div>
          </div>

          {(draft.confidence < 0.6 || !draft.is_activity_screen || draft.image_quality === "poor") && (
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4"
                checked={reviewed}
                onChange={(e) => setReviewed(e.target.checked)}
              />
              <span>Saya sudah memeriksa angka dari screenshot sebelum menyimpan.</span>
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => save.mutate()}
              loading={save.isPending}
              disabled={
                !name ||
                ((draft.confidence < 0.6 || !draft.is_activity_screen || draft.image_quality === "poor") &&
                  !reviewed)
              }
            >
              Simpan ke aktivitas
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setDraft(null);
                setProgress(0);
                setStatus(null);
              }}
            >
              Buang draf
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
