import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';
import { ApplicationDetailRecord } from './applicant-preview-api.service';

export type ShortlistStatus = 'SHORTLISTED' | 'NOT_SHORTLISTED';

export interface ApplicationRecord {
  applicantName: string;
  dob: string;
  applicationId: string;
  applicantId: string | null;
  advertId: string;
  applicationDate: string | null;
  remarks: string | null;
  shortlisted: ShortlistStatus | null;
  state: string | null;
  nin: string;
}

export interface ApplicationPage {
  content: ApplicationRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface DistributionStatRecord {
  userId: string;
  advertId: number;
  applications: number;
  shortlisted: number;
  notShortlisted: number;
  pending: number;
}

export interface DistributionStatPage {
  content: DistributionStatRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface PageOf<T> {
  content: T[];
  totalElements: number;
}

export interface ApplicationDetailPage {
  content: ApplicationDetailRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class LonglistApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getLonglist(advertId: number): Observable<ApiResponse<ApplicationPage>> {
    // This endpoint 500s on page=0 ("OFFSET must not be negative") — it expects 1-indexed pages.
    return this.fetchAll((page, size) => this.getLonglistPage(advertId, page, size), 1);
  }

  getShortlist(advertId: number, shortlisted: ShortlistStatus): Observable<ApiResponse<ApplicationPage>> {
    // Same 1-indexed quirk as getLonglist's endpoint.
    return this.fetchAll((page, size) => this.getShortlistPage(advertId, shortlisted, page, size), 1);
  }

  getDistributionStats(advertId: number): Observable<ApiResponse<DistributionStatPage>> {
    return this.fetchAll((page, size) => this.getDistributionStatsPage(advertId, page, size), 0);
  }

  distributeLonglist(advertId: number, userIds: string[]): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}admins/application-distribution/${advertId}`, {
      userIds,
    });
  }

  // All applications currently assigned to the requesting officer for this advert, any status
  // mixed together. The endpoint takes no userId; the officer is derived from the session, so
  // this can't be used to inspect another officer's queue (same limitation the old app had).
  getOfficerApplications(advertId: number): Observable<ApiResponse<ApplicationDetailPage>> {
    return this.fetchAll((page, size) => this.getOfficerApplicationsPage(advertId, page, size), 0);
  }

  // Status-scoped variants of the above — dedicated endpoints, not client-side filters.
  getOfficerApplicationsPending(advertId: number): Observable<ApiResponse<ApplicationDetailPage>> {
    return this.fetchAll((page, size) => this.getOfficerApplicationsByStatus('pending', advertId, page, size), 0);
  }

  getOfficerApplicationsShortlisted(advertId: number): Observable<ApiResponse<ApplicationDetailPage>> {
    return this.fetchAll(
      (page, size) => this.getOfficerApplicationsByStatus('short-listed', advertId, page, size),
      0,
    );
  }

  getOfficerApplicationsNotShortlisted(advertId: number): Observable<ApiResponse<ApplicationDetailPage>> {
    return this.fetchAll(
      (page, size) => this.getOfficerApplicationsByStatus('not-short-listed', advertId, page, size),
      0,
    );
  }

  // "Attended" — applications a specific officer has already decided on (shortlisted/not shortlisted).
  getOfficerAttended(advertId: number, userId: string): Observable<ApiResponse<ApplicationDetailPage>> {
    return this.fetchAll((page, size) => this.getOfficerAttendedPage(advertId, userId, page, size), 0);
  }

  private getLonglistPage(advertId: number, page: number, size: number): Observable<ApiResponse<ApplicationPage>> {
    const params = new HttpParams().set('adverts', advertId).set('page', page).set('size', size);
    return this.http.get<ApiResponse<ApplicationPage>>(`${this.apiUrl}admins/applications`, { params });
  }

  private getShortlistPage(
    advertId: number,
    shortlisted: ShortlistStatus,
    page: number,
    size: number,
  ): Observable<ApiResponse<ApplicationPage>> {
    const params = new HttpParams()
      .set('advert', advertId)
      .set('shortlisted', shortlisted)
      .set('page', page)
      .set('size', size);
    return this.http.get<ApiResponse<ApplicationPage>>(`${this.apiUrl}applications/shortlists`, { params });
  }

  private getOfficerApplicationsPage(
    advertId: number,
    page: number,
    size: number,
  ): Observable<ApiResponse<ApplicationDetailPage>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<ApplicationDetailPage>>(`${this.apiUrl}admins/officer-applications/${advertId}`, {
      params,
    });
  }

  private getOfficerApplicationsByStatus(
    status: 'pending' | 'short-listed' | 'not-short-listed',
    advertId: number,
    page: number,
    size: number,
  ): Observable<ApiResponse<ApplicationDetailPage>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<ApplicationDetailPage>>(
      `${this.apiUrl}admins/officer-applications/${status}/${advertId}`,
      { params },
    );
  }

  private getOfficerAttendedPage(
    advertId: number,
    userId: string,
    page: number,
    size: number,
  ): Observable<ApiResponse<ApplicationDetailPage>> {
    const params = new HttpParams().set('page', page).set('size', size);
    const body = { advertId, userId, status: ['SHORTLISTED', 'NOT_SHORTLISTED'] };
    return this.http.post<ApiResponse<ApplicationDetailPage>>(`${this.apiUrl}admins/officer-applications`, body, {
      params,
    });
  }

  private getDistributionStatsPage(
    advertId: number,
    page: number,
    size: number,
  ): Observable<ApiResponse<DistributionStatPage>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<DistributionStatPage>>(
      `${this.apiUrl}admins/officer-all-applications/stats/${advertId}`,
      { params },
    );
  }

  // The backend's OFFSET math also breaks if `size` overshoots the real row count (e.g. size=1000 on
  // a 12-row result throws "OFFSET must not be negative"). So fetch a 1-row page first to learn
  // totalElements, then re-fetch with size clamped to that exact total — never overshooting.
  private fetchAll<P extends PageOf<unknown>>(
    request: (page: number, size: number) => Observable<ApiResponse<P>>,
    startPage: number,
  ): Observable<ApiResponse<P>> {
    return request(startPage, 1).pipe(
      switchMap((first) => {
        const total = first.data?.totalElements ?? 0;
        if (total <= 1) {
          return of(first);
        }
        return request(startPage, total);
      }),
    );
  }
}
