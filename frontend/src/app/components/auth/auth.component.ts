import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  @Output() authSuccess = new EventEmitter<User>();

  isLoginMode = true;
  loading = false;
  errorMessage = '';

  // Form fields
  email = '';
  password = '';

  constructor(private authService: AuthService) {}

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;

    if (this.isLoginMode) {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (user) => {
          this.loading = false;
          this.authSuccess.emit(user);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Login failed. Please try again.';
        }
      });
    } else {
      this.authService.signup({ email: this.email, password: this.password }).subscribe({
        next: (user) => {
          this.loading = false;
          this.authSuccess.emit(user);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Signup failed. Please try again.';
        }
      });
    }
  }
}
