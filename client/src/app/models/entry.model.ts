export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: number;
  product: number;
  product_name: string;
  grams: number;
  meal_type: MealType;
  date: string;
  created_at: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface MealEntryCreateRequest {
  product: number;
  grams: number;
  meal_type: MealType;
  date: string;
}

export interface DailySummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
}
