"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Camera,
  Download,
  Home,
  History,
  Menu,
  Settings,
  Sparkles,
  User,
  Utensils,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Logo } from "@/components/logo";

type NavItem = { href: string; label: string; icon: typeof Home; tip?: string };

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Hari ini",
    items: [
      { href: "/dashboard", label: "Beranda", icon: Home },
      { href: "/food/new", label: "Catat makanan", icon: Utensils },
      {
        href: "/food/scan",
        label: "Pindai makanan",
        icon: Camera,
        tip: "Analisis foto makanan",
      },
      {
        href: "/ai-tools",
        label: "Asisten AI",
        icon: Wand2,
        tip: "Cari, bandingkan, insight",
      },
      { href: "/activities/new", label: "Aktivitas", icon: Activity },
      {
        href: "/activities/import-screenshot",
        label: "Impor screenshot",
        icon: Camera,
        tip: "Baca workout dari screenshot app jam",
      },
    ],
  },
  {
    title: "Lacak",
    items: [
      { href: "/history", label: "Histori", icon: History },
      { href: "/insights", label: "Insight", icon: Sparkles },
    ],
  },
  {
    title: "Akun",
    items: [
      { href: "/profile", label: "Profil", icon: User },
      { href: "/settings", label: "Setelan", icon: Settings },
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
      title={item.tip}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex min-h-11 items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm transition duration-300",
        active
          ? "bg-[hsl(var(--secondary))] font-medium text-[hsl(var(--secondary-foreground))] shadow-[var(--shadow-sm)] ring-1 ring-[hsl(var(--primary)/0.12)]"
          : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
      )}
    >
      <span
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-xl transition",
          active
            ? "bg-white text-[hsl(var(--primary))] shadow-sm"
            : "bg-transparent text-current group-hover:bg-white/70",
        )}
      >
        <Icon size={17} aria-hidden />
      </span>
      {item.label}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!sheetOpen) return;
    const menuButton = menuButtonRef.current;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      menuButton?.focus();
    };
  }, [sheetOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="mesh-bg min-h-screen pb-24 md:pb-0 md:pl-[17rem]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17rem] overflow-y-auto border-r border-[hsl(var(--border)/0.8)] bg-white/80 p-4 backdrop-blur-xl md:flex md:flex-col">
        <Link href="/dashboard" className="mb-7 block px-2" aria-label="Dashboard Atur Gizi">
          <Logo size={28} />
        </Link>
        <nav className="flex-1 space-y-6">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="mb-2 px-3 text-[11px] font-medium tracking-wide text-[hsl(var(--muted-foreground))]">
                {g.title}
              </p>
              <div className="space-y-1">
                {g.items.map((item) => (
                  <NavLink key={item.href} item={item} active={isActive(item.href)} />
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-4 space-y-2 border-t border-[hsl(var(--border))] pt-4">
          <LogoutLink
            postLogoutRedirectURL="/"
            className="flex min-h-11 items-center rounded-2xl px-3 py-2.5 text-sm text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          >
            Keluar
          </LogoutLink>
          <p className="px-3 text-[10px] text-[hsl(var(--muted-foreground))]">© 2026 BAD-EiZA</p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-[hsl(var(--border)/0.7)] bg-white/80 backdrop-blur-xl md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-2xl hover:bg-[hsl(var(--muted))]"
            aria-label="Buka menu"
            aria-expanded={sheetOpen}
            aria-controls="mobile-navigation"
            ref={menuButtonRef}
            onClick={() => setSheetOpen(true)}
          >
            <Menu size={20} />
          </button>
          <Logo size={24} />
          <Link
            href="/food/new"
            className="inline-flex size-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-white shadow-[var(--shadow-sm)]"
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
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            aria-label="Tutup menu"
            onClick={() => setSheetOpen(false)}
          />
          <div
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="absolute inset-y-0 left-0 w-[min(100%,20rem)] overflow-y-auto bg-white p-4 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <Logo size={24} />
              <button
                type="button"
                className="inline-flex size-10 items-center justify-center rounded-2xl hover:bg-[hsl(var(--muted))]"
                aria-label="Tutup"
                ref={closeButtonRef}
                onClick={() => setSheetOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <nav className="space-y-6">
              {groups.map((g) => (
                <div key={g.title}>
                  <p className="mb-2 px-3 text-[11px] font-medium tracking-wide text-[hsl(var(--muted-foreground))]">
                    {g.title}
                  </p>
                  <div className="space-y-1">
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

      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8 lg:px-8">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-[hsl(var(--border)/0.8)] bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
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
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition",
                  active ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]",
                )}
              >
                {active ? (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[hsl(var(--primary))]" />
                ) : null}
                <span
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-xl transition",
                    active && "bg-[hsl(var(--secondary))]",
                  )}
                >
                  <Icon size={18} aria-hidden />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
