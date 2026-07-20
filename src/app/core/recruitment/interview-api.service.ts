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

export interface InterviewPanelRecord {
  id: number;
  panelName: string;
}

export type PanelMemberType = 'CHAIRMAN' | 'SECRETARY' | 'MEMBER';

export interface PanelMemberInput {
  name: string;
  email: string;
  userId: string;
  memberType: PanelMemberType;
}

export interface SetPanelMembersInput {
  panelId: number;
  membersList: PanelMemberInput[];
}

export interface PanelMemberRecord {
  id: number;
  name: string;
  email: string;
  userId: string | null;
  memberType: PanelMemberType;
}

export interface InterviewResultRecord {
  applicantName: string;
  interviewNumber: string;
  applicantGender: string;
  interviewMarks: string;
  resultStatus: string;
}

export interface ExportFormatData {
  advertName: string;
  interviewTypeName: string;
  base64: string;
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

  getInterviewPanels(interviewId: number): Observable<ApiResponse<InterviewPanelRecord[]>> {
    return this.http.get<ApiResponse<InterviewPanelRecord[]>>(`${this.apiUrl}interview-panels/${interviewId}`);
  }

  createInterviewPanel(interviewId: number, panelName: string): Observable<ApiResponse<InterviewPanelRecord>> {
    return this.http.post<ApiResponse<InterviewPanelRecord>>(`${this.apiUrl}set-interview-panels/${interviewId}`, {
      panelName,
    });
  }

  distributeToPanels(advertId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}panel-distribute/${advertId}`, null);
  }

  setPanelMembers(input: SetPanelMembersInput): Observable<ApiResponse<PanelMemberRecord[]>> {
    return this.http.post<ApiResponse<PanelMemberRecord[]>>(`${this.apiUrl}set-panel-members`, input);
  }

  getPanelMembers(panelId: number): Observable<ApiResponse<PanelMemberRecord[]>> {
    return this.http.get<ApiResponse<PanelMemberRecord[]>>(`${this.apiUrl}panellists/${panelId}`);
  }

  exportPanelistOralFormat(panelistId: number, numberOfQuestions: number): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}export-panelist/oralInterviewPanel`,
      { panelistId, numberOfQuestions },
      { responseType: 'blob' },
    );
  }

  publishInterviews(advertId: number): Observable<ApiResponse<void>> {
    return this.http.get<ApiResponse<void>>(`${this.apiUrl}admins/publish-applications/${advertId}`);
  }

  getInterviewResults(advertId: number, interviewTypeId: number): Observable<ApiResponse<InterviewResultRecord[]>> {
    return this.http.get<ApiResponse<InterviewResultRecord[]>>(
      `${this.apiUrl}interview-results/${advertId}/${interviewTypeId}`,
    );
  }

  exportDistributedApplications(advertId: number, interviewTypeId: number): Observable<ApiResponse<ExportFormatData>> {
    return this.http.get<ApiResponse<ExportFormatData>>(
      `${this.apiUrl}distributed-applications/${advertId}/${interviewTypeId}/export`,
    );
  }

  uploadResults(advertId: number, interviewTypeId: number, base64EncodedExcel: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}applications-results/${advertId}/${interviewTypeId}/upload`, {
      base64EncodedExcel,
    });
  }

  getUploadStatus(advertId: number, interviewTypeId: number): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.apiUrl}applications-results/${advertId}/${interviewTypeId}/status`);
  }

  saveResultsCutOff(advertId: number, interviewTypeId: number, cutOffMarks: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}interview-results-cut-off/${advertId}/${interviewTypeId}`, {
      cutOffMarks,
    });
  }
}
