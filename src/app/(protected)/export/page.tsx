"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { Button, Card, PageTitle } from "@/components/ui";
import { InfoTip } from "@/components/info-tip";

export default function ExportPage() {
  const [msg, setMsg] = useState<string | null>(null);

  const downloadJson = async () => {
    const res = await api<{ job_id: string; data: unknown }>("/v1/exports", {
      method: "POST",
      body: JSON.stringify({ format: "json" }),
    });
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atur-gizi-export-${res.job_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Export JSON diunduh.");
  };

  const downloadCsv = async () => {
    const res = await api<{ food_csv: string; activity_csv: string }>("/v1/exports", {
      method: "POST",
      body: JSON.stringify({ format: "csv" }),
    });
    const blob = new Blob([res.food_csv + "\n\n" + res.activity_csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "atur-gizi-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Export CSV diunduh.");
  };

  return (
    <div className="animate-fade-up">
      <PageTitle
        title="Ekspor data"
        subtitle="Unduh data akunmu dalam format JSON atau CSV. Foto biasanya tidak ikut diekspor."
        actions={<InfoTip tip="export_data" />}
      />
      <Card className="flex flex-wrap gap-2">
        <Button onClick={() => void downloadJson()}>Unduh JSON</Button>
        <Button variant="secondary" onClick={() => void downloadCsv()}>
          Unduh CSV
        </Button>
        {msg ? <p className="w-full text-sm text-emerald-700">{msg}</p> : null}
      </Card>
    </div>
  );
}
