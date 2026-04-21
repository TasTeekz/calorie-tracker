import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';

import {
  AuthResponse,
  LoginRequest,
  LogoutRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://127.0.0.1:8000/api';
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  private authStateSubject = new BehaviorSubject<boolean>(this.hasAccessToken());
  authState$ = this.authStateSubject.asObservable();

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register/`, data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login/`, data)
      .pipe(tap((response) => this.saveTokens(response)));
  }

  logout(): Observable<{ message: string }> {
    const refresh = this.getRefreshToken();

    if (!refresh) {
      this.clearTokens();
      return of({ message: 'Logged out locally' });
    }

    const body: LogoutRequest = { refresh };

    return this.http
      .post<{ message: string }>(`${this.apiUrl}/logout/`, body)
      .pipe(tap(() => this.clearTokens()));
  }

  refreshToken(): Observable<RefreshResponse> {
    const refresh = this.getRefreshToken();

    return this.http
      .post<RefreshResponse>(`${this.apiUrl}/token/refresh/`, {
        refresh,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem(this.accessTokenKey, response.access);
        }),
      );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  isAuthenticated(): boolean {
    return this.hasAccessToken();
  }

  private saveTokens(tokens: AuthResponse): void {
    localStorage.setItem(this.accessTokenKey, tokens.access);
    localStorage.setItem(this.refreshTokenKey, tokens.refresh);
    this.authStateSubject.next(true);
  }

  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.authStateSubject.next(false);
  }

  private hasAccessToken(): boolean {
    return !!localStorage.getItem(this.accessTokenKey);
  }
}
