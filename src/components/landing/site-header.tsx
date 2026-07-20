"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoginLink, RegisterLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import {
  Camera,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useAuthSession } from "@/hooks/use-auth-session";
import { clearTokenCache } from "@/lib/api-client";

const links = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara kerja" },
  { href: "#demo-ai", label: "Demo AI" },
  { href: "#privasi", label: "Privasi" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const { data, isLoading } = useAuthSession();
  const user = data?.authenticated ? data.user : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = () => {
      setMenuOpen(false);
      setQuickOpen(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const initials = (user?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 md:px-4 md:pt-4">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 rounded-full px-3 transition duration-500 md:h-16 md:px-5",
          scrolled
            ? "border border-white/60 bg-white/80 shadow-[var(--shadow-md)] backdrop-blur-xl"
            : "border border-transparent bg-white/40 backdrop-blur-md",
        )}
      >
        <Link href="/" className="inline-flex items-center pl-1" aria-label="Atur Gizi beranda">
          <Logo size={26} priority />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigasi utama">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm text-[hsl(var(--muted-foreground))] transition hover:bg-white/80 hover:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <div className="hidden h-9 w-28 animate-pulse rounded-full bg-[hsl(var(--muted))] sm:block" />
              <div className="size-9 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
            </>
          ) : user ? (
            <>
              <div className="relative hidden sm:block" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-white px-3.5 text-sm font-medium hover:bg-[hsl(var(--muted))]"
                  onClick={() => {
                    setQuickOpen((v) => !v);
                    setMenuOpen(false);
                  }}
                >
                  <Plus className="size-4" aria-hidden />
                  Catat
                  <ChevronDown className="size-3.5 opacity-60" aria-hidden />
                </button>
                {quickOpen ? (
                  <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white py-1 shadow-[var(--shadow-lg)]">
                    <Link
                      href="/food/new"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
                    >
                      <Utensils className="size-4" aria-hidden /> Catat makanan
                    </Link>
                    <Link
                      href="/food/scan"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
                    >
                      <Camera className="size-4" aria-hidden /> Pindai makanan
                    </Link>
                    <Link
                      href="/ai-tools"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
                    >
                      <Camera className="size-4" aria-hidden /> Asisten AI
                    </Link>
                  </div>
                ) : null}
              </div>

              <Link
                href="/dashboard"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] hover:brightness-95"
              >
                <LayoutDashboard className="size-4" aria-hidden />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center overflow-hidden rounded-full bg-[hsl(var(--secondary))] text-xs font-bold text-[hsl(var(--secondary-foreground))] ring-1 ring-[hsl(var(--border))]"
                  aria-label="Menu akun"
                  onClick={() => {
                    setMenuOpen((v) => !v);
                    setQuickOpen(false);
                  }}
                >
                  {user.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.picture} alt="" className="size-full object-cover" />
                  ) : (
                    initials
                  )}
                </button>
                {menuOpen ? (
                  <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white py-2 shadow-[var(--shadow-lg)]">
                    <div className="border-b border-[hsl(var(--border))] px-3 pb-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
                    >
                      <LayoutDashboard className="size-4" aria-hidden /> Dashboard
                    </Link>
                    <Link
                      href="/food/new"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
                    >
                      <Utensils className="size-4" aria-hidden /> Catat makanan
                    </Link>
                    <Link
                      href="/food/scan"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
                    >
                      <Camera className="size-4" aria-hidden /> Pindai makanan
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
                    >
                      <UserRound className="size-4" aria-hidden /> Profil
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
                    >
                      <Settings className="size-4" aria-hidden /> Setelan
                    </Link>
                    <div className="my-1 border-t border-[hsl(var(--border))]" />
                    <LogoutLink
                      postLogoutRedirectURL="/"
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
                      onClick={() => clearTokenCache()}
                    >
                      <LogOut className="size-4" aria-hidden /> Keluar
                    </LogoutLink>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <LoginLink
                postLoginRedirectURL="/dashboard"
                className="hidden rounded-full px-3.5 py-2 text-sm text-[hsl(var(--foreground))] transition hover:bg-white/80 sm:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              >
                Masuk
              </LoginLink>
              <RegisterLink
                postLoginRedirectURL="/onboarding"
                className="inline-flex min-h-10 items-center rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
              >
                Daftar gratis
              </RegisterLink>
            </>
          )}

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-white/80 lg:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mx-auto mt-2 max-w-5xl overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-white px-3 py-3 shadow-[var(--shadow-lg)] lg:hidden">
          <nav className="flex flex-col gap-0.5" aria-label="Menu mobile">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-2xl px-3 py-3 text-sm font-medium hover:bg-[hsl(var(--muted))]"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/food/new"
                  className="rounded-2xl px-3 py-3 text-sm font-medium hover:bg-[hsl(var(--muted))]"
                  onClick={() => setOpen(false)}
                >
                  Catat makanan
                </Link>
                <Link
                  href="/food/scan"
                  className="rounded-2xl px-3 py-3 text-sm font-medium hover:bg-[hsl(var(--muted))]"
                  onClick={() => setOpen(false)}
                >
                  Pindai makanan
                </Link>
                <div className="my-1 border-t border-[hsl(var(--border))]" />
              </>
            ) : null}
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-2xl px-3 py-3 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            {!user ? (
              <LoginLink
                postLoginRedirectURL="/dashboard"
                className="rounded-2xl px-3 py-3 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                onClick={() => setOpen(false)}
              >
                Masuk
              </LoginLink>
            ) : (
              <LogoutLink
                postLogoutRedirectURL="/"
                className="rounded-2xl px-3 py-3 text-sm font-medium hover:bg-[hsl(var(--muted))]"
                onClick={() => {
                  clearTokenCache();
                  setOpen(false);
                }}
              >
                Keluar
              </LogoutLink>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
