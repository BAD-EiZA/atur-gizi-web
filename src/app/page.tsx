import Link from "next/link";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16">
        <div>
          <p className="text-sm font-medium text-emerald-700">Atur Gizi</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Catat makan & aktivitas tanpa ribet
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Target kalori transparan, food log manual cepat, dan AI Food Snap yang selalu Anda review
            dulu sebelum disimpan.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <LoginLink
            postLoginRedirectURL="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Masuk
          </LoginLink>
          <RegisterLink
            postLoginRedirectURL="/onboarding"
            className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-200"
          >
            Daftar
          </RegisterLink>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Opsi lain
          </Link>
        </div>
        <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <li className="rounded-2xl border bg-white p-4">Onboarding & target harian</li>
          <li className="rounded-2xl border bg-white p-4">Log makanan & aktivitas</li>
          <li className="rounded-2xl border bg-white p-4">AI scan foto (kuota 10/hari)</li>
        </ul>
        <p className="text-xs text-slate-400">
          Estimasi nutrisi bukan diagnosis medis. Bukan pengganti ahli gizi.
        </p>
      </div>
    </div>
  );
}
