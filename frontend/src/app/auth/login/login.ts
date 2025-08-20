import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onLogin() {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await this.authService.login(this.loginData);
      if (response.success) {
        // AuthService already stores user data, just navigate
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = response.message || 'Login failed';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred during login';
    } finally {
      this.isLoading = false;
    }
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}
