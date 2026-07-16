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
  } | null;
};

export type Dashboard = {
  date: string;
  intake_target: number;
  consumed_calories: number;
  burned_calories: number;
  net_calories: number;
  remaining_calories: number;
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
  duration_minutes: number;
  calories_burned: number;
  intensity: string;
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
    warnings: string[];
    needs_user_input: boolean;
  } | null;
  disclaimer: string;
  quota?: { used: number; quota: number; remaining: number };
};
