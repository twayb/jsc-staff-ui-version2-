import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface DisabilityRecord {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class DisabilityApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getDisabilities(): Observable<ApiResponse<DisabilityRecord[]>> {
    return this.http.get<ApiResponse<DisabilityRecord[]>>(`${this.apiUrl}disability`);
  }

  createDisability(name: string): Observable<ApiResponse<DisabilityRecord>> {
    return this.http.post<ApiResponse<DisabilityRecord>>(`${this.apiUrl}disability`, { name });
  }

  updateDisability(id: number, name: string): Observable<ApiResponse<DisabilityRecord>> {
    return this.http.put<ApiResponse<DisabilityRecord>>(`${this.apiUrl}disability/${id}`, { name });
  }

  deleteDisability(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}disability/${id}`);
  }
}
