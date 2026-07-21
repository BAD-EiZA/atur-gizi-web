/** Short Indonesian explanations for InfoTip — keep 1–2 sentences. */
export const GLOSSARY = {
  remaining_intake:
    "Sisa kalori untuk makan hari ini: target dikurangi total makanan. Tidak ditambah dari aktivitas (mode default).",
  remaining_net:
    "Sisa setelah aktivitas: target − (makan − kalori terbakar). Mode eat-back; bisa terasa “lebih longgar” setelah olahraga.",
  budget_mode:
    "Intake-only: sisa = target − makan (disarankan). Eat-back: sisa = target − (makan − aktivitas). Target TDEE sudah memasukkan aktivitas harian, jadi eat-back bisa double-count.",
  budget_mode_intake:
    "Hanya menghitung makanan. Aktivitas tidak menambah jatah kalori. Cocok jika target sudah dari TDEE.",
  budget_mode_eat_back:
    "Aktivitas “mengembalikan” kalori ke sisa. Gunakan sadar: TDEE sering sudah memperhitungkan gerak harian.",
  consumed:
    "Total kalori dari semua catatan makanan hari ini (estimasi atau label).",
  burned:
    "Estimasi kalori terbakar dari aktivitas yang Anda catat (MET, perangkat, atau screenshot).",
  net_calories:
    "Konsumsi dikurangi kalori aktivitas. Bukan sisa anggaran kecuali mode eat-back aktif.",
  progress:
    "Seberapa jauh asupan (atau net, tergantung mode) mendekati target harian.",
  protein:
    "Protein (gram). Membantu kenyang dan massa otot. Target bisa g/kg berat badan.",
  carbs:
    "Karbohidrat (gram). Sumber energi utama. Sisa kalori setelah protein dan lemak.",
  fat: "Lemak (gram). Padat kalori (9 kkal/g). Penting untuk hormon dan penyerapan vitamin.",
  macros:
    "Makronutrien: protein, karbohidrat, dan lemak. Bersama-sama membentuk kalori (Atwater).",
  atwater:
    "Perkiraan kalori dari makro: protein ×4 + karbo ×4 + lemak ×9 (kkal per gram).",
  calorie_target:
    "Target asupan kalori harian (estimasi dari BMR/TDEE dan tujuan, atau manual).",
  bmr: "Basal Metabolic Rate: kalori yang dibutuhkan tubuh saat istirahat total. Bukan target makan.",
  tdee: "Total Daily Energy Expenditure: perkiraan kalori harian termasuk aktivitas (BMR × faktor aktivitas).",
  met: "MET (Metabolic Equivalent): seberapa intens aktivitas dibanding istirahat. Dipakai menghitung kalori terbakar.",
  intensity:
    "Intensitas subyektif (ringan / sedang / berat). Menyesuaikan nilai MET agar estimasi lebih realistis.",
  rpe: "Rate of Perceived Exertion: seberapa berat terasa (skala 1–10). Membantu konteks, bukan pengganti MET.",
  avg_hr:
    "Denyut jantung rata-rata (bpm) selama sesi. Bisa memperbaiki estimasi kalori jika diisi.",
  distance:
    "Jarak tempuh. Untuk jalan/lari/sepeda, kecepatan dari jarak + durasi bisa memilih MET yang lebih tepat.",
  ai_confidence:
    "Seberapa yakin AI terhadap hasil. Rendah = wajib tinjau porsi dan angka sebelum menyimpan.",
  ai_draft:
    "Hasil sementara dari AI. Belum tersimpan ke log sampai Anda mengonfirmasi.",
  portion_scale:
    "Mengubah porsi menyesuaikan kalori dan makro secara proporsional dari nilai awal draf.",
  nutrient_basis:
    "Apakah angka gizi dihitung per 1 serving label atau per 100 g. Jangan campur keduanya.",
  barcode_serving:
    "Nilai gizi untuk satu porsi sesuai label kemasan (bukan selalu 100 g).",
  barcode_100g:
    "Nilai gizi per 100 gram. Cocok jika Anda menimbang porsi sendiri.",
  adaptive_tdee:
    "Saran TDEE dari tren berat dan rata-rata asupan Anda. Estimasi, bukan lab. Perlu data cukup dulu.",
  weight_log:
    "Catatan berat dari waktu ke waktu. Memicu hitung ulang target dan (jika data cukup) saran TDEE adaptif.",
  macro_targets:
    "Target harian protein, karbo, dan lemak (gram). Default dari berat badan dan tujuan; bisa diedit.",
  mifflin:
    "Rumus Mifflin–St Jeor untuk BMR. Varian A biasanya pria, B wanita. Estimasi populasi, bukan individu.",
  sex_bmr:
    "Jenis kelamin dipakai memilih formula BMR dan koefisien estimasi dari denyut jantung.",
  retain_photos:
    "Jika aktif, foto makanan disimpan setelah AI. Default nonaktif: foto dihapus setelah analisis.",
  formula_version:
    "Versi rumus yang dipakai saat log dibuat. Riwayat lama tidak diubah otomatis.",
  device_source:
    "Angka berasal dari perangkat atau screenshot (bukan murni rumus MET).",
  screenshot_import:
    "AI membaca angka di layar app kebugaran. Anda harus mengonfirmasi sebelum disimpan.",
  food_catalog:
    "Angka dari katalog makanan referensi (bukan estimasi bebas AI), diskalakan ke porsi bila memungkinkan.",
  personal_bias:
    "Penyesuaian dari koreksi porsi Anda sebelumnya untuk makanan serupa.",
  insights_bars:
    "Batang gelap: konsumsi. Area pudar: target hari itu. Membandingkan pola, bukan menghakimi.",
  ai_tools:
    "Alat AI membuat draf. Hasil tetap estimasi dan bisa diedit sebelum masuk catatan resmi.",
  meal_plan:
    "Rencana makan ke depan. Bukan log aktual sampai Anda mencatatnya sebagai makanan.",
  export_data:
    "Unduh data akun (JSON/CSV). Foto Cloudinary biasanya tidak ikut diekspor.",
  net_mode_hint:
    "Mode anggaran aktif menentukan apakah sisa utama memakai “makan saja” atau “net aktivitas”.",
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
