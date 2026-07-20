import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface RegionRecord {
  id: number;
  name: string;
  code: string;
}

@Injectable({ providedIn: 'root' })
export class RegionApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}msdt/`;

  getRegions(): Observable<ApiResponse<RegionRecord[]>> {
    return this.http.get<ApiResponse<RegionRecord[]>>(`${this.apiUrl}regions`);
  }
}
