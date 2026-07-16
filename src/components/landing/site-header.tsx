"use client";

import { useEffect, useState } from "react";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors",
        scrolled
          ? "border-b border-[hsl(var(--border))] bg-white/85 backdrop-blur-md shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <a href="#" className="inline-flex items-center" aria-label="Atur Gizi beranda">
          <Logo size={28} priority />
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-[hsl(var(--muted-foreground))] transition hover:bg-white/80 hover:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LoginLink
            postLoginRedirectURL="/dashboard"
            className="hidden rounded-lg px-3 py-2 text-sm text-[hsl(var(--foreground))] transition hover:bg-white/80 sm:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          >
            Masuk
          </LoginLink>
          <RegisterLink
            postLoginRedirectURL="/onboarding"
            className="inline-flex min-h-10 items-center rounded-lg bg-[hsl(var(--primary))] px-3.5 py-2 text-sm font-medium text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
          >
            Daftar gratis
          </RegisterLink>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-white/80 lg:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[hsl(var(--border))] bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Menu mobile">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <LoginLink
              postLoginRedirectURL="/dashboard"
              className="rounded-lg px-3 py-3 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
              onClick={() => setOpen(false)}
            >
              Masuk
            </LoginLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
