/** Short Indonesian tips for InfoTip — simple, neutral, "kamu". */
export const GLOSSARY = {
  remaining_intake:
    "Sisa kalori dihitung dari target dikurangi kalori makanan. Aktivitas tidak menambah sisa kalori.",
  remaining_net:
    "Perkiraan sisa kalori jika kalori dari aktivitas ikut dihitung.",
  budget_mode:
    "Sisa kalori bisa dihitung hanya dari makanan, atau dengan memasukkan aktivitas. Pilih di Pengaturan.",
  budget_mode_intake:
    "Sisa kalori dihitung dari target dikurangi kalori makanan. Kalori dari aktivitas tidak ditambahkan agar tidak terhitung dua kali.",
  budget_mode_eat_back:
    "Sisa kalori dihitung dari target dikurangi makanan, lalu ditambah kalori aktivitas.",
  consumed: "Total kalori dari makanan yang kamu catat hari ini.",
  burned: "Perkiraan kalori dari aktivitas yang kamu catat hari ini.",
  net_calories:
    "Kalori masuk dikurangi kalori aktivitas. Bukan sisa anggaran kecuali kamu memakai cara hitung yang menyertakan aktivitas.",
  progress:
    "Persentase kalori yang sudah tercatat dibandingkan dengan target harianmu.",
  protein: "Protein (gram). Membantu kenyang dan menjaga massa otot.",
  carbs: "Karbohidrat (gram). Sumber energi utama.",
  fat: "Lemak (gram). Sumber energi dan mendukung penyerapan vitamin.",
  macros: "Protein, karbohidrat, dan lemak. Bersama-sama membentuk kalori.",
  atwater:
    "Perkiraan kalori dari makronutrien: protein ×4 + karbohidrat ×4 + lemak ×9 (kkal per gram).",
  calorie_target: "Target kalori harianmu. Bisa dihitung otomatis atau diisi manual.",
  bmr: "Perkiraan kalori yang dibutuhkan tubuh saat istirahat. Bukan target makan harian.",
  tdee: "Perkiraan kebutuhan kalori harian termasuk aktivitas.",
  met: "MET adalah perkiraan tingkat energi yang digunakan saat melakukan aktivitas.",
  intensity: "Intensitas menyesuaikan perkiraan kalori dari aktivitas yang dipilih.",
  rpe: "Seberapa berat aktivitas terasa bagimu, dari 1 sampai 10.",
  avg_hr: "Denyut jantung rata-rata selama aktivitas. Opsional, untuk perkiraan yang lebih baik.",
  distance: "Jarak tempuh. Membantu memperkirakan intensitas jalan, lari, atau sepeda.",
  ai_confidence:
    "Seberapa yakin AI terhadap hasil. Jika rendah, periksa porsi dan angka sebelum menyimpan.",
  ai_draft: "Hasil sementara dari AI. Belum tersimpan sampai kamu mengonfirmasinya.",
  portion_scale:
    "Mengubah porsi akan menyesuaikan kalori dan makronutrien secara proporsional.",
  nutrient_basis:
    "Apakah angka gizi dihitung per 1 porsi label atau per 100 g. Jangan campur keduanya.",
  barcode_serving: "Nilai gizi untuk satu porsi sesuai label kemasan.",
  barcode_100g: "Nilai gizi per 100 gram. Cocok jika kamu menimbang porsi sendiri.",
  adaptive_tdee:
    "Perkiraan kebutuhan kalori dari tren berat dan rata-rata asupanmu. Bukan hasil lab.",
  weight_log:
    "Catatan berat membantu melihat perubahan dari waktu ke waktu dan memperbarui perkiraan target.",
  macro_targets:
    "Target harian protein, karbohidrat, dan lemak. Bisa dihitung otomatis atau kamu atur sendiri.",
  mifflin:
    "Rumus perkiraan kebutuhan kalori istirahat. Varian A biasanya untuk pria, B untuk wanita.",
  sex_bmr:
    "Dipakai untuk memilih rumus perkiraan kebutuhan kalori. Kamu bisa memilih tidak menyebutkan.",
  retain_photos:
    "Secara default, foto dihapus setelah analisis atau setelah hasil dikonfirmasi.",
  formula_version:
    "Versi rumus yang dipakai saat catatan dibuat. Catatan lama tidak diubah otomatis.",
  device_source:
    "Angka berasal dari perangkat atau screenshot, bukan hanya dari rumus perkiraan.",
  screenshot_import:
    "AI membaca angka di layar aplikasi kebugaran. Kamu yang mengonfirmasi sebelum disimpan.",
  food_catalog:
    "Angka dari daftar makanan referensi, disesuaikan dengan porsi bila memungkinkan.",
  personal_bias:
    "Penyesuaian dari koreksi porsi yang pernah kamu buat untuk makanan serupa.",
  insights_bars:
    "Garis gelap menunjukkan kalori yang tercatat. Area terang menunjukkan target harian.",
  ai_tools:
    "Informasi dari AI bersifat umum dan tidak menggantikan saran dokter atau ahli gizi.",
  meal_plan:
    "Rencana makan ke depan. Belum tercatat sebagai makanan sampai kamu menyimpannya di log.",
  export_data:
    "Unduh data akunmu (JSON/CSV). Foto biasanya tidak ikut diekspor.",
  net_mode_hint:
    "Cara menghitung sisa kalori menentukan apakah hanya makanan yang dihitung, atau aktivitas ikut diperhitungkan.",
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
