import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CalorieApiService } from '../../services/calorie-api.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  private calorieApi = inject(CalorieApiService);

  products = signal<Product[]>([]);
  errorMessage = signal('');
  loading = signal(false);

  newProduct = {
    name: '',
    calories_per_100g: 0,
    protein_per_100g: 0,
    fat_per_100g: 0,
    carbs_per_100g: 0,
  };

  editingId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.calorieApi.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load products');
        this.loading.set(false);
      },
    });
  }

  onCreateProduct(): void {
    this.errorMessage.set('');

    this.calorieApi.createProduct(this.newProduct).subscribe({
      next: () => {
        this.newProduct = {
          name: '',
          calories_per_100g: 0,
          protein_per_100g: 0,
          fat_per_100g: 0,
          carbs_per_100g: 0,
        };
        this.loadProducts();
      },
      error: () => {
        this.errorMessage.set('Failed to create product');
      },
    });
  }

  onDeleteProduct(id: number): void {
    this.calorieApi.deleteProduct(id).subscribe({
      next: () => {
        this.loadProducts();
      },
      error: () => {
        this.errorMessage.set('Failed to delete product');
      },
    });
  }

  onEditProduct(product: Product): void {
    this.editingId.set(product.id);
    this.newProduct = {
      name: product.name,
      calories_per_100g: product.calories_per_100g,
      protein_per_100g: product.protein_per_100g,
      fat_per_100g: product.fat_per_100g,
      carbs_per_100g: product.carbs_per_100g,
    };
  }

  onUpdateProduct(): void {
    if (!this.editingId()) return;

    this.calorieApi.updateProduct(this.editingId()!, this.newProduct).subscribe({
      next: () => {
        this.editingId.set(null);
        this.newProduct = {
          name: '',
          calories_per_100g: 0,
          protein_per_100g: 0,
          fat_per_100g: 0,
          carbs_per_100g: 0,
        };
        this.loadProducts();
      },
      error: () => {
        this.errorMessage.set('Failed to update product');
      },
    });
  }
}
