import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CalorieService } from '../../services/calorie.service';
import { PRODUCT_DATABASE, ProductBase } from '../../models/product-db';
import { MealType, FoodItem } from '../../models/food-item.model';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.css']
})
export class TrackerComponent implements OnInit {
  // Инжектим зависимости
  public calorieService = inject(CalorieService);
  private fb = inject(FormBuilder);

  foodForm!: FormGroup;
  isManualMode = true;
  products = PRODUCT_DATABASE;
  mealTypes: MealType[] = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];
  today = new Date().toISOString().split('T')[0];

  // Этот поток будет обновляться при смене даты
  currentEntries$: Observable<FoodItem[]> = of([]);

  ngOnInit() {
    this.initForm();
    this.updateEntriesStream();
  }

  initForm() {
    this.foodForm = this.fb.group({
      date: [this.today, Validators.required],
      mealType: ['Завтрак', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      weight: [100, [Validators.min(1)]],
      calories: [null, [Validators.required, Validators.min(1)]],
      protein: [0],
      fat: [0],
      carbs: [0]
    });

    // Следим за сменой даты в календаре
    this.foodForm.get('date')?.valueChanges.subscribe(() => {
      this.updateEntriesStream();
    });
  }

  updateEntriesStream() {
    const selectedDate = this.foodForm?.get('date')?.value || this.today;
    this.currentEntries$ = this.calorieService.getItemsByDate(selectedDate);
  }

  toggleMode(manual: boolean) {
    this.isManualMode = manual;
    this.foodForm.patchValue({
      name: '',
      weight: 100,
      calories: null,
      protein: 0,
      fat: 0,
      carbs: 0
    });
  }

  onProductSelect(event: Event) {
    const productName = (event.target as HTMLSelectElement).value;
    const product = this.products.find(p => p.name === productName);
    if (product) this.calc(product);
  }

  calc(prod?: ProductBase) {
    if (this.isManualMode) return;
    const currentProduct = prod || this.products.find(p => p.name === this.foodForm.value.name);
    const weight = this.foodForm.value.weight || 0;

    if (currentProduct) {
      const ratio = weight / 100;
      this.foodForm.patchValue({
        name: currentProduct.name,
        calories: Math.round(currentProduct.calPer100g * ratio),
        protein: Number((currentProduct.protPer100g * ratio).toFixed(1)),
        fat: Number((currentProduct.fatPer100g * ratio).toFixed(1)),
        carbs: Number((currentProduct.carbPer100g * ratio).toFixed(1))
      }, { emitEvent: false });
    }
  }

  onSubmit() {
    if (this.foodForm.valid) {
      this.calorieService.addFood(this.foodForm.value);
      this.foodForm.patchValue({
        name: '',
        weight: 100,
        calories: null,
        protein: 0,
        fat: 0,
        carbs: 0
      });
    }
  }

  onDelete(id: string) {
    this.calorieService.deleteFood(id);
  }
}