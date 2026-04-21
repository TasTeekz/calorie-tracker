import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  age = 18;
  height = 170;
  weight = 70;
  gender: 'male' | 'female' = 'male';
  errorMessage = '';
  successMessage = '';

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.authService
      .register({
        username: this.username,
        password: this.password,
        age: this.age,
        height: this.height,
        weight: this.weight,
        gender: this.gender,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Registration successful';
          this.router.navigate(['/tracker']);
        },
        error: (err) => {
          if (err.status === 400) {
            this.errorMessage = 'Username already exists or data is invalid';
          } else {
            this.errorMessage = 'Registration failed';
          }
        },
      });
  }
}
