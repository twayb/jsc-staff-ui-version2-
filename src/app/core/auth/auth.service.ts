import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

const REQUEST_TIMEOUT_MS = 15_000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  forgotPassword(email: string): Observable<void> {
    return this.http
      .post<void>(`${environment.apiUrl}/auth/forgot-password`, { email })
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  resetPassword(password: string, token: string): Observable<void> {
    return this.http
      .post<void>(`${environment.apiUrl}/auth/reset-password`, { password, token })
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }
}
