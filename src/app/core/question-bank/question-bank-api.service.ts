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
  ): Observable<ApiResponse<PagedContent<QuestionRecord>>> {
    return this.http.get<ApiResponse<PagedContent<QuestionRecord>>>(`${this.questionUrl}by/scheme/${schemeId}`, {
      params: { page, size },
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
}
