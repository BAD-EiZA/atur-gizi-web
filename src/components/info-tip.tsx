"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";
import { GLOSSARY, type GlossaryKey } from "@/lib/glossary";

type InfoTipProps = {
  /** Glossary key or raw explanation text */
  tip: GlossaryKey | string;
  className?: string;
  side?: "top" | "bottom";
  /** Accessible name for the trigger */
  label?: string;
};

function resolveTip(tip: GlossaryKey | string): string {
  if (tip in GLOSSARY) return GLOSSARY[tip as GlossaryKey];
  return tip;
}

export function InfoTip({ tip, className, side = "top", label = "Penjelasan" }: InfoTipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const text = resolveTip(tip);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <span
      ref={rootRef}
      className={cn("relative inline-flex align-middle", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "inline-flex size-5 shrink-0 items-center justify-center rounded-full",
          "text-[hsl(var(--muted-foreground))] transition",
          "hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--primary))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
        )}
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onFocus={() => setOpen(true)}
      >
        <CircleHelp className="size-3.5" aria-hidden />
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "absolute z-50 w-56 max-w-[min(16rem,calc(100vw-2rem))] rounded-xl border border-[hsl(var(--border))]",
            "bg-white px-3 py-2 text-left text-xs leading-relaxed text-[hsl(var(--foreground))]",
            "shadow-[var(--shadow-md)]",
            side === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
            side === "bottom" && "top-full left-1/2 mt-2 -translate-x-1/2",
          )}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

/** Label row with optional glossary tip */
export function LabelWithTip({
  children,
  tip,
  htmlFor,
  className,
}: {
  children: ReactNode;
  tip: GlossaryKey | string;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]",
        className,
      )}
    >
      <span>{children}</span>
      <InfoTip tip={tip} label={`Penjelasan: ${typeof children === "string" ? children : "field"}`} />
    </label>
  );
}

/** Inline label + tip for compact stats (centered cards) */
export function TipLabel({
  children,
  tip,
  className,
}: {
  children: ReactNode;
  tip: GlossaryKey | string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center justify-center gap-1", className)}>
      <span>{children}</span>
      <InfoTip tip={tip} side="bottom" />
    </span>
  );
}
