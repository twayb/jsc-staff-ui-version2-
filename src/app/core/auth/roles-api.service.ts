import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RolesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}uaa/`;

  getAllRoles(): Observable<ApiResponse<unknown[]>> {
    return this.http.get<ApiResponse<unknown[]>>(`${this.apiUrl}roles`);
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

  getPermissions(): Observable<ApiResponse<unknown[]>> {
    return this.http.get<ApiResponse<unknown[]>>(`${this.apiUrl}permissions`);
  }

  updateRoleWithPermissions(data: unknown): Observable<unknown> {
    return this.http.put(`${this.apiUrl}roles/permissions`, data);
  }
}
