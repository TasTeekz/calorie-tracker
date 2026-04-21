<<<<<<< HEAD
import { Component, OnInit, inject, signal } from '@angular/core';
=======
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
>>>>>>> 59713fa200c4b5d68356c26c9495724556b34355
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
    console.log('ngOnInit called at', Date.now(), 'loading:', this.loading);
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHistory(): void {
    this.loading.set(true);
    this.errorMessage.set('');

<<<<<<< HEAD
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
=======
    forkJoin({
      entries: this.calorieApi.getEntries(this.selectedDate),
      summary: this.calorieApi.getDailySummary(this.selectedDate),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ entries, summary }) => {
          this.entries = entries;
          this.summary = summary;
          this.loading = false;
        },
        error: () => {
          this.entries = [];
          this.summary = null;
          this.errorMessage = 'Failed to load history';
          this.loading = false;
        },
      });
  }

  onDeleteEntry(id: number): void {
    this.errorMessage = '';
    this.calorieApi.deleteEntry(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadHistory(),
        error: () => (this.errorMessage = 'Failed to delete entry'),
      });
>>>>>>> 59713fa200c4b5d68356c26c9495724556b34355
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