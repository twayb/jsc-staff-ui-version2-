import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface RegionShortlistStatRecord {
  regionResidenceId: string;
  interviewTypeId: number;
  totalApplications: string;
  advertId: string;
}

export interface InterviewVenueRegionLink {
  regionId: number;
}

export interface InterviewVenueRecord {
  id: number;
  name: string;
  districtId: number;
  venueCapacity: number;
  active: boolean;
  setInterviewRegionVenues: InterviewVenueRegionLink[];
}

export interface SetInterviewVenueInput {
  venueIds: number[];
  advertId: string;
  interviewTypeId: string;
  regionId: string;
}

export interface RegionVenueLookup {
  advertId: string;
  interviewTypeId: string;
  regionId: string;
}

export interface DistributedVenueRecord {
  venueId: number;
  venueName: string;
  venueCapacity: number;
  interviewDate: string;
  interviewTime: string;
  numberOfApplications: number;
  numberOfSessions: number;
}

export interface VenueApplicantLookup {
  advertId: string;
  interviewTypeId: string;
  venueId: string;
}

export interface VenueApplicantRecord {
  applicantName: string;
  applicantGender: string;
  interviewNumber: string;
  applicantPhoneNumber: string;
}

export interface InterviewVenueInput {
  name: string;
  regionIds: number[];
  districtId: number;
  venueCapacity: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class InterviewVenueApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getShortlistedByRegion(
    advertId: number,
    interviewTypeId: number,
  ): Observable<ApiResponse<RegionShortlistStatRecord[]>> {
    return this.http.get<ApiResponse<RegionShortlistStatRecord[]>>(
      `${this.apiUrl}advert-interview-venues/${advertId}/${interviewTypeId}`,
    );
  }

  getVenuesByRegion(regionId: number): Observable<ApiResponse<InterviewVenueRecord[]>> {
    return this.http.get<ApiResponse<InterviewVenueRecord[]>>(`${this.apiUrl}interview-region-venues/${regionId}`);
  }

  setInterviewVenues(input: SetInterviewVenueInput): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}set-interview-venues`, input);
  }

  listApplicationInterviews(input: RegionVenueLookup): Observable<ApiResponse<DistributedVenueRecord[]>> {
    return this.http.post<ApiResponse<DistributedVenueRecord[]>>(`${this.apiUrl}list-application-interviews`, input);
  }

  getApplicantsByVenue(input: VenueApplicantLookup): Observable<ApiResponse<VenueApplicantRecord[]>> {
    return this.http.post<ApiResponse<VenueApplicantRecord[]>>(`${this.apiUrl}applicant-interview-venue`, input);
  }

  getInterviewVenues(): Observable<ApiResponse<InterviewVenueRecord[]>> {
    return this.http.get<ApiResponse<InterviewVenueRecord[]>>(`${this.apiUrl}interview-venues`);
  }

  createInterviewVenue(input: InterviewVenueInput): Observable<ApiResponse<InterviewVenueRecord>> {
    return this.http.post<ApiResponse<InterviewVenueRecord>>(`${this.apiUrl}interview-venues`, input);
  }

  updateInterviewVenue(id: number, input: InterviewVenueInput): Observable<ApiResponse<InterviewVenueRecord>> {
    return this.http.put<ApiResponse<InterviewVenueRecord>>(`${this.apiUrl}interview-venues/${id}`, input);
  }

  deleteInterviewVenue(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}interview-venues/${id}`);
  }
}
