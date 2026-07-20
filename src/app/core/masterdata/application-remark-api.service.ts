import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface ApplicationRemarkRecord {
  id: number;
  remark: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationRemarkApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getRemarks(): Observable<ApiResponse<ApplicationRemarkRecord[]>> {
    return this.http.get<ApiResponse<ApplicationRemarkRecord[]>>(`${this.apiUrl}application-remarks`);
  }

  createRemark(remark: string): Observable<ApiResponse<ApplicationRemarkRecord>> {
    return this.http.post<ApiResponse<ApplicationRemarkRecord>>(`${this.apiUrl}application-remarks`, { remark });
  }

  updateRemark(id: number, remark: string): Observable<ApiResponse<ApplicationRemarkRecord>> {
    return this.http.put<ApiResponse<ApplicationRemarkRecord>>(`${this.apiUrl}application-remarks/${id}`, { remark });
  }

  deleteRemark(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}application-remarks/${id}`);
  }
}
