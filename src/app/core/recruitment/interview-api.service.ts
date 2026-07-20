import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface InterviewTypeRef {
  id: number;
  name: string;
  level: number;
}

export interface InterviewRecord {
  id: number;
  interviewDate: string;
  interviewTime: string;
  interviewCutOff: number | null;
  interviewMarksWeight: number;
  interviewType: InterviewTypeRef;
  status: string;
  venues: unknown[];
}

export interface InterviewInput {
  interviewTypeId: number;
  interviewDate: string;
  interviewTime: string;
  interviewMarksWeight: number;
}

@Injectable({ providedIn: 'root' })
export class InterviewApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getAdvertInterviews(advertId: number): Observable<ApiResponse<InterviewRecord[]>> {
    return this.http.get<ApiResponse<InterviewRecord[]>>(`${this.apiUrl}advert-interviews/${advertId}`);
  }

  getInterviewTypes(): Observable<ApiResponse<InterviewTypeRef[]>> {
    return this.http.get<ApiResponse<InterviewTypeRef[]>>(`${this.apiUrl}interview-types`);
  }

  createInterview(advertId: number, input: InterviewInput): Observable<ApiResponse<InterviewRecord>> {
    return this.http.post<ApiResponse<InterviewRecord>>(`${this.apiUrl}advert-interviews/${advertId}`, input);
  }

  updateInterview(id: number, input: InterviewInput): Observable<ApiResponse<InterviewRecord>> {
    return this.http.put<ApiResponse<InterviewRecord>>(`${this.apiUrl}advert-interviews/${id}`, input);
  }

  deleteInterview(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}advert-interviews/${id}`);
  }
}
