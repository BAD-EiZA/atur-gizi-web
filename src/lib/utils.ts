import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKcal(n: number) {
  return new Intl.NumberFormat("id-ID").format(Math.round(n));
}
