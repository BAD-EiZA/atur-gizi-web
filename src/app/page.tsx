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
  title: "Atur Gizi — Catat Makanan dan Aktivitas dengan Lebih Mudah",
  description:
    "Catat makanan lewat foto, pencarian, atau input manual. Periksa estimasi AI, pantau target harian, dan lihat ringkasan mingguan tanpa penilaian.",
};

const marqueeItems = [
  "Pindai makanan dari foto",
  "Cari makanan lebih cepat",
  "Catat manual kapan saja",
  "Pantau kalori dan makro",
  "Catat aktivitas",
  "Impor ringkasan olahraga",
  "Lihat riwayat",
  "Dapatkan ringkasan mingguan",
  "Ekspor data",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <SiteHeader />

      <main className="w-full max-w-full overflow-x-hidden">
        {/* HERO */}
        <section className="relative min-h-[min(92vh,860px)] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url(/brand/hero-plate.jpg)",
              filter: "contrast(1.1) saturate(0.85)",
            }}
            role="img"
            aria-label="Sepiring nasi, ayam panggang, dan sayuran"
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
            <p className="mb-4 text-sm font-medium text-white/70">
              Pencatatan gizi yang lebih manusiawi
            </p>
            <h1 className="display-h1 mx-auto max-w-5xl text-white">
              Catat makan tanpa{" "}
              <span
                className="mx-1.5 inline-block h-9 w-20 rounded-full bg-cover bg-center align-middle shadow-lg ring-2 ring-white/20 md:h-11 md:w-28"
                style={{ backgroundImage: "url(/brand/inline-food.jpg)" }}
                aria-hidden
              />{" "}
              hidup terasa seperti spreadsheet
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
              Foto makanan, cari dari katalog, atau catat manual. Atur Gizi membantu memperkirakan
              kalori dan makronutrien, lalu kamu yang memeriksa dan menentukan hasil akhirnya.
            </p>
            <div className="mt-10">
              <HeroCta />
            </div>
            <p className="mt-6 text-xs text-white/55 md:text-sm">
              Tanpa kartu kredit · Hasil AI selalu bisa diedit · Bukan alat medis
            </p>
          </div>
        </section>

        {/* Marquee */}
        <section
          className="overflow-hidden border-b border-[hsl(var(--border))] bg-white py-5"
          aria-hidden
        >
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
          <h2 className="display-h2 text-center">Tiga langkah, kendali tetap di tanganmu</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[hsl(var(--muted-foreground))]">
            Mulai dari foto, pencarian, atau input manual. Tidak ada data yang disimpan tanpa
            persetujuanmu.
          </p>

          <ol className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Foto, cari, atau tulis",
                d: "Pilih cara tercepat untuk mencatat makananmu hari itu.",
                icon: Utensils,
              },
              {
                n: "02",
                t: "Periksa perkiraannya",
                d: "Tinjau nama makanan, porsi, kalori, dan makronutrien yang ditampilkan.",
                icon: PencilLine,
              },
              {
                n: "03",
                t: "Ubah lalu simpan",
                d: "Koreksi bagian yang diperlukan, kemudian simpan saat datanya sudah terasa tepat.",
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
              <h2 className="display-h2">AI menyiapkan draf. Kamu yang memutuskan.</h2>
              <p className="mt-4 text-[hsl(var(--muted-foreground))]">
                Estimasi dibuat untuk mempercepat pencatatan, bukan menggantikan penilaianmu. Setiap
                hasil dapat diperiksa dan diubah sebelum masuk ke riwayat.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:items-stretch">
              <div className="group overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-white shadow-[var(--shadow-md)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/illustrations/food.jpg"
                  alt="Contoh foto makanan yang siap dianalisis"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col justify-between space-y-3 rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-[var(--shadow-sm)] md:p-8">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    Hasil perkiraan
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
                        name: "Ayam panggang",
                        portion: "1 potong",
                        conf: "Tinggi",
                        confClass: "bg-emerald-100 text-emerald-900",
                        kcal: "210 kkal",
                      },
                      {
                        name: "Tumis sayuran",
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
                      Ubah detail
                    </span>
                    <span className="inline-flex min-h-11 items-center rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-medium text-white">
                      Gunakan draf
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
                    Belum ada data yang disimpan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE BENTO */}
        <section id="fitur" className="mx-auto max-w-6xl px-4 py-28 md:px-6 md:py-40">
          <h2 className="display-h2">Dirancang untuk kontrol, bukan otomatisasi buta</h2>
          <p className="mt-4 max-w-2xl text-[hsl(var(--muted-foreground))]">
            Setiap fitur membantu mempercepat pekerjaan kecil tanpa mengambil keputusan penting
            darimu.
          </p>

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
                Ambil foto makanan dan dapatkan perkiraan awal dalam beberapa langkah.
              </p>
              <ul className="relative mt-8 space-y-3 text-sm">
                {[
                  "Nama makanan",
                  "Perkiraan porsi",
                  "Kalori dan makronutrien",
                  "Dapat diedit sebelum disimpan",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check className="mt-0.5 size-4 text-[hsl(var(--primary))]" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-[var(--shadow-sm)] transition duration-500 hover:shadow-[var(--shadow-md)] md:col-span-2">
              <Sparkles className="size-5 text-[hsl(var(--primary))]" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">Target yang transparan</h3>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                Lihat bagaimana target kalori dan makronutrien digunakan dalam perhitungan
                harianmu.
              </p>
              <p className="mt-4 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                Target harian · Kalori masuk · Sisa kalori
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
                Gunakan kembali makanan yang sering dicatat atau cari dari katalog tanpa harus
                mengisi semuanya dari awal.
              </p>
            </article>

            <article className="rounded-3xl border border-[hsl(var(--border))] bg-slate-900 p-6 text-white shadow-[var(--shadow-sm)] md:col-span-1">
              <ShieldCheck className="size-5 text-emerald-300" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">Asisten AI</h3>
              <p className="mt-2 text-sm text-slate-300">
                Cari makanan, periksa catatan yang terlewat, bandingkan pilihan, dan pahami pola
                pencatatanmu.
              </p>
              <span className="mt-4 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
                Selalu berupa draf
              </span>
            </article>
          </div>
        </section>

        {/* RINGKASAN MINGGUAN */}
        <section className="border-y border-[hsl(var(--border))] bg-white">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-28 md:grid-cols-2 md:items-center md:px-6 md:py-40">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--primary))]">
                Lihat pola, bukan nilai rapor
              </p>
              <h2 className="display-h2 mt-2">Ringkasan mingguan yang netral</h2>
              <p className="mt-4 text-[hsl(var(--muted-foreground))]">
                Lihat pola kalori, protein, karbohidrat, lemak, dan aktivitas tanpa label “baik”
                atau “buruk”.
              </p>
              <div className="mt-6 space-y-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] p-5 text-sm leading-relaxed md:text-base">
                <p>Minggu ini kamu mencatat 5 dari 7 hari.</p>
                <p>Rata-rata kalori masuk: 1.640 kkal per hari.</p>
                <p>Hari dengan data yang belum lengkap tetap ditandai dengan jelas.</p>
              </div>
              <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
                Ringkasan menjadi lebih representatif saat lebih banyak hari tercatat.
              </p>
            </div>
            <div className="rounded-3xl border border-[hsl(var(--border))] p-6 shadow-[var(--shadow-sm)]">
              <p className="text-sm font-medium">Kalori masuk dibandingkan target</p>
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
              <h2 className="display-h2 text-white">Data kesehatanmu tetap milikmu</h2>
              <p className="mt-5 text-base leading-relaxed text-slate-300">
                Atur Gizi hanya menggunakan data untuk menjalankan fitur yang kamu pilih. Kamu dapat
                mengubah pengaturan privasi, mengekspor data, atau menghapus akun kapan saja.
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
                  Baca tentang privasi
                </a>
              </div>
              <p className="mt-6 text-xs text-slate-400">
                Atur Gizi bukan alat medis dan tidak menggantikan saran dokter atau ahli gizi.
              </p>
            </div>
            <ul className="grid gap-3">
              {[
                {
                  icon: Trash2,
                  t: "Foto tidak harus disimpan",
                  d: "Secara default, foto makanan dihapus setelah analisis atau konfirmasi. Penyimpanan foto hanya aktif jika kamu memilihnya di Pengaturan.",
                },
                {
                  icon: PencilLine,
                  t: "Hasil AI dapat dikoreksi",
                  d: "Nama makanan, porsi, kalori, dan makronutrien selalu dapat diubah sebelum dan setelah disimpan.",
                },
                {
                  icon: Download,
                  t: "Ekspor data kapan saja",
                  d: "Unduh salinan data makanan, aktivitas, berat badan, dan pengaturan akunmu.",
                },
                {
                  icon: Sparkles,
                  t: "Hapus akun secara permanen",
                  d: "Kamu dapat menghapus akun beserta seluruh data melalui halaman Profil atau Pengaturan.",
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
              Pencatatan makanan dan aktivitas yang lebih sederhana, transparan, dan tetap berada
              dalam kendalimu.
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
                <a href="#demo-ai" className="hover:text-[hsl(var(--foreground))]">
                  Pindai makanan
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-[hsl(var(--foreground))]">
                  Ringkasan mingguan
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Bantuan</p>
            <ul className="mt-3 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <li>
                <a href="#faq" className="hover:text-[hsl(var(--foreground))]">
                  Pertanyaan umum
                </a>
              </li>
              <li>
                <a href="#cara-kerja" className="hover:text-[hsl(var(--foreground))]">
                  Panduan penggunaan
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Legal & akun</p>
            <ul className="mt-3 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <li>
                <a href="#privasi" className="hover:text-[hsl(var(--foreground))]">
                  Kebijakan privasi
                </a>
              </li>
              <li>
                <a href="#privasi" className="hover:text-[hsl(var(--foreground))]">
                  Keamanan data
                </a>
              </li>
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
                  Mulai gratis
                </RegisterLink>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[hsl(var(--border))] px-4 py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
          <p>
            Atur Gizi bukan alat medis. Estimasi kalori dan makronutrien dapat berbeda dari nilai
            sebenarnya.
          </p>
          <p className="mt-2">© 2026 Atur Gizi. Seluruh hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
