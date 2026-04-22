import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalorieApiService } from '../../services/calorie-api.service';
import { MealEntry, DailySummary } from '../../models/entry.model';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent implements OnInit, OnDestroy {
  private calorieApi = inject(CalorieApiService);
  private destroy$ = new Subject<void>();

  selectedDate = signal(new Date().toISOString().split('T')[0]);
  entries = signal<MealEntry[]>([]);
  summary = signal<DailySummary | null>(null);
  errorMessage = signal('');
  loading = signal(false);

  ngOnInit(): void {
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHistory(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      entries: this.calorieApi.getEntries(this.selectedDate()),
      summary: this.calorieApi.getDailySummary(this.selectedDate()),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ entries, summary }) => {
          this.entries.set(entries);
          this.summary.set(summary);
          this.loading.set(false);
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
    this.calorieApi.deleteEntry(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadHistory(),
        error: () => this.errorMessage.set('Failed to delete entry'),
      });
  }

  getMealTypeLabel(mealType: string): string {
    const labels: Record<string, string> = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack',
    };
    return labels[mealType] ?? mealType;
  }
}