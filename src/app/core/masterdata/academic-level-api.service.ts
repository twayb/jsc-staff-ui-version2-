import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface AcademicLevelRecord {
  id: number;
  name: string;
  level: number;
  controlCode: number;
}

@Injectable({ providedIn: 'root' })
export class AcademicLevelApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getAcademicLevels(): Observable<ApiResponse<AcademicLevelRecord[]>> {
    return this.http.get<ApiResponse<AcademicLevelRecord[]>>(`${this.apiUrl}academic-levels`);
  }
}
