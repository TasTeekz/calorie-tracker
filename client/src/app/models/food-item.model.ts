export type MealType = 'Завтрак' | 'Обед' | 'Ужин' | 'Перекус';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  date: string;    // ГГГГ-ММ-ДД
  mealType: MealType;
}