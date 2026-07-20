import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface CountryRecord {
  id: number;
  name: string;
  nicename: string;
  iso: string;
  phonecode: string;
}

@Injectable({ providedIn: 'root' })
export class CountryApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}msdt/`;

  getCountries(): Observable<ApiResponse<CountryRecord[]>> {
    return this.http.get<ApiResponse<CountryRecord[]>>(`${this.apiUrl}countries`);
  }

  syncCountries(): Observable<ApiResponse<void>> {
    return this.http.get<ApiResponse<void>>(`${this.apiUrl}countries/sync`);
  }
}
