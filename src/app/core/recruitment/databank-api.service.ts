import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

// Field names are best-guesses, mirrored from the analogous get-selected-applications shape —
// the endpoint has only ever returned an empty array so far. Confirm against a real populated
// response and tighten this once available.
export interface DatabankApplicationRecord {
  advertId: number;
  advertName: string;
  referenceNumber: string;
  totalApplicants: number;
  maleApplicants: number;
  femaleApplicants: number;
}

@Injectable({ providedIn: 'root' })
export class DatabankApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getDatabankApplications(): Observable<ApiResponse<DatabankApplicationRecord[]>> {
    return this.http.get<ApiResponse<DatabankApplicationRecord[]>>(`${this.apiUrl}get-databank-applications`);
  }
}
