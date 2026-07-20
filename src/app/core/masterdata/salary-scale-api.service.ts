import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface SalaryScaleRecord {
  id: number;
  scaleName: string;
  minName: string;
  minAmount: string;
  maxName: string;
  maxAmount: string;
}

export interface SalaryScaleInput {
  scaleName: string;
  minName: string;
  minAmount: number;
  maxName: string;
  maxAmount: number;
}

@Injectable({ providedIn: 'root' })
export class SalaryScaleApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getSalaryScales(): Observable<ApiResponse<SalaryScaleRecord[]>> {
    return this.http.get<ApiResponse<SalaryScaleRecord[]>>(`${this.apiUrl}salary-scale`);
  }

  createSalaryScale(input: SalaryScaleInput): Observable<ApiResponse<SalaryScaleRecord>> {
    return this.http.post<ApiResponse<SalaryScaleRecord>>(`${this.apiUrl}salary-scale`, input);
  }

  updateSalaryScale(id: number, input: SalaryScaleInput): Observable<ApiResponse<SalaryScaleRecord>> {
    return this.http.put<ApiResponse<SalaryScaleRecord>>(`${this.apiUrl}salary-scale/${id}`, input);
  }

  deleteSalaryScale(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}salary-scale/${id}`);
  }
}
