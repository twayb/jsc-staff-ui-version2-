import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface QuestionTypeRecord {
  id: number;
  name: string;
}

export interface QuestionCategoryRecord {
  id: number;
  category: string;
  status: boolean;
}

export interface PagedContent<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface AnswerOption {
  key: string;
  text: string;
}

export interface AddQuestionPayload {
  id?: number;
  educationLevelId: number;
  selectedSchemeIds: number[];
  schemeCategoryId?: number;
  interviewTypeId: number;
  questionTypeId: number;
  questionCategoryId?: number;
  pointAllocation: number;
  questionLevel: string;
  question: string;
  frequencyUsed?: number;
  answerOptions: AnswerOption[];
  correctAnswer: string;
  expectedAnswer: string;
  allowDuplicate?: boolean;
}

export interface SchemeCategoryStatRecord {
  schemeCategoryId: number;
  schemeCategoryName: string;
  total: number;
}

export interface SchemeQuestionCountRecord {
  schemeCategoryId: number;
  schemeCategoryName: string;
  schemeId: number;
  schemeName: string;
  total: number;
}

export interface QuestionRecord {
  id: number;
  educationLevelId: number;
  schemeId: number;
  selectedSchemeIds: number[];
  schemeCategoryId: number | null;
  selectedSchemeCategoryId: number[];
  interviewTypeId: number;
  questionTypeId: number;
  questionCategoryId: number;
  question: string;
  frequencyUsed: number;
  answerOptions: AnswerOption[];
  correctAnswer: string;
  expectedAnswer: string;
  questionLevel: string;
  pointAllocation: number;
  state: string;
  status: string;
}

export interface ImportFailedRow {
  questionNumber: number;
  reason: string;
}

export interface ImportResult {
  totalRows: number;
  savedRows: number;
  skippedRows: number;
  failedRows: ImportFailedRow[];
  errorReportBase64?: string;
}

export interface ExportTemplatePayload {
  id?: number;
  educationLevelId: number;
  schemeId: number[];
  interviewTypeId: number;
  questionTypeId: number;
  answerOptions: AnswerOption[];
  numberOfQuestions?: number;
}

export interface QuestionLevelCount {
  questionLevel: string;
  total: number;
}

export interface QuestionCategoryCount {
  questionCategoryId: number;
  questionCategoryName: string;
  total: number;
  levels: QuestionLevelCount[];
}

export interface QuestionCountByScheme {
  schemeId: number;
  total: number;
  categories: QuestionCategoryCount[];
}

export interface InterviewSetupQuotaLevel {
  questionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  count: number;
}

export interface InterviewSetupQuota {
  questionCategoryId: number;
  levels: InterviewSetupQuotaLevel[];
}

export interface InterviewSetupPayload {
  id?: number;
  advertId: number;
  interviewTypeId: number;
  questionTypeId: number;
  numberOfQuestions: number;
  questionSelectionMode: 'MANUAL' | 'RANDOM';
  selectedQuestionIds: number[];
  selectedInstructionIds: number[];
  startDateTime: string;
  endDateTime: string;
  showResultToCandidate: boolean;
  durationHours: number;
  durationMinutes: number;
  questionQuotas: InterviewSetupQuota[] | null;
}

export interface InterviewSetupRecord extends Omit<InterviewSetupPayload, 'questionTypeId'> {
  id: number;
  schemeId: number;
  questionTypeId: number | null;
  advertName: string;
  interviewTypeName: string;
}

export interface InterviewSessionSummaryRecord {
  id: number;
  advertId: number;
  advertName: string;
  interviewTypeId: number;
  interviewType: string;
  questionTypeId: number | null;
  questionType: string | null;
  startDateTime: string;
  endDateTime: string;
  durationHours: number;
  durationMinutes: number;
  timeLeftHours: number;
  timeLeftMinutes: number;
  totalCandidate: number;
  submittedCandidate: number;
}

export interface RegionSessionSummaryRecord {
  regionId: number;
  totalVenus: number;
  totalInterviewVenues: number;
  totalSubmittedVenues: number;
  completion: number;
  sessionLabel: string | null;
}

export interface VenueSessionRecord {
  venueId: number;
  venueName: string;
  regionId: number;
  totalApplicants: number;
  notStarted: number;
  inProgress: number;
  finished: number;
}

export interface SessionVenuesByRegion {
  advertId: number;
  advertName: string;
  interviewTypeId: number;
  interviewTypeName: string;
  regionId: number;
  totalApplicants: number;
  notStarted: number;
  inProgress: number;
  finished: number;
  interviewVenues: VenueSessionRecord[];
}

