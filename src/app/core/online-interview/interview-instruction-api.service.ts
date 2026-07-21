import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface InterviewInstructionRecord {
  id: number;
  instruction: string;
  status: boolean;
}

export interface InterviewInstructionPage {
  content: InterviewInstructionRecord[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface InterviewInstructionInput {
  instruction: string;
  status: boolean;
}

@Injectable({ providedIn: 'root' })
export class InterviewInstructionApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}oats/`;

  getInstructions(page = 0, size = 100): Observable<ApiResponse<InterviewInstructionPage>> {
    return this.http.get<ApiResponse<InterviewInstructionPage>>(`${this.apiUrl}instruction`, {
      params: { page, size },
    });
  }

  createInstruction(input: InterviewInstructionInput): Observable<ApiResponse<InterviewInstructionRecord>> {
    return this.http.post<ApiResponse<InterviewInstructionRecord>>(`${this.apiUrl}instruction`, input);
  }

  updateInstruction(
    id: number,
    input: InterviewInstructionInput,
  ): Observable<ApiResponse<InterviewInstructionRecord>> {
    return this.http.put<ApiResponse<InterviewInstructionRecord>>(`${this.apiUrl}instruction/${id}`, input);
  }

  deleteInstruction(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}instruction/${id}`);
  }
}
