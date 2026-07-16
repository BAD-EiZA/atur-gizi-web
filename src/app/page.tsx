import {
  Activity,
  ArrowDown,
  ArrowRight,
  Camera,
  Check,
  Download,
  PencilLine,
  ScanBarcode,
  ShieldCheck,
  Sparkles,
  Trash2,
  Utensils,
} from "lucide-react";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { SiteHeader } from "@/components/landing/site-header";
import { FaqSection } from "@/components/landing/faq-section";

export const metadata = {
  title: "Atur Gizi — Catat Makan, Aktivitas, dan Insight Mingguan",
  description:
    "Catat makanan manual, dari barcode, atau melalui foto. Tinjau estimasi AI sebelum menyimpan dan pahami pola mingguan dengan bahasa yang netral.",
};

function PrimaryCta({ className = "" }: { className?: string }) {
  return (
    <RegisterLink
      postLoginRedirectURL="/onboarding"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 py-3 text-sm font-medium text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 ${className}`}
    >
      Mulai gratis
      <ArrowRight className="size-4" aria-hidden />
    </RegisterLink>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section
          className="relative overflow-hidden border-b border-[hsl(var(--border))]"
          style={{
            background:
              "radial-gradient(circle at 75% 25%, rgba(34, 197, 94, 0.12), transparent 28%), linear-gradient(to bottom, #effcf5, #ffffff)",
          }}
        >
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-2 lg:items-center lg:py-24">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-sm font-medium text-[hsl(var(--secondary-foreground))]">
                Wellness tracker · bukan alat medis
              </span>

              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                  Catat makan dan aktivitas tanpa membuat hidup terasa seperti spreadsheet
                </h1>
                <p className="max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))] md:text-lg">
                  Catat manual, dari barcode, atau melalui foto. Tinjau setiap estimasi sebelum
                  menyimpan dan lihat pola mingguan tanpa penilaian berlebihan.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryCta />
                <a
                  href="#cara-kerja"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-white px-5 py-3 text-sm font-medium transition hover:bg-[hsl(var(--muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                >
                  Lihat cara kerja
                  <ArrowDown className="size-4" aria-hidden />
                </a>
              </div>

              <ul className="grid gap-2 text-sm text-[hsl(var(--muted-foreground))] sm:grid-cols-1 md:text-base">
                {[
                  "Gratis untuk mulai · tanpa kartu pembayaran",
                  "Hasil AI selalu dapat diedit",
                  "Foto default dihapus setelah analisis",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-[hsl(var(--primary))]" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Richer hero mockup */}
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5 shadow-xl md:p-6">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Ringkasan hari ini</p>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                  Contoh produk
                </span>
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-bold tabular-nums tracking-tight">820</span>
                <span className="pb-1 text-sm text-[hsl(var(--muted-foreground))]">kkal tersisa</span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                <div className="h-full w-[68%] rounded-full bg-[hsl(var(--primary))]" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
                {[
                  ["Konsumsi", "1.180"],
                  ["Aktivitas", "210"],
                  ["Target", "2.000"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-[hsl(var(--muted))] p-3">
                    <p className="text-xs text-[hsl(var(--muted-foreground))] md:text-sm">{label}</p>
                    <p className="font-semibold tabular-nums">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs md:text-sm">
                {[
                  { l: "Protein", v: "72/110 g", w: "65%", c: "bg-purple-400" },
                  { l: "Karbo", v: "148/220 g", w: "67%", c: "bg-amber-400" },
                  { l: "Lemak", v: "41/60 g", w: "68%", c: "bg-sky-400" },
                ].map((m) => (
                  <div key={m.l} className="rounded-xl border border-[hsl(var(--border))] p-2.5">
                    <p className="text-[hsl(var(--muted-foreground))]">{m.l}</p>
                    <p className="mt-0.5 font-medium tabular-nums">{m.v}</p>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                      <div className={`h-full ${m.c}`} style={{ width: m.w }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Makan siang</p>
                    <p className="text-sm font-medium">Nasi + ayam bakar + sayur</p>
                    <p className="mt-0.5 text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
                      610 kkal
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                    AI sudah ditinjau
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-[hsl(var(--muted-foreground))] ring-1 ring-[hsl(var(--border))]">
                  <Camera className="size-3" aria-hidden />
                  Foto dihapus setelah analisis
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-[hsl(var(--muted-foreground))] ring-1 ring-[hsl(var(--border))]">
                  <Activity className="size-3" aria-hidden />
                  Jalan sore · 145 kkal
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="border-b border-[hsl(var(--border))] bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 text-sm text-[hsl(var(--muted-foreground))] md:px-6 md:text-base">
            <span className="inline-flex items-center gap-2">
              <PencilLine className="size-4 text-[hsl(var(--primary))]" aria-hidden />
              AI draft · Anda konfirmasi
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-[hsl(var(--primary))]" aria-hidden />
              Target & formula transparan
            </span>
            <span className="inline-flex items-center gap-2">
              <Download className="size-4 text-[hsl(var(--primary))]" aria-hidden />
              Ekspor data kapan saja
            </span>
          </div>
        </section>

        {/* CARA KERJA — stepper */}
        <section id="cara-kerja" className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Cara kerja</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[hsl(var(--muted-foreground))] md:text-base">
            AI membuat draft. Anda yang menentukan hasil akhirnya.
          </p>

          <ol className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
            <div
              className="pointer-events-none absolute left-[16%] right-[16%] top-7 hidden h-px bg-[hsl(var(--border))] md:block"
              aria-hidden
            />
            {[
              {
                n: "1",
                t: "Catat dengan cara paling mudah",
                d: "Masukkan manual, pilih dari favorit, scan barcode, atau ambil foto.",
                icon: Utensils,
              },
              {
                n: "2",
                t: "Periksa sebelum tersimpan",
                d: "Ubah nama, porsi, dan nutrisi. AI tidak menyimpan hasil tanpa konfirmasi.",
                icon: PencilLine,
              },
              {
                n: "3",
                t: "Lihat pola, bukan penilaian",
                d: "Pahami kebiasaan harian dan mingguan lewat ringkasan yang netral.",
                icon: Sparkles,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.n} className="relative text-center md:px-2">
                  <span className="relative z-10 mx-auto flex size-14 items-center justify-center rounded-full border-2 border-[hsl(var(--primary))] bg-white text-lg font-bold text-[hsl(var(--primary))] shadow-sm">
                    {s.n}
                  </span>
                  <div className="mx-auto mt-4 flex size-10 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mt-3 text-base font-semibold md:text-lg">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:text-base">
                    {s.d}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* DEMO AI REVIEW */}
        <section id="demo-ai" className="border-y border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.45)]">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                <Sparkles className="size-3.5" aria-hidden />
                Demo review AI
              </span>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                AI membuat draft. Anda yang menentukan hasil akhirnya.
              </h2>
              <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))] md:text-base">
                Setiap item punya estimasi, keyakinan, dan asumsi — selalu bisa diedit sebelum
                disimpan.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/illustrations/food-plate.svg"
                  alt="Ilustrasi piring makanan untuk demo pindai AI"
                  className="h-56 w-full object-cover sm:h-64"
                />
                <p className="border-t border-[hsl(var(--border))] px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
                  Contoh foto · ilustrasi, bukan foto pengguna
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-white p-5 shadow-sm">
                <p className="text-sm font-medium">Terdeteksi (draft)</p>
                {[
                  {
                    name: "Nasi putih",
                    portion: "150 g",
                    conf: "Keyakinan sedang",
                    confClass: "bg-amber-100 text-amber-900",
                    kcal: "195 kkal",
                  },
                  {
                    name: "Ayam bakar",
                    portion: "1 potong",
                    conf: "Keyakinan tinggi",
                    confClass: "bg-emerald-100 text-emerald-900",
                    kcal: "210 kkal",
                  },
                  {
                    name: "Tumis sayur",
                    portion: "100 g",
                    conf: "Keyakinan sedang",
                    confClass: "bg-amber-100 text-amber-900",
                    kcal: "85 kkal",
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[hsl(var(--border))] p-3"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {item.portion} · {item.kcal}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${item.confClass}`}>
                      {item.conf}
                    </span>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex min-h-10 items-center rounded-lg border border-[hsl(var(--border))] px-4 text-sm font-medium">
                    Edit
                  </span>
                  <span className="inline-flex min-h-10 items-center rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-medium text-white">
                    Konfirmasi
                  </span>
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Tidak ada hasil AI yang disimpan tanpa konfirmasi Anda.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE BENTO */}
        <section id="fitur" className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Fitur utama</h2>
          <p className="mt-3 max-w-2xl text-sm text-[hsl(var(--muted-foreground))] md:text-base">
            Dirancang agar pencatatan terasa ringan, transparan, dan tetap di bawah kendali Anda.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm md:row-span-2 md:p-8">
              <Camera className="size-6 text-[hsl(var(--primary))]" aria-hidden />
              <h3 className="mt-4 text-xl font-semibold">Pindai makanan dengan AI</h3>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:text-base">
                Ambil foto, tinjau makanan dan porsi yang terdeteksi, lalu koreksi sebelum menyimpan.
                Setiap item menampilkan keyakinan dan asumsi.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 text-[hsl(var(--primary))]" aria-hidden />
                  Multi-item + edit porsi
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 text-[hsl(var(--primary))]" aria-hidden />
                  Badge keyakinan tinggi / sedang / rendah
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 text-[hsl(var(--primary))]" aria-hidden />
                  Anda memegang keputusan akhir
                </li>
              </ul>
            </article>

            <article className="rounded-2xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm">
              <Sparkles className="size-5 text-[hsl(var(--primary))]" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold">Target transparan</h3>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:text-base">
                Lihat estimasi BMR, TDEE, penyesuaian tujuan, dan versi formula. Target tidak berubah
                diam-diam.
              </p>
            </article>

            <article className="rounded-2xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {["Terakhir", "Favorit", "Barcode", "Manual"].map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--muted))] px-2.5 py-1 text-xs font-medium"
                  >
                    {c === "Barcode" ? <ScanBarcode className="size-3" aria-hidden /> : null}
                    {c === "Manual" ? <Utensils className="size-3" aria-hidden /> : null}
                    {c}
                  </span>
                ))}
              </div>
              <h3 className="mt-3 text-lg font-semibold">Pencatatan cepat</h3>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:text-base">
                Favorit, barcode, dan input manual agar mencatat tidak terasa seperti pekerjaan
                rumah.
              </p>
            </article>

            <article className="rounded-2xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm md:col-span-2">
              <ShieldCheck className="size-5 text-[hsl(var(--primary))]" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold">Privasi dulu</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:text-base">
                Toggle simpan foto (default nonaktif), ekspor data, dan hapus akun dari aplikasi.
                Tidak ada training tersembunyi atas foto Anda.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--muted))] px-3 py-2">
                  <Trash2 className="size-4" aria-hidden /> Hapus foto default
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--muted))] px-3 py-2">
                  <Download className="size-4" aria-hidden /> Ekspor JSON/CSV
                </span>
              </div>
            </article>
          </div>
        </section>

        {/* INSIGHT PREVIEW */}
        <section className="border-y border-[hsl(var(--border))] bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:items-center md:px-6 md:py-20">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Insight mingguan yang netral
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:text-base">
                Ringkasan menjelaskan pola, bukan menilai Anda. Selalu menyebut rentang data dan
                batasan.
              </p>
              <p className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] p-4 text-sm md:text-base">
                “Protein lebih konsisten pada hari ketika sarapan dicatat sebelum pukul 09.00.”
              </p>
              <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">
                Berdasarkan 5 hari tercatat
              </span>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] p-5 shadow-sm">
              <p className="text-sm font-medium">Konsumsi vs target (contoh)</p>
              <div className="mt-4 space-y-3">
                {[
                  { d: "Sen", c: 72 },
                  { d: "Sel", c: 55 },
                  { d: "Rab", c: 88 },
                  { d: "Kam", c: 40 },
                  { d: "Jum", c: 70 },
                  { d: "Sab", c: 30 },
                  { d: "Min", c: 20 },
                ].map((b) => (
                  <div key={b.d} className="flex items-center gap-3 text-sm">
                    <span className="w-8 text-[hsl(var(--muted-foreground))]">{b.d}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                      <div
                        className="h-full rounded-full bg-[hsl(var(--primary))]"
                        style={{ width: `${b.c}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRIVASI — two column dark */}
        <section id="privasi" className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="grid gap-10 rounded-2xl bg-slate-900 px-6 py-10 text-white md:grid-cols-2 md:px-10 md:py-12">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Anda tetap memegang kontrol
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300 md:text-base">
                Atur Gizi tidak menyimpan hasil AI tanpa konfirmasi. Foto makanan default dihapus
                setelah analisis selesai, dan data dapat diekspor atau dihapus melalui aplikasi.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <PrimaryCta className="!bg-white !text-slate-900 hover:!brightness-100" />
                <a
                  href="#faq"
                  className="inline-flex min-h-11 items-center rounded-lg border border-white/30 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Baca FAQ privasi
                </a>
              </div>
            </div>
            <ul className="grid gap-4 sm:grid-cols-1">
              {[
                {
                  icon: Sparkles,
                  t: "AI membuat estimasi, bukan diagnosis",
                  d: "Semua angka ditampilkan sebagai perkiraan.",
                },
                {
                  icon: PencilLine,
                  t: "Hasil selalu ditinjau sebelum tersimpan",
                  d: "Tidak ada log otomatis dari draft AI.",
                },
                {
                  icon: Trash2,
                  t: "Foto default dihapus setelah analisis",
                  d: "Ubah preferensi di Setelan kapan saja.",
                },
                {
                  icon: Download,
                  t: "Data dapat diekspor dan akun dapat dihapus",
                  d: "Portabilitas dan penghapusan dari dalam aplikasi.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.t} className="flex gap-3 rounded-xl bg-white/5 p-4">
                    <Icon className="mt-0.5 size-5 shrink-0 text-emerald-300" aria-hidden />
                    <div>
                      <p className="font-medium">{item.t}</p>
                      <p className="mt-1 text-sm text-slate-300">{item.d}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <FaqSection />

        {/* FINAL CTA */}
        <section className="border-t border-[hsl(var(--border))] bg-gradient-to-b from-emerald-50/80 to-white">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center md:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Mulai mencatat tanpa menjadikan setiap makan sebagai ujian
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[hsl(var(--muted-foreground))] md:text-base">
              Buat akun, atur target, lalu catat makanan pertama. Gratis untuk mulai — tidak perlu
              kartu pembayaran.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryCta className="w-full sm:w-auto" />
              <a
                href="#demo-ai"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-white px-5 py-3 text-sm font-medium sm:w-auto"
              >
                Lihat demo AI
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[hsl(var(--border))] bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
          <div className="md:col-span-1">
            <p className="text-lg font-bold text-[hsl(var(--primary))]">Atur Gizi</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Catat dengan ringan. Tinjau dengan sadar.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Produk</p>
            <ul className="mt-3 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <li>
                <a href="#fitur" className="hover:text-[hsl(var(--foreground))]">
                  Fitur
                </a>
              </li>
              <li>
                <a href="#cara-kerja" className="hover:text-[hsl(var(--foreground))]">
                  Cara kerja
                </a>
              </li>
              <li>
                <a href="#privasi" className="hover:text-[hsl(var(--foreground))]">
                  Privasi
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[hsl(var(--foreground))]">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Akun</p>
            <ul className="mt-3 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <li>
                <LoginLink
                  postLoginRedirectURL="/dashboard"
                  className="hover:text-[hsl(var(--foreground))]"
                >
                  Masuk
                </LoginLink>
              </li>
              <li>
                <RegisterLink
                  postLoginRedirectURL="/onboarding"
                  className="hover:text-[hsl(var(--foreground))]"
                >
                  Daftar
                </RegisterLink>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <li>
                <a href="#privasi" className="hover:text-[hsl(var(--foreground))]">
                  Kebijakan privasi
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[hsl(var(--foreground))]">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[hsl(var(--border))] px-4 py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
          <p>
            Estimasi kalori dan nutrisi dapat tidak akurat. Aplikasi ini bukan pengganti nasihat
            medis atau ahli gizi.
          </p>
          <p className="mt-2">© {new Date().getFullYear()} Atur Gizi</p>
        </div>
      </footer>
    </div>
  );
}
