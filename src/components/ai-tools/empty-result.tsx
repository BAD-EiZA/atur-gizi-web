import Link from "next/link";
import type { ReactNode } from "react";
import { Button, EmptyState } from "@/components/ui";

export function EmptyResult({
  title,
  description,
  actionHref = "/food/new",
  actionLabel = "Catat makanan",
  icon,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={icon}
      action={
        <Link href={actionHref}>
          <Button variant="secondary">{actionLabel}</Button>
        </Link>
      }
    />
  );
}

export function IdleHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.35)] px-4 py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
      {children}
    </div>
  );
}
