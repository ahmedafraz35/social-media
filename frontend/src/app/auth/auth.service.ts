import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5036/api';

  constructor(private http: HttpClient) {}

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, loginData)
      );
      
      if (response.success && response.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.error?.message || 'Login failed');
    }
  }

  async signup(signupData: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/auth/signup`, signupData)
      );
      
      if (response.success && response.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.error?.message || 'Signup failed');
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }

  getCurrentUser(): any {
    try {
      const user = localStorage.getItem('currentUser');
      const result = user ? JSON.parse(user) : null;
      console.log('AuthService.getCurrentUser() result:', result);
      return result;
    } catch (error) {
      console.error('Error getting current user from localStorage:', error);
      return null;
    }
  }

  isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    const isLoggedIn = user !== null;
    console.log('AuthService.isLoggedIn():', isLoggedIn);
    return isLoggedIn;
  }
}