export interface VenueSessionSlotRecord {
  totalApplicants: number;
  sessionNumber: number;
  notStarted: number;
  inProgress: number;
  finished: number;
  accessCode: string | null;
}

export interface SessionsByVenue {
  totalApplicants: number;
  advertId: number;
  advertName: string;
  interviewTypeId: number;
  interviewTypeName: string;
  venueId: number;
  venueName: string;
  regionId: number;
  notStarted: number;
  inProgress: number;
  finished: number;
  sessions: VenueSessionSlotRecord[];
}

export interface GenerateAccessCodePayload {
  advertId: number;
  interviewTypeId: number;
  venueId: number;
  sessionNumber: number;
}

export interface AccessCodeRecord {
  accessCode: string;
}

export interface SessionCandidateRecord {
  applicantName: string;
  interviewNumber: string;
  applicantGender: string;
  applicantPhoneNumber: string;
  sessionNumber: number;
  venueId: number;
  venueName: string;
  advertId: number;
  interviewTypeId: number;
}

export interface SessionCandidatesQuery {
  advertId: number;
  interviewTypeId: number;
  venueId: number;
  sessionNumber: number;
}

export interface InterviewSessionByRegion {
  advertId: number;
  advertName: string;
  interviewTypeId: number;
  interviewTypeName: string;
  totalRegion: number;
  totalVenue: number;
  totalInterviews: number;
  totalSubmitted: number;
  sessionByRegion: RegionSessionSummaryRecord[];
}

