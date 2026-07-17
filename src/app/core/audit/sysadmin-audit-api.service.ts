import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';
import { AuditLogPage } from './audit-log.types';

@Injectable({ providedIn: 'root' })
export class SysadminAuditApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}fls/`;

  getAuditLogs(page = 0, size = 1000): Observable<ApiResponse<AuditLogPage>> {
    return this.http.get<ApiResponse<AuditLogPage>>(`${this.apiUrl}sysadmin-audit-logs`, {
      params: { page, size },
    });
  }
}
