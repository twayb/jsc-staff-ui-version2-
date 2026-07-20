import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface ApplicantRecord {
  id: string;
  createdAt: string;
  nin: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  fullName: string | null;
  gender: string | null;
  email: string | null;
  mobile: string | null;
  dateBirth: string | null;
}

export interface ApplicantPage {
  content: ApplicantRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AcademicLevelRef {
  id: number;
  name: string;
  level: number;
  controlCode: number;
}

export interface AcademicCourseCategoryRef {
  id: number;
  name: string;
}

export interface AcademicCourseRef {
  id: number;
  name: string;
  level: AcademicLevelRef;
  courseCategory: AcademicCourseCategoryRef;
  verified: boolean;
}

export interface AcademicDocumentRef {
  id: string;
  [key: string]: unknown;
}

export interface ApplicantAcademicRecord {
  id: string;
  institutionName: string;
  startYear: number;
  endYear: number;
  countryId: number;
  gpa: number | null;
  devision: string | null;
  merit: string | null;
  point: number | null;
  indexNumber: string | null;
  level: AcademicLevelRef;
  course: AcademicCourseRef | null;
  documents: AcademicDocumentRef[];
}

export interface ApplicantDetailRecord {
  id: string;
  nin: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  fullName: string | null;
  gender: string | null;
  email: string | null;
  mobile: string | null;
  dateBirth: string | null;
  applicantAcademic: ApplicantAcademicRecord[];
}

@Injectable({ providedIn: 'root' })
export class ApplicantApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getApplicants(page = 0, size = 1000): Observable<ApiResponse<ApplicantPage>> {
    return this.http.get<ApiResponse<ApplicantPage>>(`${this.apiUrl}applicants?page=${page}&size=${size}`);
  }

  getApplicant(id: string): Observable<ApiResponse<ApplicantDetailRecord>> {
    return this.http.get<ApiResponse<ApplicantDetailRecord>>(`${this.apiUrl}applicants/${id}`);
  }

  deleteQualification(id: string, reasonForRemoval: string): Observable<ApiResponse<ApplicantAcademicRecord>> {
    return this.http.delete<ApiResponse<ApplicantAcademicRecord>>(`${this.apiUrl}academics/qualifications/${id}`, {
      body: { reasonForRemoval },
    });
  }
}
