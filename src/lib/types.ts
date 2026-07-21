export type Me = {
  id: string;
  email: string | null;
  display_name: string | null;
  onboarding_completed: boolean;
  profile: {
    date_of_birth: string | null;
    height_cm: number | null;
    current_weight_kg: number | null;
    metabolic_formula: string;
    activity_level: string | null;
    fitness_goal: string | null;
    estimates_accepted: boolean;
  } | null;
  settings: {
    timezone: string;
    unit_system: string;
    locale: string;
    retain_food_photos: boolean;
    calorie_budget_mode?: "intake_only" | "eat_back";
  } | null;
};

export type Dashboard = {
  date: string;
  intake_target: number;
  consumed_calories: number;
  consumed_protein_g?: number;
  consumed_carbs_g?: number;
  consumed_fat_g?: number;
  protein_target_g?: number | null;
  carbs_target_g?: number | null;
  fat_target_g?: number | null;
  burned_calories: number;
  net_calories: number;
  remaining_calories: number;
  remaining_intake?: number;
  remaining_net?: number;
  budget_mode?: "intake_only" | "eat_back";
  progress_pct: number;
  food_log_count: number;
  activity_duration_minutes: number;
  motivational_message: string;
  target?: {
    calorie_target: number;
    bmr_kcal?: number | null;
    tdee_kcal?: number | null;
    goal?: string;
  } | null;
  recent_food: Array<{
    id: string;
    title: string;
    meal_type: string;
    total_calories: number;
    protein_g?: number | null;
    carbs_g?: number | null;
    fat_g?: number | null;
    consumed_at: string;
  }>;
  recent_activity: Array<{
    id: string;
    name: string;
    duration_minutes: number;
    calories_burned: number;
  }>;
};

export type FoodLog = {
  id: string;
  log_date: string;
  consumed_at: string;
  meal_type: string;
  title: string;
  total_calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  notes: string | null;
  items: Array<{
    id?: string;
    name: string;
    portion_amount: number;
    portion_unit: string;
    calories: number;
    protein_g?: number | null;
    carbs_g?: number | null;
    fat_g?: number | null;
  }>;
};

export type ActivityType = {
  id: string;
  slug: string;
  name: string;
  category: string;
  default_met: number;
};

export type ActivityLog = {
  id: string;
  name: string;
  log_date: string;
  started_at?: string | null;
  duration_minutes: number;
  calories_burned: number;
  calculated_calories?: number;
  intensity: string;
  met_value?: number;
  met_source?: string | null;
  weight_snapshot_kg?: number;
  formula_version?: string;
  notes?: string | null;
  distance_m?: number | null;
  speed_kmh?: number | null;
  rpe?: number | null;
  avg_hr?: number | null;
  sets?: number | null;
  reps?: number | null;
  load_kg?: number | null;
  source?: string;
  device_calories?: number | null;
  activity_type?: { id: string; name: string; slug: string; category?: string } | null;
};

export type AiAnalysis = {
  id: string;
  status: string;
  result: {
    items: Array<{
      name: string;
      portion_amount: number;
      portion_unit: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      fiber_g: number;
      confidence: number;
      confidence_label: string;
      assumptions: string[];
    }>;
    total_estimated_calories: number;
    overall_confidence: number;
    overall_confidence_label: string;
    image_quality?: string;
    warnings: string[];
    needs_user_input: boolean;
    require_review?: boolean;
  } | null;
  disclaimer: string;
  quota?: { used: number; quota: number; remaining: number };
};
