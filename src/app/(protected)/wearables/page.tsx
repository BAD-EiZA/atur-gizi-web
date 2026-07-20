"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button, Card, PageTitle } from "@/components/ui";

type Wearables = {
  data: Array<{ id: string; provider: string; status: string; last_sync_at: string | null }>;
  available: string[];
};

const labels: Record<string, string> = {
  apple_health: "Apple Health",
  google_health_connect: "Google Health Connect",
  garmin: "Garmin",
  fitbit: "Fitbit",
};

export default function WearablesPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["wearables"],
    queryFn: () => api<Wearables>("/v1/wearables"),
  });

  const connect = useMutation({
    mutationFn: (provider: string) =>
      api(`/v1/wearables/${provider}/connect`, { method: "POST", body: "{}" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wearables"] }),
  });

  return (
    <div className="animate-fade-up">
      <PageTitle title="Wearable" subtitle="Integrasi stub — OAuth native menyusul." />
      <div className="grid gap-4 sm:grid-cols-2">
        {(q.data?.available ?? []).map((provider) => {
          const linked = q.data?.data.find((d) => d.provider === provider);
          return (
            <Card key={provider} className="space-y-3 text-sm" interactive>
              <p className="font-medium">{labels[provider] ?? provider}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {linked ? `Terhubung · sync ${linked.last_sync_at ?? "—"}` : "Belum terhubung"}
              </p>
              {linked ? (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => api(`/v1/wearables/${provider}/sync`, { method: "POST", body: "{}" }).then(() => qc.invalidateQueries({ queryKey: ["wearables"] }))}
                  >
                    Sync
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      api(`/v1/wearables/${provider}`, { method: "DELETE" }).then(() =>
                        qc.invalidateQueries({ queryKey: ["wearables"] }),
                      )
                    }
                  >
                    Putus
                  </Button>
                </div>
              ) : (
                <Button onClick={() => connect.mutate(provider)}>Hubungkan</Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
