import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { FoodItem } from '../models/food-item.model';

@Injectable({ providedIn: 'root' })
export class CalorieService {
  private STORAGE_KEY = 'calorie_tracker_data';
  private foodItems = new BehaviorSubject<FoodItem[]>([]);
  foodItems$ = this.foodItems.asObservable();

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) this.foodItems.next(JSON.parse(saved));
  }

  addFood(item: FoodItem) {
    const newItem = { ...item, id: crypto.randomUUID() };
    const updated = [...this.foodItems.value, newItem];
    this.save(updated);
  }

  deleteFood(id: string) {
    const updated = this.foodItems.value.filter(i => i.id !== id);
    this.save(updated);
  }

  private save(items: FoodItem[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.foodItems.next(items);
  }

  getItemsByDate(date: string) {
    return this.foodItems$.pipe(
      map(items => items.filter(item => item.date === date))
    );
  }

  getTotals(items: FoodItem[]) {
    return items.reduce((acc, curr) => ({
      calories: acc.calories + curr.calories,
      protein: acc.protein + curr.protein,
      fat: acc.fat + curr.fat,
      carbs: acc.carbs + curr.carbs
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
  }
}