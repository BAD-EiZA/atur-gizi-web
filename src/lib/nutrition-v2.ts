export type ScreeningAnswer = "yes" | "no" | "unknown" | "prefer_not_to_say";

export type ScreeningAnswers = {
  isPregnant: ScreeningAnswer;
  isBreastfeeding: ScreeningAnswer;
  hasKidneyDisease: ScreeningAnswer;
  hasLiverDisease: ScreeningAnswer;
  hasHeartFailureOrFluidRetention: ScreeningAnswer;
  usesHypoglycemiaRiskMedication: ScreeningAnswer;
  hasEatingDisorderHistory: ScreeningAnswer;
};

export type ScreeningState =
  | {
      status: "missing";
      version: null;
      answers: null;
    }
  | {
      status: "complete";
      id: string;
      version: number;
      updatedAt: string;
      consentVersion: string;
      answers: ScreeningAnswers;
    };

export type NutritionDecision = {
  warningCodes: string[];
  blockingCodes: string[];
  automaticPlanAllowed: boolean;
  severity: "none" | "warning" | "block";
  requiresProfessionalReview?: boolean;
};

export type GoalPlan =
  | { type: "maintain" }
  | {
      type: "lose" | "gain";
      method: "weekly_rate" | "target_date";
      targetWeightKg: number;
      weeklyChangeKg?: number;
      targetDate?: string;
    };

export type GoalPreview = {
  previewId: string | null;
  issuedAt?: string;
  expiresAt?: string | null;
  calculationLocalDate?: string;
  available: boolean;
  decision: NutritionDecision;
  expectedConfirmationTextVersion?: string;
  bmi: {
    value: number;
    category: string;
    healthyWeightRangeKg: { min: number; max: number };
  } | null;
  ree: { kcalPerDay: number } | null;
  tdee: {
    kcalPerDay: number;
    activityLevel?: string;
    activityMultiplier?: number;
  } | null;
  goal: {
    type: string;
    method: string;
    targetWeightKg: number | null;
    weeklyChangeKg: number | null;
    targetDate: string | null;
    estimatedWeeks: number | null;
    estimatedTargetDate: string | null;
    feasibility: string | null;
    currentBmi?: number;
    targetBmi?: number | null;
  } | null;
  calories: {
    targetKcalPerDay: number;
    dailyAdjustmentKcal: number;
    adjustmentType: string;
  } | null;
};

export type CurrentGoal = {
  id: string;
  origin: string;
  status: string;
  source?: string;
  type: string;
  method?: string | null;
  targetWeightKg: number | null;
  targetKcalPerDay: number | null;
  feasibility?: string | null;
  activatedAt?: string | null;
  completedAt?: string | null;
};

export type HistoryItem = {
  id: string;
  origin: "legacy_v1" | "nutrition_v2";
  status: string;
  type: string;
  method?: string | null;
  targetKcalPerDay: number | null;
  targetWeightKg?: number | null;
  createdAt: string;
  activatedAt?: string | null;
};

export const SCREENING_FIELDS: {
  key: keyof ScreeningAnswers;
  label: string;
  hint: string;
}[] = [
  {
    key: "isPregnant",
    label: "Sedang hamil",
    hint: "Target otomatis tidak tersedia selama kehamilan.",
  },
  {
    key: "isBreastfeeding",
    label: "Sedang menyusui",
    hint: "Kebutuhan energi berbeda dan perlu pengawasan profesional.",
  },
  {
    key: "hasKidneyDisease",
    label: "Penyakit ginjal",
    hint: "Pembatasan protein/energi memerlukan peninjauan klinis.",
  },
  {
    key: "hasLiverDisease",
    label: "Penyakit hati",
    hint: "Target otomatis diblokir untuk keamanan.",
  },
  {
    key: "hasHeartFailureOrFluidRetention",
    label: "Gagal jantung / retensi cairan",
    hint: "Perubahan berat dapat menyesatkan tanpa pengawasan.",
  },
  {
    key: "usesHypoglycemiaRiskMedication",
    label: "Obat diabetes berisiko hipoglikemia",
    hint: "Defisit kalori otomatis tidak disarankan.",
  },
  {
    key: "hasEatingDisorderHistory",
    label: "Riwayat gangguan makan",
    hint: "Rencana otomatis tidak diberikan.",
  },
];

