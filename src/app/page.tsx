import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Camera, ChartLine, Shield, Utensils } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="text-lg font-bold text-[hsl(var(--primary))]">Atur Gizi</span>
        <div className="flex items-center gap-1 text-sm sm:gap-2">
          <a href="#cara-kerja" className="hidden rounded-lg px-3 py-2 text-slate-600 hover:bg-white sm:inline">
            Cara kerja
          </a>
          <a href="#privasi" className="hidden rounded-lg px-3 py-2 text-slate-600 hover:bg-white sm:inline">
            Privasi
          </a>
          <LoginLink
            postLoginRedirectURL="/dashboard"
            className="rounded-lg px-3 py-2 text-slate-700 hover:bg-white"
          >
            Masuk
          </LoginLink>
          <RegisterLink
            postLoginRedirectURL="/onboarding"
            className="rounded-lg bg-[hsl(var(--primary))] px-3 py-2 font-medium text-white"
          >
            Daftar gratis
          </RegisterLink>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full bg-[hsl(var(--secondary))] px-3 py-1 text-xs font-medium text-[hsl(var(--secondary-foreground))]">
              Wellness tracker · bukan alat medis
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Catat makan dan aktivitas tanpa membuat hidup terasa seperti spreadsheet
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Target yang dapat disesuaikan, pencatatan cepat, pindai foto dengan konfirmasi manual, dan
              insight mingguan yang netral.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <RegisterLink
                postLoginRedirectURL="/onboarding"
                className="inline-flex min-h-11 items-center rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-medium text-white hover:brightness-95"
              >
                Mulai gratis
              </RegisterLink>
              <a
                href="#cara-kerja"
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800"
              >
                Lihat cara kerja
              </a>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Data dapat diekspor. Foto default dihapus setelah analisis AI.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
            <p className="text-xs font-medium text-slate-500">Contoh ringkasan hari ini</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
              820 <span className="text-base font-medium text-slate-500">kkal tersisa</span>
            </p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-[hsl(var(--primary))]" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Konsumsi</p>
                <p className="font-semibold tabular-nums">1.180</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Aktivitas</p>
                <p className="font-semibold tabular-nums">210</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Target</p>
                <p className="font-semibold tabular-nums">2.000</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Ilustrasi — bukan data akun Anda.</p>
          </div>
        </section>

        <section id="cara-kerja" className="mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">Cara kerja</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { n: "1", t: "Foto atau catat", d: "Manual, favorit, barcode, atau pindai AI." },
              { n: "2", t: "Tinjau hasil", d: "Edit porsi dan kalori sebelum menyimpan." },
              { n: "3", t: "Lihat pola", d: "Dashboard harian dan insight mingguan netral." },
            ].map((s) => (
              <li key={s.n} className="rounded-2xl border bg-white p-5 shadow-sm">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-sm font-bold text-[hsl(var(--secondary-foreground))]">
                  {s.n}
                </span>
                <h3 className="mt-3 font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Pindai AI", d: "Foto → draft nutrisi → Anda konfirmasi.", icon: Camera },
            { t: "Target transparan", d: "BMR/TDEE Mifflin–St Jeor + versi formula.", icon: ChartLine },
            { t: "Pencatatan cepat", d: "Favorit, barcode, dan tambah manual.", icon: Utensils },
            { t: "Privasi dulu", d: "Foto default dihapus setelah analisis.", icon: Shield },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.t} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="size-5 text-[hsl(var(--primary))]" aria-hidden />
                <h2 className="mt-3 font-semibold text-slate-900">{f.t}</h2>
                <p className="mt-2 text-sm text-slate-600">{f.d}</p>
              </div>
            );
          })}
        </section>

        <section id="privasi" className="mt-16 rounded-3xl bg-slate-900 px-6 py-10 text-white">
          <h2 className="text-2xl font-semibold">Privasi & batasan</h2>
          <ul className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <li>Estimasi nutrisi bukan diagnosis medis.</li>
            <li>AI selalu membutuhkan konfirmasi Anda.</li>
            <li>Ekspor data JSON/CSV tersedia.</li>
            <li>Penghapusan akun menghapus data domain.</li>
          </ul>
          <div className="mt-6">
            <RegisterLink
              postLoginRedirectURL="/onboarding"
              className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-900"
            >
              Mulai gratis
            </RegisterLink>
          </div>
        </section>

        <p className="mt-10 text-center text-xs text-slate-400">
          Estimasi kalori dan nutrisi dapat tidak akurat. Bukan pengganti nasihat medis atau ahli gizi.
        </p>
      </main>
    </div>
  );
}
