import { Badge } from "@/components/ui";

export function SourceBadge({ source }: { source?: string }) {
  const label =
    source === "memory" || source === "Memori"
      ? "Memori"
      : source === "catalog" || source === "Katalog"
        ? "Katalog"
        : source === "ai" || source === "AI"
          ? "AI"
          : source || "Sumber tidak diketahui";
  return <Badge variant="outline">{label}</Badge>;
}

export function ConfidenceBadge({
  label,
  value,
}: {
  label?: string;
  value?: number;
}) {
  if (!label && value == null) return null;
  const text = label ?? (value != null ? `${Math.round(value * 100)}%` : "");
  const l = text.toLowerCase();
  const variant =
    l.includes("tinggi") || l.includes("high") || (value != null && value >= 0.75)
      ? ("success" as const)
      : l.includes("sedang") || l.includes("medium") || (value != null && value >= 0.45)
        ? ("warning" as const)
        : ("danger" as const);
  return <Badge variant={variant}>Keyakinan: {text}</Badge>;
}

export function AssumptionList({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-1.5 rounded-2xl bg-[hsl(var(--muted)/0.5)] p-3 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
      {items.map((a) => (
        <li key={a}>· {a}</li>
      ))}
    </ul>
  );
}
