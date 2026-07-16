"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Apakah Atur Gizi alat medis?",
    a: "Bukan. Atur Gizi adalah wellness tracker untuk membantu pencatatan. Estimasi nutrisi bukan diagnosis dan tidak menggantikan ahli gizi atau tenaga medis.",
  },
  {
    q: "Seberapa akurat estimasi foto?",
    a: "Estimasi AI bergantung pada kualitas foto, porsi yang terlihat, dan bahan yang tidak terlihat. Hasil selalu ditandai sebagai estimasi dan dapat Anda edit sebelum disimpan.",
  },
  {
    q: "Apakah hasil AI dapat diedit?",
    a: "Ya. AI hanya membuat draft. Anda meninjau nama, porsi, kalori, dan makro, lalu mengonfirmasi. Tidak ada log yang disimpan tanpa konfirmasi.",
  },
  {
    q: "Apa yang terjadi pada foto saya?",
    a: "Secara default foto dihapus setelah proses analisis selesai. Anda dapat mengubah preferensi simpan foto di Setelan kapan saja.",
  },
  {
    q: "Bisakah data diekspor?",
    a: "Ya. Ekspor JSON dan CSV tersedia dari menu Ekspor di aplikasi, termasuk profil, catatan makanan, dan aktivitas.",
  },
  {
    q: "Apakah tersedia makanan Indonesia?",
    a: "Ya, alur AI dan pencatatan mendukung nama serta porsi rumah tangga yang umum di Indonesia. Database akan terus diperluas.",
  },
  {
    q: "Apakah ada batas pindai AI?",
    a: "Ada kuota harian (10 pindai/hari pada paket gratis). Anda tetap dapat mencatat makanan secara manual, favorit, atau barcode.",
  },
  {
    q: "Apakah perlu kartu pembayaran untuk mulai?",
    a: "Tidak. Mulai gratis tanpa kartu pembayaran. Paket berbayar opsional untuk kuota AI lebih besar.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Pertanyaan umum
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[hsl(var(--muted-foreground))] md:text-base">
        Jawaban singkat tentang cara kerja, privasi, dan batasan produk.
      </p>
      <div className="mt-8 divide-y divide-[hsl(var(--border))] rounded-2xl border border-[hsl(var(--border))] bg-white shadow-sm">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-medium md:px-5 md:text-base"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              {isOpen ? (
                <p className="px-4 pb-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:px-5 md:text-base">
                  {item.a}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
