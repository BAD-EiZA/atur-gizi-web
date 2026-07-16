"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearTokenCache } from "@/lib/api-client";
import { Button, Card, ErrorBox, Input, PageTitle } from "@/components/ui";

export default function AccountDeletePage() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <PageTitle
        title="Hapus akun"
        subtitle="Semua data domain, log, dan foto Cloudinary akan dihapus. Tindakan tidak dapat dibatalkan."
      />
      <Card className="space-y-3">
        <p className="text-sm text-slate-600">
          Ketik <strong>HAPUS</strong> untuk konfirmasi.
        </p>
        <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="HAPUS" />
        {err ? <ErrorBox message={err} /> : null}
        <Button
          variant="danger"
          disabled={confirmText !== "HAPUS" || loading}
          onClick={async () => {
            setLoading(true);
            try {
              await api("/v1/account/deletion-request", {
                method: "POST",
                body: "{}",
                idempotent: true,
              });
              clearTokenCache();
              window.location.href = "/api/auth/logout";
            } catch (e) {
              setErr((e as Error).message);
              setLoading(false);
            }
          }}
        >
          {loading ? "Menghapus..." : "Hapus akun permanen"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Batal
        </Button>
      </Card>
    </div>
  );
}
