import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './auth.service';

export interface StaffRecord {
  id: string;
  createdBy: string | null;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  email: string;
  type: string;
  mobileNumber: string | null;
  lastLogin: string | null;
  passwordResetToken: string | null;
  passwordResetTokenExpireDate: string | null;
  isLocked: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}uaa/`;

  getStaffUsers(): Observable<ApiResponse<StaffRecord[]>> {
    return this.http.get<ApiResponse<StaffRecord[]>>(`${this.apiUrl}users`);
  }

  getStaff(id: string): Observable<ApiResponse<StaffRecord>> {
    return this.http.get<ApiResponse<StaffRecord>>(`${this.apiUrl}users/${id}`);
  }

  saveUser(user: Partial<StaffRecord>): Observable<ApiResponse<StaffRecord>> {
    return this.http.post<ApiResponse<StaffRecord>>(`${this.apiUrl}users`, user);
  }

  updateUser(user: Partial<StaffRecord>): Observable<ApiResponse<StaffRecord>> {
    return this.http.put<ApiResponse<StaffRecord>>(`${this.apiUrl}users`, user);
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
}
