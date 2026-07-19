import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface ApplicationSummaryRecord {
  id: number;
  schemeName: string;
  advertReferenceNumber: string;
  advertNumberOfPosts: string;
  advertTotalApplications: string;
  advertClosingDate: string | null;
}

export interface ApplicationSummaryPage {
  content: ApplicationSummaryRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class ApplicationApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getApplications(): Observable<ApiResponse<ApplicationSummaryPage>> {
    return this.http.get<ApiResponse<ApplicationSummaryPage>>(`${this.apiUrl}adverts/applicants`);
  }
}
