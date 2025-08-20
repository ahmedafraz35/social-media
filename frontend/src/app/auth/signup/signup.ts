import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  signupData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSignup() {
    // Validation
    if (!this.signupData.username || !this.signupData.email || 
        !this.signupData.password || !this.signupData.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.signupData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await this.authService.signup(this.signupData);
      if (response.success) {
        this.successMessage = 'Account created successfully! Redirecting to home...';
        // AuthService already stores user data, just navigate to home
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      } else {
        this.errorMessage = response.message || 'Signup failed';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred during signup';
    } finally {
      this.isLoading = false;
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
