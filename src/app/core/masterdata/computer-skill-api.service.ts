import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface ComputerSkillRecord {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ComputerSkillApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getComputerSkills(): Observable<ApiResponse<ComputerSkillRecord[]>> {
    return this.http.get<ApiResponse<ComputerSkillRecord[]>>(`${this.apiUrl}computer-skills`);
  }

  createComputerSkill(name: string): Observable<ApiResponse<ComputerSkillRecord>> {
    return this.http.post<ApiResponse<ComputerSkillRecord>>(`${this.apiUrl}computer-skills`, { name });
  }

  updateComputerSkill(id: number, name: string): Observable<ApiResponse<ComputerSkillRecord>> {
    return this.http.put<ApiResponse<ComputerSkillRecord>>(`${this.apiUrl}computer-skills/${id}`, { name });
  }

  deleteComputerSkill(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}computer-skills/${id}`);
  }
}
