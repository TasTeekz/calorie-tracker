import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CalorieApiService } from '../../services/calorie-api.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  private calorieApi = inject(CalorieApiService);

  products: Product[] = [];
  errorMessage = '';

  newProduct = {
    name: '',
    calories_per_100g: 0,
    protein_per_100g: 0,
    fat_per_100g: 0,
    carbs_per_100g: 0
  };

  editingId: number | null = null;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.calorieApi.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: () => {
        this.errorMessage = 'Failed to load products';
      }
    });
  }

  onCreateProduct(): void {
    this.errorMessage = '';

    this.calorieApi.createProduct(this.newProduct).subscribe({
      next: () => {
        this.newProduct = {
          name: '',
          calories_per_100g: 0,
          protein_per_100g: 0,
          fat_per_100g: 0,
          carbs_per_100g: 0
        };
        this.loadProducts();
      },
      error: () => {
        this.errorMessage = 'Failed to create product';
      }
    });
  }

  onDeleteProduct(id: number): void {
    this.calorieApi.deleteProduct(id).subscribe({
      next: () => {
        this.loadProducts();
      },
      error: () => {
        this.errorMessage = 'Failed to delete product';
      }
    });
  }

  onEditProduct(product: Product): void {
    this.editingId = product.id;
    this.newProduct = {
      name: product.name,
      calories_per_100g: product.calories_per_100g,
      protein_per_100g: product.protein_per_100g,
      fat_per_100g: product.fat_per_100g,
      carbs_per_100g: product.carbs_per_100g
    };
  }

  onUpdateProduct(): void {
    if (!this.editingId) return;

    this.calorieApi.updateProduct(this.editingId, this.newProduct).subscribe({
      next: () => {
        this.editingId = null;
        this.newProduct = {
          name: '',
          calories_per_100g: 0,
          protein_per_100g: 0,
          fat_per_100g: 0,
          carbs_per_100g: 0
        };
        this.loadProducts();
      },
      error: () => {
        this.errorMessage = 'Failed to update product';
      }
    });
  }
}
