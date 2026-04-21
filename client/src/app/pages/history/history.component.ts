import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CalorieApiService } from '../../services/calorie-api.service';
import { MealEntry, DailySummary } from '../../models/entry.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent implements OnInit {
  private calorieApi = inject(CalorieApiService);

  selectedDate = signal(new Date().toISOString().split('T')[0]);
  entries = signal<MealEntry[]>([]);
  summary = signal<DailySummary | null>(null);
  errorMessage = signal('');
  loading = signal(false);

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.calorieApi.getEntries(this.selectedDate()).subscribe({
      next: (entries) => {
        this.entries.set(entries);

        this.calorieApi.getDailySummary(this.selectedDate()).subscribe({
          next: (summary) => {
            this.summary.set(summary);
            this.loading.set(false);
          },
          error: () => {
            this.summary.set(null);
            this.errorMessage.set('Failed to load summary');
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.entries.set([]);
        this.summary.set(null);
        this.errorMessage.set('Failed to load history');
        this.loading.set(false);
      },
    });
  }

  onDeleteEntry(id: number): void {
    this.errorMessage.set('');

    this.calorieApi.deleteEntry(id).subscribe({
      next: () => {
        this.loadHistory();
      },
      error: () => {
        this.errorMessage.set('Failed to delete entry');
      },
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
