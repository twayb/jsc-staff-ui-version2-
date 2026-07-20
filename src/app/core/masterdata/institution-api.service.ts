import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export type InstitutionType = 'ACADEMIC' | 'PROFESSIONAL';

export interface InstitutionRecord {
  id: number;
  name: string;
  type: InstitutionType;
  countryId: number;
}

export interface InstitutionInput {
  name: string;
  type: InstitutionType;
  countryId: number;
}

@Injectable({ providedIn: 'root' })
export class InstitutionApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getInstitutions(): Observable<ApiResponse<InstitutionRecord[]>> {
    return this.http.get<ApiResponse<InstitutionRecord[]>>(`${this.apiUrl}institutions`);
  }

  createInstitution(input: InstitutionInput): Observable<ApiResponse<InstitutionRecord>> {
    return this.http.post<ApiResponse<InstitutionRecord>>(`${this.apiUrl}institutions`, input);
  }

  updateInstitution(id: number, input: InstitutionInput): Observable<ApiResponse<InstitutionRecord>> {
    return this.http.put<ApiResponse<InstitutionRecord>>(`${this.apiUrl}institutions/${id}`, input);
  }

  deleteInstitution(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}institutions/${id}`);
  }
}
