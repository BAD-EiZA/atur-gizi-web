import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  size?: number;
  priority?: boolean;
};

export function Logo({
  className,
  markClassName,
  showWordmark = true,
  size = 32,
  priority = false,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo.svg"
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0", markClassName)}
        priority={priority}
        aria-hidden
      />
      {showWordmark ? (
        <span className="text-lg font-bold tracking-tight text-[hsl(var(--primary))]">Atur Gizi</span>
      ) : (
        <span className="sr-only">Atur Gizi</span>
      )}
    </span>
  );
}
