/** kcal from macros: P×4 + C×4 + F×9 */
export function kcalFromMacros(proteinG: number, carbsG: number, fatG: number): number {
  return Math.round(Number(proteinG || 0) * 4 + Number(carbsG || 0) * 4 + Number(fatG || 0) * 9);
}

export const ATWATER_WARN_THRESHOLD = 80;

export function atwaterDelta(
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
): number {
  return Math.abs(Number(calories || 0) - kcalFromMacros(proteinG, carbsG, fatG));
}

export function atwaterWarning(
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
): string | null {
  const fromM = kcalFromMacros(proteinG, carbsG, fatG);
  if (fromM <= 0 && Number(calories || 0) <= 0) return null;
  const d = atwaterDelta(calories, proteinG, carbsG, fatG);
  if (d <= ATWATER_WARN_THRESHOLD) return null;
  return `Kalori dan makro berbeda ~${d} kkal (makro ≈ ${fromM} kkal).`;
}

export function sumMacros<
  T extends {
    protein_g?: number | null;
    carbs_g?: number | null;
    fat_g?: number | null;
    calories?: number;
  },
>(items: T[]) {
  return items.reduce(
    (acc, i) => ({
      calories: acc.calories + (Number(i.calories) || 0),
      protein_g: acc.protein_g + (Number(i.protein_g) || 0),
      carbs_g: acc.carbs_g + (Number(i.carbs_g) || 0),
      fat_g: acc.fat_g + (Number(i.fat_g) || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  );
}

export function fmtMacro(n: number, digits = 1): string {
  const r = Math.round(n * 10 ** digits) / 10 ** digits;
  return Number.isInteger(r) ? String(r) : r.toFixed(digits);
}

/** Common portion units + rough gram hints for UI */
/** Scale nutrition when portion amount changes (baseline from first load). */
export function scaleByPortion(
  baseline: { calories: number; protein_g: number; carbs_g: number; fat_g: number; portion_amount: number },
  newAmount: number,
) {
  const baseAmt = Number(baseline.portion_amount) || 1;
  const amt = Number(newAmount) || 0;
  if (!(baseAmt > 0) || amt < 0) return baseline;
  const s = amt / baseAmt;
  return {
    calories: Math.round(baseline.calories * s),
    protein_g: Math.round(baseline.protein_g * s * 10) / 10,
    carbs_g: Math.round(baseline.carbs_g * s * 10) / 10,
    fat_g: Math.round(baseline.fat_g * s * 10) / 10,
    portion_amount: amt,
  };
}

export const PORTION_PRESETS: Array<{ label: string; amount: number; unit: string; hint: string }> = [
  { label: "½ porsi", amount: 0.5, unit: "porsi", hint: "setengah piring" },
  { label: "1 kepalan", amount: 1, unit: "centong", hint: "~100–150 g nasi" },
  { label: "1 telapak", amount: 1, unit: "potong", hint: "~80–120 g protein" },
  { label: "1 piring", amount: 1, unit: "piring", hint: "porsi rumah" },
  { label: "1½×", amount: 1.5, unit: "porsi", hint: "porsi besar" },
  { label: "2×", amount: 2, unit: "porsi", hint: "dobel" },
];

export const PORTION_UNITS: Array<{ unit: string; hint?: string }> = [
  { unit: "g", hint: "gram" },
  { unit: "ml", hint: "mililiter" },
  { unit: "porsi", hint: "1 porsi rumah" },
  { unit: "piring", hint: "~150–250 g nasi/lauk" },
  { unit: "mangkuk", hint: "~200–300 g" },
  { unit: "sendok makan", hint: "~10–15 g" },
  { unit: "sendok teh", hint: "~3–5 g" },
  { unit: "centong", hint: "~100–150 g nasi" },
  { unit: "potong", hint: "1 potong" },
  { unit: "buah", hint: "1 buah" },
  { unit: "gelas", hint: "~200–250 ml" },
  { unit: "cup", hint: "~240 ml" },
  { unit: "serving", hint: "1 serving label" },
];
