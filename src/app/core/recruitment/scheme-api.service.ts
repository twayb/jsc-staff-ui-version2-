import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface SchemeRef {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class SchemeApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getSchemesByEducationLevel(educationLevelId: number): Observable<ApiResponse<SchemeRef[]>> {
    return this.http.get<ApiResponse<SchemeRef[]>>(`${this.apiUrl}schemes/by-education-level/${educationLevelId}`);
  }
}
