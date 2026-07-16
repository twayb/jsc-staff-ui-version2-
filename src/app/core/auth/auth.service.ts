import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, inject, signal } from '@angular/core';
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
  fullName: string;
  email: string;
  userType: 'STAFF';
  permissions: string[];
  passChange: number;
  passwordExpired?: boolean;
  passwordResetToken?: string;
  accessToken: string;
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

  get user(): WritableSignal<StaffPayload | null> {
    const userData = localStorage.getItem('user');
    if (!userData || userData === '{}' || userData === 'null') {
      return signal(null);
    }
    try {
      return signal(JSON.parse(userData));
    } catch {
      return signal(null);
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
          if (error?.error?.statusCode === 5003) {
            this.messageService.add({
              severity: 'error',
              summary: 'Login Failed',
              detail: 'Invalid username or password',
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Login Failed',
              detail: 'Something went wrong. Please try again later.',
            });
          }
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
      .post<ApiResponse>(`${this.apiUrl}api/auth/reset-password`, { password, token, userType: STAFF_USER_TYPE })
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

  getStaffUsers(): Observable<StaffPayload[]> {
    return this.http.get<StaffPayload[]>(`${this.apiUrl}users/type/STAFF`);
  }

  getStaff(id: string): Observable<StaffPayload> {
    return this.http.get<StaffPayload>(`${this.apiUrl}users/${id}`);
  }

  saveUser(user: Partial<StaffPayload>): Observable<StaffPayload> {
    return this.http.post<StaffPayload>(`${this.apiUrl}users`, user);
  }

  updateUser(user: Partial<StaffPayload>): Observable<StaffPayload> {
    return this.http.put<StaffPayload>(`${this.apiUrl}users`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}users/${id}`);
  }

  lockAccount(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}users/lock/${id}`, {});
  }

  unlockAccount(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}users/unlock/${id}`, {});
  }

  getAllRoles(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.apiUrl}roles`);
  }

  getRoleById(id: string): Observable<unknown> {
    return this.http.get(`${this.apiUrl}roles/${id}`);
  }

  saveRole(data: unknown): Observable<unknown> {
    return this.http.post(`${this.apiUrl}roles`, data);
  }

  updateRole(data: unknown): Observable<unknown> {
    return this.http.put(`${this.apiUrl}roles`, data);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}roles/${id}`);
  }

  getPermissions(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.apiUrl}permissions`);
  }

  updateRoleWithPermissions(data: unknown): Observable<unknown> {
    return this.http.put(`${this.apiUrl}roles/permissions`, data);
  }

  private storeTokens(data: LoginResponse): void {
    localStorage.setItem('token', data.data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.data));
  }

  private clearSessionAndRedirect(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTimeout(() => {
      this.sessionLoading.set(null);
      this.router.navigate(['/login']);
    }, NAV_DELAY_MS);
  }
}
