import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CalorieApiService } from '../../services/calorie-api.service';
import { ProfileGoalResponse } from '../../models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private calorieApi = inject(CalorieApiService);

  age = 18;
  height = 170;
  weight = 70;

  calorie_goal = 2000;
  protein_goal = 120;
  fat_goal = 70;
  carbs_goal = 200;

  successMessage = '';
  errorMessage = '';
  loading = false;

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';

    this.calorieApi.getProfile().subscribe({
      next: (data: ProfileGoalResponse) => {
        this.age = data.profile.age;
        this.height = data.profile.height;
        this.weight = data.profile.weight;

        this.calorie_goal = data.daily_goal.calorie_goal;
        this.protein_goal = data.daily_goal.protein_goal;
        this.fat_goal = data.daily_goal.fat_goal;
        this.carbs_goal = data.daily_goal.carbs_goal;

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  onSave(): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.calorieApi
      .updateProfile({
        profile: {
          age: this.age,
          height: this.height,
          weight: this.weight
        },
        daily_goal: {
          calorie_goal: this.calorie_goal,
          protein_goal: this.protein_goal,
          fat_goal: this.fat_goal,
          carbs_goal: this.carbs_goal
        }
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Profile updated successfully';
        },
        error: () => {
          this.errorMessage = 'Failed to update profile';
        }
      });
  }
}
