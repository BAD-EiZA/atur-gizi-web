import { cn } from "@/lib/utils";
import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { Loader2 } from "lucide-react";

export function Button({
  className,
  variant = "primary",
  loading,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  loading?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
        isDisabled && "cursor-not-allowed opacity-50 shadow-none",
        !isDisabled && variant === "primary" && "bg-[hsl(var(--primary))] text-white hover:brightness-95 shadow-sm",
        !isDisabled && variant === "secondary" && "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:brightness-95",
        !isDisabled && variant === "ghost" && "bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]",
        !isDisabled && variant === "danger" && "bg-[hsl(var(--destructive))] text-white hover:brightness-95",
        !isDisabled && variant === "outline" && "border border-[hsl(var(--border))] bg-white hover:bg-[hsl(var(--muted))]",
        isDisabled && variant === "primary" && "bg-[hsl(var(--primary))] text-white",
        isDisabled && variant === "secondary" && "bg-[hsl(var(--secondary))]",
        isDisabled && variant === "danger" && "bg-[hsl(var(--destructive))] text-white",
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function Card({
  className,
  children,
  interactive,
}: {
  className?: string;
  children: ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[hsl(var(--border))] bg-white p-4 shadow-sm",
        interactive && "transition hover:border-[hsl(var(--primary)/0.3)] hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-sm outline-none",
        "focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring)/0.2)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-sm outline-none",
        "focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring)/0.2)]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]", className)}
    >
      {children}
    </label>
  );
}

export function PageTitle({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">{title}</h1>
        {subtitle ? <p className="text-sm text-[hsl(var(--muted-foreground))]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] px-6 py-10 text-center">
      {icon ? (
        <div className="rounded-full bg-[hsl(var(--muted))] p-3 text-[hsl(var(--muted-foreground))]">{icon}</div>
      ) : null}
      <div className="space-y-1">
        <h3 className="font-medium text-[hsl(var(--foreground))]">{title}</h3>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

export function ErrorBox({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
    >
      <span>{message}</span>
      {action}
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "secondary" | "outline" | "warning" | "danger" | "success";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-[hsl(var(--primary))] text-white",
        variant === "secondary" && "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
        variant === "outline" && "border border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
        variant === "warning" && "bg-amber-100 text-amber-900",
        variant === "danger" && "bg-red-100 text-red-800",
        variant === "success" && "bg-emerald-100 text-emerald-900",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Progress({ value, className, label }: { value: number; className?: string; label?: string }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]", className)}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-[hsl(var(--primary))] transition-all"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-[hsl(var(--muted))]", className)} />;
}

export function HelperText({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{children}</p>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">{children}</h2>;
}

export function Stat({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="text-3xl font-bold tabular-nums tracking-tight">
        {value}
        {unit ? <span className="ml-1 text-base font-medium text-[hsl(var(--muted-foreground))]">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{hint}</p> : null}
    </div>
  );
}
