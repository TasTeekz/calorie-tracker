export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: number;
  product: number | null;
  product_name: string;
  entry_name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
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
  product?: number | null;
  entry_name?: string;
  calories_per_100g?: number;
  protein_per_100g?: number;
  fat_per_100g?: number;
  carbs_per_100g?: number;
  grams: number;
  meal_type: MealType;
  date: string;
  save_product?: boolean;
}

export interface DailySummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
}
