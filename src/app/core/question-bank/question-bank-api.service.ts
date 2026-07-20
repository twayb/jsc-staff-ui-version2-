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

@Injectable({ providedIn: 'root' })
export class QuestionBankApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}oats/`;
  private readonly questionUrl = `${environment.apiUrl}oats/api/question/`;

  getQuestionTypes(): Observable<ApiResponse<PagedContent<QuestionTypeRecord>>> {
    return this.http.get<ApiResponse<PagedContent<QuestionTypeRecord>>>(`${this.baseUrl}question-types`);
  }

  getQuestionCategories(): Observable<ApiResponse<PagedContent<QuestionCategoryRecord>>> {
    return this.http.get<ApiResponse<PagedContent<QuestionCategoryRecord>>>(`${this.baseUrl}api/question-category`);
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
}
