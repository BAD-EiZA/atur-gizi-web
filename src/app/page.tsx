import {
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
import { FinalCta, HeroCta } from "@/components/landing/auth-cta";
import { Logo } from "@/components/logo";
import { LandingMotion } from "@/components/landing/landing-motion";

export const metadata = {
  title: "Atur Gizi — Catat Makan, Aktivitas, dan Insight Mingguan",
  description:
    "Catat makanan manual, dari barcode, atau melalui foto. Tinjau estimasi AI sebelum menyimpan dan pahami pola mingguan dengan bahasa yang netral.",
};

const marqueeItems = [
  "AI draft · Anda konfirmasi",
  "Target transparan",
  "Foto default dihapus",
  "Ekspor data kapan saja",
  "Bukan alat medis",
  "Estimasi yang bisa diedit",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <SiteHeader />

      <main className="w-full max-w-full overflow-x-hidden">
        {/* HERO — cinematic center */}
        <section className="relative min-h-[min(92vh,860px)] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url(/brand/hero-plate.jpg)",
              filter: "contrast(1.1) saturate(0.85)",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(6, 40, 28, 0.55), rgba(4, 18, 14, 0.88) 70%)",
            }}
            aria-hidden
          />
          <div className="grain absolute inset-0" aria-hidden />

          <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-20 text-center md:px-6 md:pb-32 md:pt-28">
            <h1 className="display-h1 mx-auto max-w-5xl text-white">
              Catat makan tanpa{" "}
              <span
                className="mx-1.5 inline-block h-9 w-20 rounded-full bg-cover bg-center align-middle shadow-lg ring-2 ring-white/20 md:h-11 md:w-28"
                style={{ backgroundImage: "url(/brand/inline-food.jpg)" }}
                aria-hidden
              />{" "}
              hidup terasa spreadsheet
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
              Manual, barcode, atau foto. Tinjau setiap estimasi AI sebelum menyimpan.
              Pola mingguan tanpa penilaian berlebihan.
            </p>
            <div className="mt-10">
              <HeroCta />
            </div>
          </div>
        </section>

        {/* Marquee */}
        <section className="border-b border-[hsl(var(--border))] bg-white py-5 overflow-hidden" aria-hidden>
          <div className="marquee-track gap-10 whitespace-nowrap px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
            {[...marqueeItems, ...marqueeItems].map((t, i) => (
              <span key={`${t}-${i}`} className="inline-flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-[hsl(var(--primary))]" />
                {t}
              </span>
            ))}
          </div>
        </section>

        <LandingMotion />

        {/* CARA KERJA */}
        <section id="cara-kerja" className="mx-auto max-w-6xl px-4 py-28 md:px-6 md:py-40">
          <h2 className="display-h2 text-center">Tiga langkah, kendali di tangan Anda</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[hsl(var(--muted-foreground))]">
            AI membuat draft. Anda yang menentukan hasil akhirnya.
          </p>

          <ol className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Catat dengan cara paling mudah",
                d: "Manual, favorit, barcode, atau foto piring.",
                icon: Utensils,
              },
              {
                n: "02",
                t: "Periksa sebelum tersimpan",
                d: "Ubah nama, porsi, nutrisi. Tanpa konfirmasi, tidak ada log.",
                icon: PencilLine,
              },
              {
                n: "03",
                t: "Lihat pola, bukan penilaian",
                d: "Ringkasan harian dan mingguan dengan bahasa netral.",
                icon: Sparkles,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <li
                  key={s.n}
                  className="group relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-white p-8 shadow-[var(--shadow-sm)] transition duration-500 hover:shadow-[var(--shadow-md)]"
                >
                  <span className="text-5xl font-bold tabular-nums text-[hsl(var(--primary)/0.15)]">
                    {s.n}
                  </span>
                  <div className="mt-6 inline-flex size-12 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:text-base">
                    {s.d}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* DEMO AI */}
        <section id="demo-ai" className="border-y border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)]">
          <div className="mx-auto max-w-6xl px-4 py-28 md:px-6 md:py-40">
            <div className="max-w-2xl">
              <h2 className="display-h2">AI membuat draft. Anda yang menentukan.</h2>
              <p className="mt-4 text-[hsl(var(--muted-foreground))]">
                Setiap item punya estimasi, keyakinan, dan asumsi — selalu bisa diedit.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:items-stretch">
              <div className="group overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-white shadow-[var(--shadow-md)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/illustrations/food.jpg"
                  alt="Foto makanan untuk demo pindai AI"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col justify-between space-y-3 rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-[var(--shadow-sm)] md:p-8">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    Terdeteksi (draft)
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      {
                        name: "Nasi putih",
                        portion: "150 g",
                        conf: "Sedang",
                        confClass: "bg-amber-100 text-amber-900",
                        kcal: "195 kkal",
                      },
                      {
                        name: "Ayam bakar",
                        portion: "1 potong",
                        conf: "Tinggi",
                        confClass: "bg-emerald-100 text-emerald-900",
                        kcal: "210 kkal",
                      },
                      {
                        name: "Tumis sayur",
                        portion: "100 g",
                        conf: "Sedang",
                        confClass: "bg-amber-100 text-amber-900",
                        kcal: "85 kkal",
                      },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-[hsl(var(--border))] p-4 transition hover:border-[hsl(var(--primary)/0.25)]"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {item.portion} · {item.kcal}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${item.confClass}`}
                        >
                          {item.conf}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="inline-flex min-h-11 items-center rounded-full border border-[hsl(var(--border))] px-5 text-sm font-medium">
                      Edit
                    </span>
                    <span className="inline-flex min-h-11 items-center rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-medium text-white">
                      Konfirmasi
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
                    Tidak ada hasil AI yang disimpan tanpa konfirmasi Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE BENTO — gapless dense */}
        <section id="fitur" className="mx-auto max-w-6xl px-4 py-28 md:px-6 md:py-40">
          <h2 className="display-h2">Dirancang untuk kontrol, bukan otomatisasi buta</h2>
          <p className="mt-4 max-w-2xl text-[hsl(var(--muted-foreground))]">
            Pencatatan ringan, target transparan, privasi di depan.
          </p>

          {/* 4-col dense: 8+4 / 4+4+4 — fills 2 rows completely */}
          <div className="mt-14 grid auto-rows-fr grid-flow-dense gap-4 md:grid-cols-4">
            <article className="group relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-br from-emerald-50 via-white to-white p-8 shadow-[var(--shadow-sm)] md:col-span-2 md:row-span-2 md:p-10">
              <div
                className="absolute -right-8 -top-8 size-40 rounded-full bg-[hsl(var(--primary)/0.08)] blur-2xl transition group-hover:scale-125"
                aria-hidden
              />
              <Camera className="relative size-7 text-[hsl(var(--primary))]" aria-hidden />
              <h3 className="relative mt-6 text-2xl font-semibold tracking-tight">
                Pindai makanan dengan AI
              </h3>
              <p className="relative mt-3 max-w-md text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:text-base">
                Ambil foto, tinjau makanan dan porsi, koreksi sebelum menyimpan. Keyakinan dan
                asumsi selalu terlihat.
              </p>
              <ul className="relative mt-8 space-y-3 text-sm">
                {["Multi-item + edit porsi", "Badge keyakinan", "Keputusan akhir di Anda"].map(
                  (t) => (
                    <li key={t} className="flex gap-2">
                      <Check className="mt-0.5 size-4 text-[hsl(var(--primary))]" aria-hidden />
                      {t}
                    </li>
                  ),
                )}
              </ul>
            </article>

            <article className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-[var(--shadow-sm)] transition duration-500 hover:shadow-[var(--shadow-md)] md:col-span-2">
              <Sparkles className="size-5 text-[hsl(var(--primary))]" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">Target transparan</h3>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                BMR, TDEE, penyesuaian tujuan, versi formula. Tidak berubah diam-diam.
              </p>
            </article>

            <article className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-[var(--shadow-sm)] transition duration-500 hover:shadow-[var(--shadow-md)] md:col-span-1">
              <div className="flex flex-wrap gap-1.5">
                {["Favorit", "Barcode", "Manual"].map((c) => (
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
              <h3 className="mt-4 text-lg font-semibold">Pencatatan cepat</h3>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                Bukan pekerjaan rumah.
              </p>
            </article>

            <article className="rounded-3xl border border-[hsl(var(--border))] bg-slate-900 p-6 text-white shadow-[var(--shadow-sm)] md:col-span-1">
              <ShieldCheck className="size-5 text-emerald-300" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">Privasi dulu</h3>
              <p className="mt-2 text-sm text-slate-300">
                Foto default dihapus. Ekspor & hapus akun dari app.
              </p>
            </article>
          </div>
        </section>

        {/* Desire — scrub text + images via client component already in LandingMotion pin */}

        {/* INSIGHT */}
        <section className="border-y border-[hsl(var(--border))] bg-white">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-28 md:grid-cols-2 md:items-center md:px-6 md:py-40">
            <div>
              <h2 className="display-h2">Insight mingguan yang netral</h2>
              <p className="mt-4 text-[hsl(var(--muted-foreground))]">
                Ringkasan menjelaskan pola, bukan menilai Anda. Selalu menyebut rentang data.
              </p>
              <p className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] p-5 text-base leading-relaxed">
                “Protein lebih konsisten pada hari ketika sarapan dicatat sebelum pukul 09.00.”
              </p>
            </div>
            <div className="rounded-3xl border border-[hsl(var(--border))] p-6 shadow-[var(--shadow-sm)]">
              <p className="text-sm font-medium">Konsumsi vs target</p>
              <div className="mt-5 space-y-3.5">
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
                        className="h-full rounded-full bg-[hsl(var(--primary))] transition-all"
                        style={{ width: `${b.c}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRIVASI */}
        <section id="privasi" className="mx-auto max-w-6xl px-4 py-28 md:px-6 md:py-40">
          <div className="grid gap-10 overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white md:grid-cols-2 md:px-12 md:py-16">
            <div>
              <h2 className="display-h2 text-white">Anda tetap memegang kontrol</h2>
              <p className="mt-5 text-base leading-relaxed text-slate-300">
                Tidak ada log AI tanpa konfirmasi. Foto default dihapus setelah analisis. Data
                diekspor atau dihapus dari aplikasi.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <RegisterLink
                  postLoginRedirectURL="/onboarding"
                  className="inline-flex min-h-12 items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-900"
                >
                  Mulai gratis
                </RegisterLink>
                <a
                  href="#faq"
                  className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Baca FAQ privasi
                </a>
              </div>
            </div>
            <ul className="grid gap-3">
              {[
                {
                  icon: Sparkles,
                  t: "AI estimasi, bukan diagnosis",
                  d: "Semua angka sebagai perkiraan.",
                },
                {
                  icon: PencilLine,
                  t: "Tinjau sebelum tersimpan",
                  d: "Tidak ada log otomatis dari draft.",
                },
                {
                  icon: Trash2,
                  t: "Foto default dihapus",
                  d: "Ubah preferensi di Setelan kapan saja.",
                },
                {
                  icon: Download,
                  t: "Ekspor & hapus akun",
                  d: "Portabilitas dari dalam aplikasi.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.t}
                    className="flex gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
                  >
                    <Icon className="mt-0.5 size-5 shrink-0 text-emerald-300" aria-hidden />
                    <div>
                      <p className="font-medium">{item.t}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.d}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <FaqSection />

        <section className="border-t border-[hsl(var(--border))] bg-gradient-to-b from-emerald-50/80 to-white">
          <div className="mx-auto max-w-3xl px-4 py-28 md:py-36">
            <FinalCta />
          </div>
        </section>
      </main>

      <footer className="border-t border-[hsl(var(--border))] bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
          <div className="md:col-span-1">
            <Logo size={28} />
            <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
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
          <p className="mt-2">© 2026 BAD-EiZA</p>
        </div>
      </footer>
    </div>
  );
}
