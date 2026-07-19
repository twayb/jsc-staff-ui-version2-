import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface AdvertRecord {
  id: number;
  referenceNumber: string;
  advertName: string;
  schemeName: string;
  schemeCategory: string | null;
  salaryScale: string | null;
  duties: string | null;
  qualifications: string | null;
  numberPost: string;
  openingDate: string | null;
  closingDate: string | null;
  state: string;
  advertStatus: boolean;
}

export interface AdvertPage {
  content: AdvertRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdvertUpdateInput {
  numberPost: number;
  openingDate: string;
  closingDate: string;
}

@Injectable({ providedIn: 'root' })
export class AdvertApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getAdverts(): Observable<ApiResponse<AdvertPage>> {
    return this.http.get<ApiResponse<AdvertPage>>(`${this.apiUrl}adverts`);
  }

  getAdvert(id: number): Observable<ApiResponse<AdvertRecord>> {
    return this.http.get<ApiResponse<AdvertRecord>>(`${this.apiUrl}adverts/${id}`);
  }

  updateAdvert(id: number, advert: AdvertUpdateInput): Observable<ApiResponse<AdvertRecord>> {
    return this.http.put<ApiResponse<AdvertRecord>>(`${this.apiUrl}adverts/${id}`, advert);
  }

  approveAdvert(id: number): Observable<ApiResponse<AdvertRecord>> {
    return this.http.put<ApiResponse<AdvertRecord>>(`${this.apiUrl}adverts-approve/${id}`, null);
  }
}
