import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CalorieApiService } from '../../services/calorie-api.service';
import { DailySummary, MealEntry, MealType } from '../../models/entry.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.css',
})
export class TrackerComponent implements OnInit {
  private calorieApi = inject(CalorieApiService);

  products: Product[] = [];
  entries: MealEntry[] = [];
  summary: DailySummary | null = null;

  today = new Date().toISOString().split('T')[0];
  selectedDate = this.today;
  selectedProductId: number | null = null;
  grams = 100;
  mealType: MealType = 'breakfast';

  errorMessage = '';
  loading = false;

  ngOnInit(): void {
    this.loadProducts();
    this.loadEntriesAndSummary();
  }

  loadProducts(): void {
    this.calorieApi.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: () => {
        this.errorMessage = 'Failed to load products';
      },
    });
  }

  loadEntriesAndSummary(): void {
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
          },
        });
      },
      error: () => {
        this.entries = [];
        this.summary = null;
        this.errorMessage = 'Failed to load entries';
        this.loading = false;
      },
    });
  }

  onAddEntry(): void {
    if (!this.selectedProductId) {
      this.errorMessage = 'Select a product';
      return;
    }

    this.errorMessage = '';

    this.calorieApi
      .createEntry({
        product: this.selectedProductId,
        grams: this.grams,
        meal_type: this.mealType,
        date: this.selectedDate,
      })
      .subscribe({
        next: () => {
          this.selectedProductId = null;
          this.grams = 100;
          this.mealType = 'breakfast';
          this.loadEntriesAndSummary();
          this.loadProducts();
        },
        error: () => {
          this.errorMessage = 'Failed to add entry';
        },
      });
  }

  onDeleteEntry(id: number): void {
    this.calorieApi.deleteEntry(id).subscribe({
      next: () => {
        this.loadEntriesAndSummary();
      },
      error: () => {
        this.errorMessage = 'Failed to delete entry';
      },
    });
  }

  getMealTypeLabel(mealType: MealType): string {
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
