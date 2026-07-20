import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface ProfessionRecord {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ProfessionApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getProfessions(): Observable<ApiResponse<ProfessionRecord[]>> {
    return this.http.get<ApiResponse<ProfessionRecord[]>>(`${this.apiUrl}professions`);
  }

  createProfession(name: string): Observable<ApiResponse<ProfessionRecord>> {
    return this.http.post<ApiResponse<ProfessionRecord>>(`${this.apiUrl}professions`, { name });
  }

  updateProfession(id: number, name: string): Observable<ApiResponse<ProfessionRecord>> {
    return this.http.put<ApiResponse<ProfessionRecord>>(`${this.apiUrl}professions/${id}`, { name });
  }

  deleteProfession(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}professions/${id}`);
  }
}
