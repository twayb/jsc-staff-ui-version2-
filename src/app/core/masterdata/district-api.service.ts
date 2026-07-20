import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface DistrictRecord {
  id: number;
  name: string;
  code: string;
  regionId: number;
}

@Injectable({ providedIn: 'root' })
export class DistrictApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}msdt/`;

  getDistricts(): Observable<ApiResponse<DistrictRecord[]>> {
    return this.http.get<ApiResponse<DistrictRecord[]>>(`${this.apiUrl}districts`);
  }
}
