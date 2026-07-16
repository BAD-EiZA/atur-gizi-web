import Link from "next/link";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <span className="text-lg font-bold text-emerald-700">Atur Gizi</span>
        <div className="flex gap-2 text-sm">
          <LoginLink postLoginRedirectURL="/dashboard" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-white">
            Masuk
          </LoginLink>
          <RegisterLink
            postLoginRedirectURL="/onboarding"
            className="rounded-lg bg-emerald-600 px-3 py-2 font-medium text-white"
          >
            Daftar
          </RegisterLink>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-emerald-700">Wellness · bukan medical device</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Catat nutrisi & aktivitas dengan ringan dan transparan
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Target kalori yang bisa diaudit, food log manual cepat, AI Food Snap yang selalu Anda review dulu, plus
            insight mingguan dan ekspor data.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <RegisterLink
              postLoginRedirectURL="/onboarding"
              className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Mulai gratis
            </RegisterLink>
            <Link
              href="/login"
              className="inline-flex rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800"
            >
              Saya sudah punya akun
            </Link>
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "AI Food Snap", d: "Foto → draft nutrisi → Anda konfirmasi." },
            { t: "Target transparan", d: "BMR/TDEE Mifflin–St Jeor + formula version." },
            { t: "Aktivitas MET", d: "Quick add dengan snapshot berat & formula." },
            { t: "Privasi", d: "Foto default dihapus setelah analisis." },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">{f.t}</h2>
              <p className="mt-2 text-sm text-slate-600">{f.d}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 rounded-3xl bg-slate-900 px-6 py-10 text-white">
          <h2 className="text-2xl font-semibold">Fitur lengkap</h2>
          <ul className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <li>Dashboard harian + histori timeline</li>
            <li>Insight mingguan & target makro</li>
            <li>Barcode, meal plan, favorit</li>
            <li>Wearable stub, sosial ringan</li>
            <li>Ekspor JSON/CSV, langganan stub</li>
            <li>Kuota AI 10/hari, rate limit</li>
          </ul>
        </section>

        <p className="mt-10 text-center text-xs text-slate-400">
          Estimasi kalori dan nutrisi dapat tidak akurat. Bukan pengganti nasihat medis atau ahli gizi.
        </p>
      </main>
    </div>
  );
}
