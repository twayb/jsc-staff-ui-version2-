import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface AttachmentTypeRecord {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AttachmentTypeApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}recruit/`;

  getAttachmentTypes(): Observable<ApiResponse<AttachmentTypeRecord[]>> {
    return this.http.get<ApiResponse<AttachmentTypeRecord[]>>(`${this.apiUrl}attachment-types`);
  }

  createAttachmentType(name: string): Observable<ApiResponse<AttachmentTypeRecord>> {
    return this.http.post<ApiResponse<AttachmentTypeRecord>>(`${this.apiUrl}attachment-type`, { name });
  }

  updateAttachmentType(id: number, name: string): Observable<ApiResponse<AttachmentTypeRecord>> {
    return this.http.put<ApiResponse<AttachmentTypeRecord>>(`${this.apiUrl}attachment-type/${id}`, { name });
  }

  deleteAttachmentType(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}attachment-type/${id}`);
  }
}
