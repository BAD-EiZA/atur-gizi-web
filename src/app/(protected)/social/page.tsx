"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button, Card, EmptyState, ErrorBox, PageTitle } from "@/components/ui";

type Post = {
  id: string;
  body: string;
  author: string;
  is_mine: boolean;
  created_at: string;
};

export default function SocialPage() {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const feed = useQuery({
    queryKey: ["feed"],
    queryFn: () => api<{ data: Post[] }>("/v1/social/feed"),
  });

  const post = useMutation({
    mutationFn: () =>
      api("/v1/social/posts", {
        method: "POST",
        body: JSON.stringify({ body, visibility: "friends" }),
      }),
    onSuccess: async () => {
      setBody("");
      await qc.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <div className="space-y-4">
      <PageTitle title="Sosial" subtitle="Bagikan progres singkat — tanpa leaderboard toxic." />
      <Card className="space-y-2">
        <textarea
          className="w-full rounded-xl border border-slate-200 p-3 text-sm"
          rows={3}
          maxLength={500}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tulis update (maks 500 karakter)..."
        />
        {err ? <ErrorBox message={err} /> : null}
        <Button onClick={() => post.mutate()} disabled={!body.trim() || post.isPending}>
          Kirim
        </Button>
      </Card>
      <Card>
        {(feed.data?.data.length ?? 0) === 0 ? (
          <EmptyState title="Belum ada postingan." />
        ) : (
          <ul className="divide-y text-sm">
            {feed.data!.data.map((p) => (
              <li key={p.id} className="py-3">
                <p className="font-medium">{p.author}</p>
                <p className="text-slate-700">{p.body}</p>
                <p className="text-xs text-slate-400">{new Date(p.created_at).toLocaleString("id-ID")}</p>
                {p.is_mine ? (
                  <Button
                    variant="ghost"
                    className="mt-1"
                    onClick={async () => {
                      await api(`/v1/social/posts/${p.id}`, { method: "DELETE" });
                      await qc.invalidateQueries({ queryKey: ["feed"] });
                    }}
                  >
                    Hapus
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
