import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface SelectedApplicationRecord {
  advertId: number;
  advertName: string;
  referenceNumber: string;
  closingDate: string;
  totalSelections: number;
}

export interface SelectedApplicantRecord {
  applicationId: string;
  applicantName: string;
  gender: string;
  age: number;
  marks: number;
  interviewNumber: string;
  offerDate: string | null;
  status: string;
  remarks: string;
}

@Injectable({ providedIn: 'root' })
export class SelectionApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getSelectedApplications(): Observable<ApiResponse<SelectedApplicationRecord[]>> {
    return this.http.get<ApiResponse<SelectedApplicationRecord[]>>(`${this.apiUrl}get-selected-applications`);
  }

  getSelectedApplicants(advertId: number): Observable<ApiResponse<SelectedApplicantRecord[]>> {
    return this.http.get<ApiResponse<SelectedApplicantRecord[]>>(`${this.apiUrl}get-selected-applicants/${advertId}`);
  }
}
