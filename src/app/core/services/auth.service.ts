import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthResponse, UserProfile } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly baseUrl = `${environment.apiUrl}/Auth`;
  
  // Writable signal holding the session information
  readonly currentUser = signal<AuthResponse | null>(null);
  
  // Computed signals for state checks
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role.toLowerCase() === 'admin');
  readonly currentUsername = computed(() => this.currentUser()?.userName || '');

  constructor() {
    this.loadSession();
  }

  // Load session from local storage on startup
  private loadSession(): void {
    const savedSession = localStorage.getItem('fifa_user_session');
    if (savedSession) {
      try {
        const authData: AuthResponse = JSON.parse(savedSession);
        this.currentUser.set(authData);
      } catch (e) {
        this.logout();
      }
    }
  }

  // Set session variables and local storage
  private setSession(authData: AuthResponse): void {
    localStorage.setItem('fifa_user_session', JSON.stringify(authData));
    this.currentUser.set(authData);
  }

  // POST: Send OTP to email
  sendOtp(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/send-otp`, { email });
  }

  // POST: Verify OTP code
  verifyOtp(email: string, otpCode: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/verify-otp`, { email, otpCode }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      })
    );
  }

  // POST: Regular password login (User or Admin)
  login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, { emailOrUsername: email, password }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      })
    );
  }

  // POST: User registration
  register(request: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/register`, request);
  }

  // GET: Fetch current user profile details
  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${environment.apiUrl}/Users/profile`);
  }

  // Remove local storage token and navigate to login
  logout(): void {
    localStorage.removeItem('fifa_user_session');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