@Injectable({ providedIn: 'root' })
export class QuestionBankApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}oats/`;
  private readonly questionUrl = `${environment.apiUrl}oats/api/question/`;

  getQuestionTypes(): Observable<ApiResponse<PagedContent<QuestionTypeRecord>>> {
    return this.http.get<ApiResponse<PagedContent<QuestionTypeRecord>>>(`${this.baseUrl}question-types`);
  }

  createQuestionType(name: string): Observable<ApiResponse<QuestionTypeRecord>> {
    return this.http.post<ApiResponse<QuestionTypeRecord>>(`${this.baseUrl}question-types`, { name });
  }

  updateQuestionType(id: number, name: string): Observable<ApiResponse<QuestionTypeRecord>> {
    return this.http.put<ApiResponse<QuestionTypeRecord>>(`${this.baseUrl}question-types/${id}`, { name });
  }

  deleteQuestionType(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}question-types/${id}`);
  }

  getQuestionCategories(): Observable<ApiResponse<PagedContent<QuestionCategoryRecord>>> {
    return this.http.get<ApiResponse<PagedContent<QuestionCategoryRecord>>>(`${this.baseUrl}api/question-category`);
  }

  createQuestionCategory(payload: { category: string; status: boolean }): Observable<ApiResponse<QuestionCategoryRecord>> {
    return this.http.post<ApiResponse<QuestionCategoryRecord>>(`${this.baseUrl}api/question-category`, payload);
  }

  updateQuestionCategory(
    id: number,
    payload: { category: string; status: boolean },
  ): Observable<ApiResponse<QuestionCategoryRecord>> {
    return this.http.put<ApiResponse<QuestionCategoryRecord>>(`${this.baseUrl}api/question-category/${id}`, payload);
  }

  deleteQuestionCategory(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}api/question-category/${id}`);
  }

  addQuestion(payload: AddQuestionPayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.questionUrl}add`, payload);
  }

  getQuestionsBySchemeCategory(): Observable<ApiResponse<SchemeCategoryStatRecord[]>> {
    return this.http.get<ApiResponse<SchemeCategoryStatRecord[]>>(`${this.questionUrl}by/scheme-category`);
  }

  getQuestionsGroupByScheme(schemeCategoryId: number): Observable<ApiResponse<SchemeQuestionCountRecord[]>> {
    return this.http.get<ApiResponse<SchemeQuestionCountRecord[]>>(
      `${this.questionUrl}group-by-scheme/${schemeCategoryId}`,
    );
  }

  getQuestionsByScheme(
    schemeId: number,
    page = 0,
    size = 1000,
    questionTypeId?: number,
  ): Observable<ApiResponse<PagedContent<QuestionRecord>>> {
    const params: Record<string, number> = { page, size };
    if (questionTypeId !== undefined) {
      params['questionTypeId'] = questionTypeId;
    }
    return this.http.get<ApiResponse<PagedContent<QuestionRecord>>>(`${this.questionUrl}by/scheme/${schemeId}`, {
      params,
    });
  }

  getQuestionCountByScheme(
    schemeId: number,
    questionTypeId: number,
  ): Observable<ApiResponse<QuestionCountByScheme>> {
    return this.http.get<ApiResponse<QuestionCountByScheme>>(`${this.questionUrl}count/by-scheme/${schemeId}`, {
      params: { questionTypeId },
    });
  }

  approveQuestion(id: number): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.questionUrl}state`, { questionIds: [id], state: 'APPROVED' });
  }

  approveQuestions(ids: number[]): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.questionUrl}state`, { questionIds: ids, state: 'APPROVED' });
  }

  updateQuestionStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.questionUrl}status`, { questionIds: [id], status });
  }

  updateQuestionsStatus(ids: number[], status: 'ACTIVE' | 'INACTIVE'): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.questionUrl}status`, { questionIds: ids, status });
  }

  exportTemplate(payload: ExportTemplatePayload): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.questionUrl}export/template`, payload);
  }

  importQuestions(
    schemeId: number,
    educationLevelId: number,
    interviewTypeId: number,
    questionTypeId: number,
    questionCategoryId: number,
    pointAllocation: number,
    questionLevel: string,
    file: File,
  ): Observable<ApiResponse<ImportResult>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<ImportResult>>(`${this.questionUrl}import`, formData, {
      params: { schemeId, educationLevelId, interviewTypeId, questionTypeId, questionCategoryId, pointAllocation, questionLevel },
    });
  }

  addInterviewSetup(payload: InterviewSetupPayload): Observable<ApiResponse<InterviewSetupRecord>> {
    return this.http.post<ApiResponse<InterviewSetupRecord>>(`${this.baseUrl}api/interview/setup/add`, payload);
  }

  getInterviewSetupList(): Observable<ApiResponse<InterviewSetupRecord[]>> {
    return this.http.get<ApiResponse<InterviewSetupRecord[]>>(`${this.baseUrl}api/interview/setup/list`);
  }

  getInterviewSetupById(id: number): Observable<ApiResponse<InterviewSetupRecord>> {
    return this.http.get<ApiResponse<InterviewSetupRecord>>(`${this.baseUrl}api/interview/setup/${id}`);
  }

  getInterviewQuestionsBase64(id: number): Observable<string> {
    return this.http.get(`${this.baseUrl}api/interview/setup/${id}/questions-base64`, { responseType: 'text' });
  }

  getInterviewSetupListByApplicantTotal(): Observable<ApiResponse<InterviewSessionSummaryRecord[]>> {
    return this.http.get<ApiResponse<InterviewSessionSummaryRecord[]>>(
      `${this.baseUrl}api/interview/setup/list/by-applicant-total`,
    );
  }

  getInterviewSessionByRegion(interviewSetupId: number): Observable<ApiResponse<InterviewSessionByRegion>> {
    return this.http.get<ApiResponse<InterviewSessionByRegion>>(
      `${this.baseUrl}api/interview/setup/get/interview-session/by-region/${interviewSetupId}`,
    );
  }

  getSessionVenues(
    regionId: number,
    advertId: number,
    interviewTypeId: number,
  ): Observable<ApiResponse<SessionVenuesByRegion>> {
    return this.http.get<ApiResponse<SessionVenuesByRegion>>(
      `${this.baseUrl}api/interview/setup/list/region/venues/${regionId}/${advertId}/${interviewTypeId}`,
    );
  }

  getSessionsByVenue(
    venueId: number,
    advertId: number,
    interviewTypeId: number,
  ): Observable<ApiResponse<SessionsByVenue>> {
    return this.http.get<ApiResponse<SessionsByVenue>>(
      `${this.baseUrl}api/interview/setup/get/session/venues/${venueId}/${advertId}/${interviewTypeId}`,
    );
  }

  generateSessionAccessCode(payload: GenerateAccessCodePayload): Observable<ApiResponse<AccessCodeRecord>> {
    return this.http.post<ApiResponse<AccessCodeRecord>>(
      `${this.baseUrl}api/interview/setup/session/access-code/generate`,
      payload,
    );
  }

  getCandidatesBySession(payload: SessionCandidatesQuery): Observable<ApiResponse<SessionCandidateRecord[]>> {
    return this.http.post<ApiResponse<SessionCandidateRecord[]>>(
      `${this.baseUrl}api/interview/setup/list/application/by-session/venue`,
      payload,
    );
  }
}
