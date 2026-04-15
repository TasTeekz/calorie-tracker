import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CalorieApiService } from '../../services/calorie-api.service';
import { MealEntry, DailySummary } from '../../models/entry.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  private calorieApi = inject(CalorieApiService);

  selectedDate = new Date().toISOString().split('T')[0];
  entries: MealEntry[] = [];
  summary: DailySummary | null = null;
  errorMessage = '';
  loading = false;

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.errorMessage = '';

    this.calorieApi.getEntries(this.selectedDate).subscribe({
      next: (entries) => {
        this.entries = entries;

        this.calorieApi.getDailySummary(this.selectedDate).subscribe({
          next: (summary) => {
            this.summary = summary;
            this.loading = false;
          },
          error: () => {
            this.summary = null;
            this.errorMessage = 'Failed to load summary';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.entries = [];
        this.summary = null;
        this.errorMessage = 'Failed to load history';
        this.loading = false;
      }
    });
  }

  onDeleteEntry(id: number): void {
    this.errorMessage = '';

    this.calorieApi.deleteEntry(id).subscribe({
      next: () => {
        this.loadHistory();
      },
      error: () => {
        this.errorMessage = 'Failed to delete entry';
      }
    });
  }

  getMealTypeLabel(mealType: string): string {
    switch (mealType) {
      case 'breakfast':
        return 'Breakfast';
      case 'lunch':
        return 'Lunch';
      case 'dinner':
        return 'Dinner';
      case 'snack':
        return 'Snack';
      default:
        return mealType;
    }
  }
}