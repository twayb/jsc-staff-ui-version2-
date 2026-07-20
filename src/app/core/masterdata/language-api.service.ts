import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface LanguageRecord {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class LanguageApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getLanguages(): Observable<ApiResponse<LanguageRecord[]>> {
    return this.http.get<ApiResponse<LanguageRecord[]>>(`${this.apiUrl}languages`);
  }

  createLanguage(name: string): Observable<ApiResponse<LanguageRecord>> {
    return this.http.post<ApiResponse<LanguageRecord>>(`${this.apiUrl}languages`, { name });
  }

  updateLanguage(id: number, name: string): Observable<ApiResponse<LanguageRecord>> {
    return this.http.put<ApiResponse<LanguageRecord>>(`${this.apiUrl}languages/${id}`, { name });
  }

  deleteLanguage(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}languages/${id}`);
  }
}
