import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';
import { AuditLogPage } from './audit-log.types';

@Injectable({ providedIn: 'root' })
export class RecruitmentAuditApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/admins/`;

  getAuditLogs(page = 0, size = 1000): Observable<ApiResponse<AuditLogPage>> {
    return this.http.get<ApiResponse<AuditLogPage>>(`${this.apiUrl}recruitment-audit-logs`, {
      params: { page, size },
    });
  }
}
