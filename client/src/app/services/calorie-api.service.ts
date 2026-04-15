import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product, ProductCreateRequest } from '../models/product.model';
import { DailySummary, MealEntry, MealEntryCreateRequest } from '../models/entry.model';
import { ProfileGoalResponse, ProfileGoalUpdateRequest } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class CalorieApiService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  getProfile(): Observable<ProfileGoalResponse> {
    return this.http.get<ProfileGoalResponse>(`${this.apiUrl}/profile/`);
  }

  updateProfile(data: ProfileGoalUpdateRequest): Observable<ProfileGoalResponse> {
    return this.http.put<ProfileGoalResponse>(`${this.apiUrl}/profile/`, data);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}/`);
  }

  createProduct(data: ProductCreateRequest): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products/`, data);
  }

  updateProduct(id: number, data: Partial<ProductCreateRequest>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}/`, data);
  }

  deleteProduct(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/products/${id}/`);
  }

  getEntries(date?: string): Observable<MealEntry[]> {
    let params = new HttpParams();

    if (date) {
      params = params.set('date', date);
    }

    return this.http.get<MealEntry[]>(`${this.apiUrl}/entries/`, { params });
  }

  createEntry(data: MealEntryCreateRequest): Observable<MealEntry> {
    return this.http.post<MealEntry>(`${this.apiUrl}/entries/`, data);
  }

  deleteEntry(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/entries/${id}/`);
  }

  getDailySummary(date: string): Observable<DailySummary> {
    const params = new HttpParams().set('date', date);
    return this.http.get<DailySummary>(`${this.apiUrl}/summary/`, { params });
  }
}
