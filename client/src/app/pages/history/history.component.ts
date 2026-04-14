import { Component, inject } from '@angular/core'; // Добавили inject
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CalorieService } from '../../services/calorie.service';
import { map } from 'rxjs';
import { FoodItem } from '../../models/food-item.model';

interface DaySummary {
  date: string;
  totalCalories: number;
  items: FoodItem[];
  isOpen: boolean;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {
  // Используем inject() для мгновенной инициализации сервиса
  public calorieService = inject(CalorieService);

  history$ = this.calorieService.foodItems$.pipe(
    map(items => {
      const groups = items.reduce((acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = { 
            date: item.date, 
            totalCalories: 0, 
            items: [], 
            isOpen: false 
          };
        }
        acc[item.date].items.push(item);
        acc[item.date].totalCalories += item.calories;
        return acc;
      }, {} as Record<string, DaySummary>);

      return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
    })
  );

  // Конструктор теперь можно оставить пустым или вообще удалить
  constructor() {}

  toggleDay(day: DaySummary) {
    day.isOpen = !day.isOpen;
  }
}