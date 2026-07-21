"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Apakah Atur Gizi merupakan aplikasi diet?",
    a: "Atur Gizi adalah alat pencatatan makanan dan aktivitas. Aplikasi ini membantu kamu melihat data dan pola, tetapi tidak menilai makanan sebagai “baik” atau “buruk” dan tidak memberikan diagnosis medis.",
  },
  {
    q: "Seberapa akurat hasil dari AI?",
    a: "Hasil AI adalah perkiraan awal berdasarkan foto atau informasi yang tersedia. Akurasinya dapat dipengaruhi oleh pencahayaan, sudut foto, ukuran porsi, bahan, dan cara memasak. Karena itu, semua hasil perlu diperiksa sebelum disimpan.",
  },
  {
    q: "Apakah saya bisa mengubah hasil AI?",
    a: "Bisa. Kamu dapat mengubah nama makanan, jumlah, satuan, kalori, protein, karbohidrat, lemak, dan catatan sebelum maupun setelah data disimpan.",
  },
  {
    q: "Apakah saya harus menggunakan foto?",
    a: "Tidak. Kamu dapat mencari makanan dari katalog, menggunakan kembali catatan sebelumnya, atau mengisi data secara manual.",
  },
  {
    q: "Apakah foto makanan saya disimpan?",
    a: "Secara default, foto dihapus setelah analisis atau setelah hasil dikonfirmasi. Kamu dapat memilih untuk menyimpan foto melalui Pengaturan.",
  },
  {
    q: "Apakah saya bisa mencatat aktivitas?",
    a: "Bisa. Pilih jenis aktivitas dan durasinya, atau impor screenshot ringkasan dari aplikasi kebugaran untuk membuat draf yang dapat kamu periksa.",
  },
  {
    q: "Apakah Atur Gizi memberikan saran medis?",
    a: "Tidak. Informasi di Atur Gizi bersifat umum dan digunakan untuk membantu pencatatan. Untuk kebutuhan medis atau rencana gizi khusus, konsultasikan dengan dokter atau ahli gizi.",
  },
  {
    q: "Bisakah saya mengekspor atau menghapus data?",
    a: "Bisa. Kamu dapat mengekspor data dan menghapus akun beserta seluruh datanya melalui halaman Profil atau Pengaturan.",
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
