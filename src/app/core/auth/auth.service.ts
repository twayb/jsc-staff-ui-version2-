import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable, catchError, map, switchMap, tap, throwError, timeout, timer } from 'rxjs';
import { environment } from '../../../environments/environment';

const REQUEST_TIMEOUT_MS = 15_000;
const NAV_DELAY_MS = 1500;

export interface LoginRequest {
  email: string;
  password: string;
}

const STAFF_USER_TYPE = 'STAFF';

export interface StaffPayload {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  userType: 'STAFF';
  permissions: string[];
  passChange: number;
  passwordExpired?: boolean;
  passwordResetToken?: string;
  accessToken: string;
  phoneNumber?: string;
  locked?: boolean;
}

export interface ApiResponse<T = null> {
  status: string;
  trxnId: string | null;
  statusCode: number;
  message: string;
  data: T;
}

export type LoginResponse = ApiResponse<StaffPayload>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  private readonly apiUrl = `${environment.apiUrl}uaa/`;

  readonly sessionLoading = signal<string | null>(null);

  private readonly _user = signal<StaffPayload | null>(this.readUserFromStorage());
  readonly user = this._user.asReadonly();

  private readUserFromStorage(): StaffPayload | null {
    const userData = localStorage.getItem('user');
    if (!userData || userData === '{}' || userData === 'null') {
      return null;
    }
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  isAuthorized(allowedPermissions: string[]): boolean {
    const user = this.user();
    if (!user) {
      return false;
    }
    return user.permissions.some((permission) => allowedPermissions.includes(permission));
  }

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}api/auth/authenticate`, { ...body, userType: STAFF_USER_TYPE })
      .pipe(
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: error?.error?.message ?? 'Something went wrong. Please try again later.',
          });
          return throwError(() => error);
        }),
        tap((data) => {
          if (data?.data?.accessToken) {
            this.storeTokens(data);
          }
        }),
        // Force a short delay before navigating so the success state is visible.
        switchMap((data) => timer(NAV_DELAY_MS).pipe(map(() => data))),
        tap((data) => {
          if (data.data.passwordExpired) {
            this.messageService.add({
              severity: 'error',
              summary: 'Password Expired',
              detail: 'Your password has expired. Please reset your password.',
            });
            this.router.navigate(['/password-change'], {
              queryParams: { token: data.data.passwordResetToken },
            });
            return;
          }

          if (data.data.passChange === 0) {
            this.router.navigate(['/password-change']);
            return;
          }

          this.router.navigate(['/services']);
        }),
      );
  }

  logout(): void {
    this.sessionLoading.set('Logging out…');
    this.http.get(`${this.apiUrl}logout`).subscribe({
      next: () => this.clearSessionAndRedirect(),
      error: () => this.clearSessionAndRedirect(),
    });
  }

  sessionTimeout(): void {
    this.sessionLoading.set('Session expired. Redirecting…');
    this.http.get(`${this.apiUrl}logout`).subscribe({
      next: () => this.clearSessionAndRedirect(),
      error: () => this.clearSessionAndRedirect(),
    });
  }

  handleSessionTimeout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user.set(null);
    this.messageService.add({
      severity: 'warn',
      summary: 'Session Expired',
      detail: 'Your session has expired. Please login again.',
    });
    this.router.navigate(['/login']);
  }

  forgotPassword(email: string): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(`${this.apiUrl}api/auth/forgot-password`, { email, userType: STAFF_USER_TYPE })
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  resetPassword(password: string, token: string): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(`${this.apiUrl}api/auth/reset-password`, { newPassword: password, resetToken: token })
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  changePassword(data: { oldPassword: string; newPassword: string }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}users/change-password`, data);
  }

  activateAccount(token: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}api/auth/verifications`, {
      token,
      userType: STAFF_USER_TYPE,
    });
  }

  private storeTokens(data: LoginResponse): void {
    localStorage.setItem('token', data.data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.data));
    this._user.set(data.data);
  }

  private clearSessionAndRedirect(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user.set(null);
    setTimeout(() => {
      this.sessionLoading.set(null);
      this.router.navigate(['/login']);
    }, NAV_DELAY_MS);
  }
}
