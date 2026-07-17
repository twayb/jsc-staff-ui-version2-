import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface PermitScheme {
  id: number;
  name: string;
}

export interface PermitSchemeEntry {
  id: string;
  scheme: PermitScheme;
  numberOfPost: number;
}

export interface PermitRecord {
  id: string;
  name: string;
  permitType: string;
  permitNo: string;
  startDate: string;
  endDate: string;
  status: string;
  numberOfPost: number;
  fileId: string | null;
  approvedBy: string | null;
  createdAt: string;
  permitSchemes: PermitSchemeEntry[];
}

// The full scheme catalog record from /recruit/schemes — only id/name are used for the picker,
// the rest (duties, salaryScale, qualification, ...) is scheme master data we don't need here.
export interface SchemeCatalogEntry {
  id: number;
  name: string;
}

export interface PermitSchemeInput {
  schemeId: number;
  numberOfPost: number;
}

export interface PermitInput {
  name: string;
  permitType: string;
  permitNo: string;
  startDate: string;
  endDate: string;
  numberOfPost: number;
  fileId: string;
  permitSchemes: PermitSchemeInput[];
}

@Injectable({ providedIn: 'root' })
export class PermitsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getPermits(): Observable<ApiResponse<PermitRecord[]>> {
    return this.http.get<ApiResponse<PermitRecord[]>>(`${this.apiUrl}permits`);
  }

  getSchemes(): Observable<ApiResponse<SchemeCatalogEntry[]>> {
    return this.http.get<ApiResponse<SchemeCatalogEntry[]>>(`${this.apiUrl}schemes`);
  }

  createPermit(permit: PermitInput): Observable<ApiResponse<PermitRecord>> {
    return this.http.post<ApiResponse<PermitRecord>>(`${this.apiUrl}permits`, permit);
  }

  updatePermit(id: string, permit: PermitInput): Observable<ApiResponse<PermitRecord>> {
    return this.http.put<ApiResponse<PermitRecord>>(`${this.apiUrl}permits/${id}`, { id, ...permit });
  }

  approvePermit(id: string): Observable<ApiResponse<PermitRecord>> {
    return this.http.put<ApiResponse<PermitRecord>>(`${this.apiUrl}permits-approve/${id}`, null);
  }

  deletePermit(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}permits/${id}`);
  }
}
