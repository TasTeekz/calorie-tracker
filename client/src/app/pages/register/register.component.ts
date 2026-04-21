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
  name = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username || !this.name || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.authService
      .register({
        username: this.username,
        name: this.name,
        password: this.password,
        confirm_password: this.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
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
