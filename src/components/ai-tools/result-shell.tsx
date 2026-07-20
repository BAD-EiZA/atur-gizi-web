"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ResultShell({
  children,
  technical,
  badges,
  actions,
  className,
}: {
  children: ReactNode;
  technical?: unknown;
  badges?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const [openTech, setOpenTech] = useState(false);
  return (
    <Card
      className={cn(
        "animate-fade-up space-y-4 border-[hsl(var(--primary)/0.12)] bg-gradient-to-b from-emerald-50/40 to-white shadow-[var(--shadow-md)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Draft</Badge>
        <Badge variant="outline">Belum disimpan</Badge>
        <Badge variant="outline">Estimasi</Badge>
        {badges}
      </div>
      {children}
      {actions ? (
        <div className="flex flex-wrap gap-2 border-t border-[hsl(var(--border))] pt-4">{actions}</div>
      ) : null}
      {technical != null ? (
        <div className="border-t border-[hsl(var(--border))] pt-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            onClick={() => setOpenTech((v) => !v)}
          >
            {openTech ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            Lihat detail teknis
          </button>
          {openTech ? (
            <pre className="mt-2 max-h-64 overflow-auto rounded-2xl bg-[hsl(var(--muted))] p-3 text-xs leading-relaxed break-words whitespace-pre-wrap">
              {JSON.stringify(technical, null, 2)}
            </pre>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
