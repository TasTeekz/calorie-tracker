import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CalorieApiService } from '../../services/calorie-api.service';
import { ProfileGoalResponse } from '../../models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private calorieApi = inject(CalorieApiService);

  age = signal(18);
  height = signal(170);
  weight = signal(70);
  gender = signal<'male' | 'female'>('male');
  role = signal<'USER' | 'ADMIN'>('USER');

  calorie_goal = signal(2000);
  protein_goal = signal(120);
  fat_goal = signal(70);
  carbs_goal = signal(200);

  successMessage = signal('');
  errorMessage = signal('');
  loading = signal(false);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.calorieApi.getProfile().subscribe({
      next: (data: ProfileGoalResponse) => {
        this.age.set(data.profile.age);
        this.height.set(data.profile.height);
        this.weight.set(data.profile.weight);
        this.gender.set(data.profile.gender);
        this.role.set(data.profile.role);

        this.calorie_goal.set(data.daily_goal.calorie_goal);
        this.protein_goal.set(data.daily_goal.protein_goal);
        this.fat_goal.set(data.daily_goal.fat_goal);
        this.carbs_goal.set(data.daily_goal.carbs_goal);

        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load profile');
        this.loading.set(false);
      },
    });
  }

  onSave(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    this.calorieApi
      .updateProfile({
        profile: {
          age: this.age(),
          height: this.height(),
          weight: this.weight(),
          gender: this.gender(),
        },
        daily_goal: {
          calorie_goal: this.calorie_goal(),
          protein_goal: this.protein_goal(),
          fat_goal: this.fat_goal(),
          carbs_goal: this.carbs_goal(),
        },
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Profile updated successfully');
        },
        error: () => {
          this.errorMessage.set('Failed to update profile');
        },
      });
  }
}