export const WARNING_COPY: Record<string, string> = {
  TARGET_EQUALS_REE:
    "Target kalori berada tepat di perkiraan kalori istirahat. Pertimbangkan pengawasan lebih ketat.",
  DEFICIT_HIGH:
    "Defisit kalori cukup agresif (sekitar 15–20%). Evaluasi tren berat setelah 2–4 minggu.",
  SURPLUS_HIGH:
    "Surplus kalori cukup tinggi. Sesuaikan jika kenaikan berat terlalu cepat.",
  GOAL_RATE_AGGRESSIVE:
    "Laju perubahan berat agresif. Pastikan nyaman dan aman sebelum melanjutkan.",
  LEGACY_FORMULA_IN_USE: "Anda masih memakai formula lama pada target historis.",
};

export const BLOCKING_COPY: Record<string, string> = {
  AGE_UNSUPPORTED: "Kalkulasi dewasa otomatis tersedia untuk usia 20–100 tahun.",
  PROFILE_OUTSIDE_SUPPORTED_RANGE: "Profil di luar rentang yang didukung aplikasi.",
  SCREENING_INCOMPLETE: "Selesaikan screening kesehatan terlebih dahulu.",
  PREGNANCY: "Target otomatis tidak tersedia selama kehamilan.",
  BREASTFEEDING: "Target otomatis tidak tersedia saat menyusui.",
  KIDNEY_CONDITION: "Kondisi ginjal memerlukan rencana dari tenaga kesehatan.",
  LIVER_CONDITION: "Kondisi hati memerlukan rencana dari tenaga kesehatan.",
  HEART_FAILURE_OR_FLUID_RETENTION:
    "Kondisi jantung/retensi cairan memerlukan pengawasan profesional.",
  HYPOGLYCEMIA_MEDICATION:
    "Obat berisiko hipoglikemia: target otomatis diblokir.",
  EATING_DISORDER_HISTORY:
    "Riwayat gangguan makan: target otomatis tidak diberikan.",
  TARGET_BMI_TOO_LOW: "Target berat menghasilkan BMI di bawah 18.5.",
  TARGET_BMI_GAIN_UNSUPPORTED:
    "Target kenaikan ke BMI 30 atau lebih tidak didukung otomatis.",
  WEEKLY_RATE_TOO_HIGH: "Laju perubahan mingguan terlalu tinggi.",
  WEEKLY_RATE_DURATION_TOO_LONG: "Durasi target melebihi 52 minggu.",
  TARGET_DATE_TOO_FAR: "Tanggal target melebihi 365 hari.",
  CALORIE_TARGET_BELOW_REE: "Target kalori di bawah kalori istirahat.",
  DEFICIT_TOO_HIGH: "Defisit kalori terlalu besar.",
  SURPLUS_TOO_HIGH: "Surplus kalori terlalu besar.",
  EQUATION_SEX_REQUIRED: "Lengkapi profil biologis untuk rumus metabolisme.",
};

export function labelWarning(code: string) {
  return WARNING_COPY[code] ?? code;
}

export function labelBlocking(code: string) {
  return BLOCKING_COPY[code] ?? code;
}

export function bmiCategoryLabel(category: string) {
  const map: Record<string, string> = {
    underweight: "Berat kurang",
    healthy: "Rentang sehat",
    overweight: "Berat berlebih",
    obesity_class_1: "Obesitas kelas 1 (skrining)",
    obesity_class_2: "Obesitas kelas 2 (skrining)",
    obesity_class_3: "Obesitas kelas 3 (skrining)",
  };
  return map[category] ?? category;
}

export function feasibilityLabel(value: string | null | undefined) {
  if (value === "reasonable") return "Masuk akal";
  if (value === "aggressive") return "Agresif";
  if (value === "unsupported") return "Tidak didukung";
  return value ?? "—";
}

export function defaultScreeningAnswers(): ScreeningAnswers {
  return {
    isPregnant: "no",
    isBreastfeeding: "no",
    hasKidneyDisease: "no",
    hasLiverDisease: "no",
    hasHeartFailureOrFluidRetention: "no",
    usesHypoglycemiaRiskMedication: "no",
    hasEatingDisorderHistory: "no",
  };
}
