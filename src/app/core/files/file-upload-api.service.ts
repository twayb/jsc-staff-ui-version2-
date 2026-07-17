import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface UploadedFile {
  id: string;
  fileName: string;
  fileType: string;
  fileDescription: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  kbSize: number | null;
}

@Injectable({ providedIn: 'root' })
export class FileUploadApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}fls/`;

  upload(file: File, documentType: string, fileDescription: string): Observable<ApiResponse<UploadedFile>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('description', fileDescription);
    return this.http.post<ApiResponse<UploadedFile>>(`${this.apiUrl}uploads`, formData);
  }
}
