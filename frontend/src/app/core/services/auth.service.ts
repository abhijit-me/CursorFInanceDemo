import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuth();
  }

  private checkAuth() {
    const token = this.getToken();
    if (token) {
      this.isAuthenticatedSubject.next(true);
      this.loadCurrentUser();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.handleAuthResponse(response);
        })
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => {
          this.handleAuthResponse(response);
        })
      );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  refreshToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${environment.apiUrl}/auth/refresh`, {})
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.accessToken);
        })
      );
  }

  private handleAuthResponse(response: AuthResponse) {
    localStorage.setItem('access_token', response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem('refresh_token', response.refreshToken);
    }
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  private loadCurrentUser() {
    this.http.get<User>(`${environment.apiUrl}/auth/me`).subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
      },
      error: () => {
        this.logout();
      }
    });
  }
}

