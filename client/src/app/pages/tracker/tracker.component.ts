import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  private router = inject(Router);

  products = signal<Product[]>([]);
  entries = signal<MealEntry[]>([]);
  summary = signal<DailySummary | null>(null);

  today = new Date().toISOString().split('T')[0];
  selectedDate = signal(this.today);
  selectedProductId = signal<number | null>(null);
  grams = signal(100);
  mealType = signal<MealType>('breakfast');

  showProductModal = signal(false);
  showManualModal = signal(false);
  showProfileCompletionModal = signal(false);
  productSearch = signal('');
  profileModalError = signal('');
  profileModalSaving = signal(false);
  profileCheckAttempts = 0;

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

  errorMessage = signal('');
  loading = signal(false);

  ngOnInit(): void {
    const navState = this.router.getCurrentNavigation()?.extras.state;
    const shouldCompleteFromLogin = navState?.['shouldCompleteProfile'] === true;

    if (shouldCompleteFromLogin) {
      this.showProfileCompletionModal.set(true);
    }

    this.loadProducts();
    this.loadEntriesAndSummary();
    this.checkProfileCompletion();
  }

  checkProfileCompletion(): void {
    this.profileCheckAttempts += 1;

    this.calorieApi.getProfile().subscribe({
      next: (data: ProfileGoalResponse) => {
        const isProfileCompleted = data.profile.is_profile_completed === true;

        this.profileCompletion = {
          age: data.profile.age,
          height: data.profile.height,
          weight: data.profile.weight,
          gender: data.profile.gender,
        };

        this.showProfileCompletionModal.set(!isProfileCompleted);
        console.debug('[Tracker] profile loaded', {
          isProfileCompleted,
          attempts: this.profileCheckAttempts,
        });
      },
      error: (err) => {
        console.debug('[Tracker] profile load failed', {
          status: err?.status,
          attempts: this.profileCheckAttempts,
        });

        if (this.profileCheckAttempts < 3) {
          setTimeout(() => this.checkProfileCompletion(), 350);
          return;
        }

        this.profileModalError.set('Failed to load profile details');
      },
    });
  }

  loadProducts(): void {
    this.calorieApi.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
      },
      error: () => {
        this.errorMessage.set('Failed to load products');
      },
    });
  }

  get filteredProducts(): Product[] {
    const query = this.productSearch().trim().toLowerCase();
    if (!query) {
      return this.products();
    }

    return this.products().filter((product) => product.name.toLowerCase().includes(query));
  }

  get selectedProduct(): Product | null {
    if (this.selectedProductId() === null) {
      return null;
    }

    return this.products().find((product) => product.id === this.selectedProductId()) ?? null;
  }

  openProductModal(): void {
    this.productSearch.set('');
    this.showProductModal.set(true);
  }

  closeProductModal(): void {
    this.showProductModal.set(false);
  }

  openManualModal(): void {
    this.resetManualEntry();
    this.showManualModal.set(true);
  }

  closeManualModal(): void {
    this.showManualModal.set(false);
  }

  onCompleteProfile(): void {
    this.profileModalError.set('');

    if (
      !this.profileCompletion.age ||
      !this.profileCompletion.height ||
      !this.profileCompletion.weight
    ) {
      this.profileModalError.set('Please fill in all fields');
      return;
    }

    this.profileModalSaving.set(true);

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
          this.showProfileCompletionModal.set(false);
          this.profileModalSaving.set(false);
          console.debug('[Tracker] profile completed and saved');
          this.loadEntriesAndSummary();
        },
        error: () => {
          this.profileModalSaving.set(false);
          this.profileModalError.set('Failed to save profile details');
        },
      });
  }

  chooseProduct(product: Product): void {
    this.selectedProductId.set(product.id);
    this.mealType.set('breakfast');
    this.grams.set(100);
    this.closeProductModal();
  }

  clearSelectedProduct(): void {
    this.selectedProductId.set(null);
    this.grams.set(100);
  }

  loadEntriesAndSummary(): void {
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
        this.errorMessage.set('Failed to load entries');
        this.loading.set(false);
      },
    });
  }

  onAddEntry(): void {
    if (!this.selectedProductId()) {
      this.errorMessage.set('Select a product');
      return;
    }

    this.errorMessage.set('');

    this.calorieApi
      .createEntry({
        product: this.selectedProductId()!,
        grams: this.grams(),
        meal_type: this.mealType(),
        date: this.selectedDate(),
      })
      .subscribe({
        next: () => {
          this.selectedProductId.set(null);
          this.grams.set(100);
          this.mealType.set('breakfast');
          this.loadEntriesAndSummary();
          this.loadProducts();
        },
        error: () => {
          this.errorMessage.set('Failed to add entry');
        },
      });
  }

  onSaveManualEntry(): void {
    if (!this.manualEntry.entryName || !this.manualEntry.caloriesPer100g) {
      this.errorMessage.set('Enter product name and calories');
      return;
    }

    this.errorMessage.set('');

    this.calorieApi
      .createEntry({
        entry_name: this.manualEntry.entryName,
        calories_per_100g: this.manualEntry.caloriesPer100g,
        protein_per_100g: this.manualEntry.proteinPer100g,
        fat_per_100g: this.manualEntry.fatPer100g,
        carbs_per_100g: this.manualEntry.carbsPer100g,
        grams: this.manualEntry.grams,
        meal_type: this.manualEntry.mealType,
        date: this.selectedDate(),
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
          this.errorMessage.set('Failed to add manual entry');
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
        this.errorMessage.set('Failed to delete entry');
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
