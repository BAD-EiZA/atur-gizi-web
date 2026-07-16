"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Barcode,
  Camera,
  CreditCard,
  Download,
  Heart,
  Home,
  History,
  Menu,
  Settings,
  Sparkles,
  User,
  Utensils,
  Users,
  Watch,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Logo } from "@/components/logo";

type NavItem = { href: string; label: string; icon: typeof Home };

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Hari ini",
    items: [
      { href: "/dashboard", label: "Beranda", icon: Home },
      { href: "/food/new", label: "Catat makanan", icon: Utensils },
      { href: "/food/scan", label: "Pindai AI", icon: Camera },
      { href: "/ai-tools", label: "Alat AI", icon: Wand2 },
      { href: "/activities/new", label: "Aktivitas", icon: Activity },
    ],
  },
  {
    title: "Lacak",
    items: [
      { href: "/history", label: "Histori", icon: History },
      { href: "/insights", label: "Insight", icon: Sparkles },
      { href: "/barcode", label: "Barcode", icon: Barcode },
    ],
  },
  {
    title: "Rencanakan",
    items: [
      { href: "/meal-plans", label: "Rencana makan", icon: Heart },
    ],
  },
  {
    title: "Akun",
    items: [
      { href: "/social", label: "Sosial", icon: Users },
      { href: "/settings", label: "Setelan", icon: Settings },
      { href: "/profile", label: "Profil", icon: User },
      { href: "/billing", label: "Langganan", icon: CreditCard },
      { href: "/wearables", label: "Wearable", icon: Watch },
      { href: "/export", label: "Ekspor", icon: Download },
    ],
  },
];

const mobilePrimary: NavItem[] = [
  { href: "/dashboard", label: "Hari ini", icon: Home },
  { href: "/food/new", label: "Catat", icon: Utensils },
  { href: "/food/scan", label: "Pindai", icon: Camera },
  { href: "/insights", label: "Insight", icon: Sparkles },
];

function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex min-h-10 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-[hsl(var(--secondary))] font-medium text-[hsl(var(--secondary-foreground))]"
          : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
      )}
    >
      <Icon size={18} aria-hidden />
      {item.label}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-20 md:pb-0 md:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto border-r border-[hsl(var(--border))] bg-white p-4 md:block">
        <Link href="/dashboard" className="mb-6 block px-2" aria-label="Dashboard Atur Gizi">
          <Logo size={28} />
        </Link>
        <nav className="space-y-5">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                {g.title}
              </p>
              <div className="space-y-0.5">
                {g.items.map((item) => (
                  <NavLink key={item.href} item={item} active={isActive(item.href)} />
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-8 border-t border-[hsl(var(--border))] pt-4">
          <LogoutLink
            postLogoutRedirectURL="/"
            className="flex min-h-10 items-center rounded-xl px-3 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
          >
            Keluar
          </LogoutLink>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-[hsl(var(--border))] bg-white/90 backdrop-blur md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-[hsl(var(--muted))]"
            aria-label="Buka menu"
            onClick={() => setSheetOpen(true)}
          >
            <Menu size={20} />
          </button>
          <Logo size={24} />
          <Link
            href="/food/new"
            className="inline-flex size-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white"
            aria-label="Catat makanan"
          >
            <Utensils size={18} />
          </Link>
        </div>
      </header>

      {sheetOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Tutup menu"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(100%,20rem)] overflow-y-auto bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold text-[hsl(var(--primary))]">Menu</span>
              <button
                type="button"
                className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-[hsl(var(--muted))]"
                aria-label="Tutup"
                onClick={() => setSheetOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <nav className="space-y-5">
              {groups.map((g) => (
                <div key={g.title}>
                  <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    {g.title}
                  </p>
                  <div className="space-y-0.5">
                    {g.items.map((item) => (
                      <NavLink
                        key={item.href}
                        item={item}
                        active={isActive(item.href)}
                        onClick={() => setSheetOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-[hsl(var(--border))] bg-white md:hidden"
        aria-label="Navigasi utama"
      >
        <div className="grid grid-cols-4">
          {mobilePrimary.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px]",
                  active ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]",
                )}
              >
                <Icon size={20} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
