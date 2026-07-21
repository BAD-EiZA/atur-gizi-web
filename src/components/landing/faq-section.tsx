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
    a: "Perkiraan AI bergantung pada kualitas foto, porsi yang terlihat, dan bahan yang tidak terlihat. Hasil selalu ditandai sebagai perkiraan dan dapat kamu ubah sebelum disimpan.",
  },
  {
    q: "Apakah hasil AI dapat diedit?",
    a: "Ya. AI hanya membuat draf. Kamu meninjau nama, porsi, kalori, dan makronutrien, lalu mengonfirmasi. Tidak ada catatan yang disimpan tanpa konfirmasi.",
  },
  {
    q: "Apa yang terjadi pada foto saya?",
    a: "Secara default foto dihapus setelah proses analisis selesai. Kamu dapat mengubah preferensi simpan foto di Pengaturan kapan saja.",
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
    a: "Ada kuota harian (10 pindai/hari pada paket gratis). Kamu tetap dapat mencatat makanan secara manual, favorit, atau barcode.",
  },
  {
    q: "Apakah perlu kartu pembayaran untuk mulai?",
    a: "Tidak. Mulai gratis tanpa kartu pembayaran. Paket berbayar opsional untuk kuota AI lebih besar.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-28 md:px-6 md:py-40">
      <h2 className="display-h2 text-center">Pertanyaan umum</h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-[hsl(var(--muted-foreground))]">
        Jawaban singkat tentang cara kerja, privasi, dan batasan produk.
      </p>
      <div className="mt-12 divide-y divide-[hsl(var(--border))] overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-white shadow-[var(--shadow-sm)]">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left text-sm font-medium md:text-base"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              {isOpen ? (
                <p className="px-5 pb-5 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] md:text-base">
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
