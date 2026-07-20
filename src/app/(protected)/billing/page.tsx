"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button, Card, PageTitle } from "@/components/ui";

type Sub = {
  plan: string;
  status: string;
  plans: Array<{ id: string; name: string; price_idr: number; ai_quota: number }>;
  message?: string;
};

export default function BillingPage() {
  const qc = useQueryClient();
  const sub = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api<Sub>("/v1/billing/subscription"),
  });
  const checkout = useMutation({
    mutationFn: (plan: string) =>
      api<{ message: string }>("/v1/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  return (
    <div className="animate-fade-up">
      <PageTitle title="Langganan" subtitle="Payment gateway stub — siap dihubungkan nanti." />
      <Card className="mb-5 text-sm">
        <p>
          Paket aktif: <strong>{sub.data?.plan ?? "—"}</strong> ({sub.data?.status ?? "—"})
        </p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        {(sub.data?.plans ?? []).map((p) => (
          <Card key={p.id} className="space-y-3 text-sm" interactive>
            <p className="font-semibold">{p.name}</p>
            <p className="text-lg font-bold tabular-nums">
              Rp {p.price_idr.toLocaleString("id-ID")}
              <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">/bln</span>
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Kuota AI {p.ai_quota}/hari</p>
            <Button
              variant={p.id === sub.data?.plan ? "secondary" : "primary"}
              onClick={() => checkout.mutate(p.id)}
              disabled={checkout.isPending}
            >
              Pilih
            </Button>
          </Card>
        ))}
      </div>
      {checkout.data?.message ? (
        <p className="mt-3 text-sm text-emerald-700">{checkout.data.message}</p>
      ) : null}
    </div>
  );
}
