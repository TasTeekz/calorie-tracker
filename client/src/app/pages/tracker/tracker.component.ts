import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CalorieApiService } from '../../services/calorie-api.service';
import { DailySummary, MealEntry, MealType } from '../../models/entry.model';
import { Product } from '../../models/product.model';
import { ProfileGoalResponse } from '../../models/profile.model';

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

  showProductModal = false;
  showManualModal = false;
  showProfileCompletionModal = false;
  productSearch = '';
  profileModalError = '';
  profileModalSaving = false;

  profileCompletion = {
    age: 18,
    height: 170,
    weight: 70,
    gender: 'male' as 'male' | 'female',
  };

  manualEntry = {
    entryName: '',
    caloriesPer100g: 0,
    proteinPer100g: 0,
    fatPer100g: 0,
    carbsPer100g: 0,
    grams: 100,
    mealType: 'breakfast' as MealType,
    saveProduct: false,
  };

  errorMessage = '';
  loading = false;

  ngOnInit(): void {
    this.loadProducts();
    this.loadEntriesAndSummary();
    this.checkProfileCompletion();
  }

  checkProfileCompletion(): void {
    this.calorieApi.getProfile().subscribe({
      next: (data: ProfileGoalResponse) => {
        this.profileCompletion = {
          age: data.profile.age,
          height: data.profile.height,
          weight: data.profile.weight,
          gender: data.profile.gender,
        };

        this.showProfileCompletionModal = !data.profile.is_profile_completed;
      },
      error: () => {
        this.profileModalError = 'Failed to load profile details';
      },
    });
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

  get filteredProducts(): Product[] {
    const query = this.productSearch.trim().toLowerCase();
    if (!query) {
      return this.products;
    }

    return this.products.filter((product) => product.name.toLowerCase().includes(query));
  }

  get selectedProduct(): Product | null {
    if (this.selectedProductId === null) {
      return null;
    }

    return this.products.find((product) => product.id === this.selectedProductId) ?? null;
  }

  openProductModal(): void {
    this.productSearch = '';
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
  }

  openManualModal(): void {
    this.resetManualEntry();
    this.showManualModal = true;
  }

  closeManualModal(): void {
    this.showManualModal = false;
  }

  onCompleteProfile(): void {
    this.profileModalError = '';

    if (
      !this.profileCompletion.age ||
      !this.profileCompletion.height ||
      !this.profileCompletion.weight
    ) {
      this.profileModalError = 'Please fill in all fields';
      return;
    }

    this.profileModalSaving = true;

    this.calorieApi
      .updateProfile({
        profile: {
          age: this.profileCompletion.age,
          height: this.profileCompletion.height,
          weight: this.profileCompletion.weight,
          gender: this.profileCompletion.gender,
        },
      })
      .subscribe({
        next: () => {
          this.showProfileCompletionModal = false;
          this.profileModalSaving = false;
          this.loadEntriesAndSummary();
        },
        error: () => {
          this.profileModalSaving = false;
          this.profileModalError = 'Failed to save profile details';
        },
      });
  }

  chooseProduct(product: Product): void {
    this.selectedProductId = product.id;
    this.mealType = 'breakfast';
    this.grams = 100;
    this.closeProductModal();
  }

  clearSelectedProduct(): void {
    this.selectedProductId = null;
    this.grams = 100;
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

  onSaveManualEntry(): void {
    if (!this.manualEntry.entryName || !this.manualEntry.caloriesPer100g) {
      this.errorMessage = 'Enter product name and calories';
      return;
    }

    this.errorMessage = '';

    this.calorieApi
      .createEntry({
        entry_name: this.manualEntry.entryName,
        calories_per_100g: this.manualEntry.caloriesPer100g,
        protein_per_100g: this.manualEntry.proteinPer100g,
        fat_per_100g: this.manualEntry.fatPer100g,
        carbs_per_100g: this.manualEntry.carbsPer100g,
        grams: this.manualEntry.grams,
        meal_type: this.manualEntry.mealType,
        date: this.selectedDate,
        save_product: this.manualEntry.saveProduct,
      })
      .subscribe({
        next: () => {
          this.closeManualModal();
          this.resetManualEntry();
          this.loadEntriesAndSummary();
          this.loadProducts();
        },
        error: () => {
          this.errorMessage = 'Failed to add manual entry';
        },
      });
  }

  resetManualEntry(): void {
    this.manualEntry = {
      entryName: '',
      caloriesPer100g: 0,
      proteinPer100g: 0,
      fatPer100g: 0,
      carbsPer100g: 0,
      grams: 100,
      mealType: 'breakfast',
      saveProduct: false,
    };
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
