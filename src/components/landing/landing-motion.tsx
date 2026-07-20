"use client";

import { ScrubWords, ScrollImage, Reveal, PinSplit } from "@/components/motion/gsap";
import { Camera, ShieldCheck, PencilLine } from "lucide-react";

export function LandingMotion() {
  return (
    <>
      {/* Desire: scrub text + scale images */}
      <section className="mx-auto max-w-5xl px-4 py-28 md:px-6 md:py-40">
        <Reveal>
          <ScrubWords
            text="Estimasi AI bukan kebenaran mutlak. Setiap angka menampilkan asumsi, keyakinan, dan ruang untuk Anda mengoreksi sebelum data tersimpan."
            className="text-center text-2xl font-medium leading-snug tracking-tight text-[hsl(var(--foreground))] md:text-4xl md:leading-snug"
          />
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-24">
        <PinSplit
          className="min-h-[120vh]"
          left={
            <div className="space-y-4 py-4">
              <p className="text-sm font-medium text-[hsl(var(--primary))]">Kenapa terasa berbeda</p>
              <h2 className="display-h2">Kendali manusia di atas otomatisasi</h2>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                Scroll galeri. Setiap momen produk dibangun agar Anda tetap menjadi sumber
                kebenaran — bukan model AI.
              </p>
              <ul className="space-y-3 pt-4 text-sm">
                {[
                  { icon: Camera, t: "Foto jadi draft, bukan log" },
                  { icon: PencilLine, t: "Edit porsi & makro dulu" },
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
                  alt: "Mangkuk makanan sehat",
                  cap: "Pindai piring dalam hitungan detik",
                },
                {
                  src: "/brand/gallery-activity.jpg",
                  alt: "Sayur dan bahan segar",
                  cap: "Aktivitas menambah ruang kalori net",
                },
                {
                  src: "/brand/gallery-insight.svg",
                  alt: "Ilustrasi piring makanan",
                  cap: "Insight netral, tanpa shaming",
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
