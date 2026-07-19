import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface CourseRef {
  id: number;
  name: string;
}

export interface AcademicLevelRef {
  id: number;
  name: string;
}

export interface InstitutionRef {
  id: number;
  name: string;
  type: string;
}

export interface AcademicDocumentRecord {
  documentType: string;
  fileId: string;
}

export interface ApplicantAcademicRecord {
  institutionName: string;
  startYear: number;
  endYear: number;
  level: AcademicLevelRef | null;
  course: CourseRef | null;
  institution: InstitutionRef | null;
  documents: AcademicDocumentRecord[];
}

export interface ApplicantExperienceRecord {
  organisation: string;
  jobTitle: string;
  startDate: string;
  endDate: string | null;
  currentJob: boolean;
}

export interface LanguageRef {
  id: number;
  name: string;
}

export interface ApplicantLanguageRecord {
  language: LanguageRef | null;
  speak: string;
  read: string;
  write: string;
}

export interface ProfessionRef {
  id: number;
  name: string;
}

export interface ApplicantProfessionRecord {
  institution: InstitutionRef | null;
  institutionName: string | null;
  profession: ProfessionRef | null;
  professionName: string | null;
  startDate: string;
  endDate: string;
  certificate: string | null;
}

export interface ApplicantRefereeRecord {
  name: string;
  title: string;
  organisation: string;
  email: string;
  mobile: string;
  address: string;
  relationship: string;
}

export interface ApplicantOtherAttachmentRecord {
  documentType: string;
  fileId: string;
}

export interface ApplicantRecord {
  id: string;
  nin: string;
  fullName: string;
  gender: string;
  dateBirth: string;
  regionOfBirth: string;
  districtOfBirth: string;
  maritalStatus: string;
  govEmployee: boolean;
  email: string;
  mobile: string;
  address: string;
  applicantAcademic: ApplicantAcademicRecord[];
  applicantExperiences: ApplicantExperienceRecord[];
  applicantLanguages: ApplicantLanguageRecord[];
  applicantProfessions: ApplicantProfessionRecord[];
  applicantReferees: ApplicantRefereeRecord[];
  applicantOtherAttachments: ApplicantOtherAttachmentRecord[];
}

export interface ApplicationAdvertRecord {
  id: number;
  referenceNumber: string;
  name: string;
}

export interface ApplicationDetailRecord {
  id: string;
  createdAt: string;
  applicant: ApplicantRecord;
  advert: ApplicationAdvertRecord;
  applicationLetter: string | null;
  employerLetter: string | null;
  shortlisted: 'SHORTLISTED' | 'NOT_SHORTLISTED' | null;
  remarks: string | null;
}

@Injectable({ providedIn: 'root' })
export class ApplicantPreviewApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getApplication(applicationId: string): Observable<ApiResponse<ApplicationDetailRecord>> {
    return this.http.get<ApiResponse<ApplicationDetailRecord>>(`${this.apiUrl}applications/${applicationId}`);
  }
}
