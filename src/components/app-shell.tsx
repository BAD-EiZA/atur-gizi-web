"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Barcode,
  Camera,
  Heart,
  Home,
  History,
  Settings,
  Sparkles,
  User,
  Utensils,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const nav = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/food/new", label: "Makanan", icon: Utensils },
  { href: "/food/scan", label: "Scan", icon: Camera },
  { href: "/activities/new", label: "Aktivitas", icon: Activity },
  { href: "/history", label: "Histori", icon: History },
  { href: "/insights", label: "Insight", icon: Sparkles },
  { href: "/barcode", label: "Barcode", icon: Barcode },
  { href: "/meal-plans", label: "Rencana", icon: Heart },
  { href: "/social", label: "Sosial", icon: Users },
  { href: "/settings", label: "Setelan", icon: Settings },
  { href: "/profile", label: "Profil", icon: User },
];

const mobileNav = nav.slice(0, 5);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-56">
      <aside className="fixed inset-y-0 left-0 hidden w-56 overflow-y-auto border-r border-slate-200 bg-white p-4 md:block">
        <div className="mb-8 text-lg font-bold text-emerald-700">Atur Gizi</div>
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                  active ? "bg-emerald-50 font-medium text-emerald-700" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white md:hidden">
        <div className="grid grid-cols-5">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[10px]",
                  active ? "text-emerald-700" : "text-slate-500",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
