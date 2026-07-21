"use client";

import { ScrubWords, ScrollImage, Reveal, PinSplit } from "@/components/motion/gsap";
import { Camera, ShieldCheck, PencilLine } from "lucide-react";

export function LandingMotion() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-4 py-28 md:px-6 md:py-40">
        <Reveal>
          <h2 className="mb-6 text-center text-sm font-medium text-[hsl(var(--primary))]">
            AI membantu membaca. Kamu tetap menentukan.
          </h2>
          <ScrubWords
            text="Setiap angka adalah perkiraan awal, bukan keputusan final. Periksa nama makanan, porsi, kalori, dan makronutrien sebelum menyimpan."
            className="text-center text-2xl font-medium leading-snug tracking-tight text-[hsl(var(--foreground))] md:text-4xl md:leading-snug"
          />
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-24">
        <PinSplit
          className="min-h-[120vh]"
          left={
            <div className="space-y-4 py-4">
              <p className="text-sm font-medium text-[hsl(var(--primary))]">
                Dibuat untuk keputusan yang lebih sadar
              </p>
              <h2 className="display-h2">Kendali manusia di atas otomatisasi</h2>
              <p className="leading-relaxed text-[hsl(var(--muted-foreground))]">
                Atur Gizi tidak menyimpan hasil AI secara diam-diam. Semua perkiraan ditampilkan
                sebagai draf yang dapat kamu periksa, ubah, atau abaikan.
              </p>
              <ul className="space-y-3 pt-4 text-sm">
                {[
                  { icon: Camera, t: "Pindai makanan, lalu periksa hasilnya" },
                  { icon: PencilLine, t: "Cari cepat atau catat manual" },
                  { icon: ShieldCheck, t: "Privasi default aktif" },
                ].map((x) => {
                  const Icon = x.icon;
                  return (
                    <li key={x.t} className="flex items-center gap-3">
                      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      {x.t}
                    </li>
                  );
                })}
              </ul>
            </div>
          }
          right={
            <div className="space-y-6 pb-24">
              {[
                {
                  src: "/brand/gallery-bowl.jpg",
                  alt: "Contoh foto makanan yang siap dianalisis",
                  cap: "Pindai makanan, lalu periksa hasilnya",
                },
                {
                  src: "/brand/gallery-activity.jpg",
                  alt: "Contoh makanan yang dapat dicari atau dicatat manual",
                  cap: "Cari cepat atau catat manual kapan saja",
                },
              ].map((img) => (
                <figure
                  key={img.src}
                  className="overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-white shadow-[var(--shadow-md)]"
                >
                  <ScrollImage
                    src={img.src}
                    alt={img.alt}
                    className="aspect-[4/3]"
                    imgClassName="contrast-110 saturate-75"
                  />
                  <figcaption className="px-5 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    {img.cap}
                  </figcaption>
                </figure>
              ))}
            </div>
          }
        />
      </section>
    </>
  );
}
