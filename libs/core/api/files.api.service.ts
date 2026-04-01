import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '@shared/config/api-endpoints.config';

export interface UploadedFileResponse {
  url: string;
  path: string;
  fileName: string;
  size: number;
  mimeType: string;
}

@Injectable({
  providedIn: 'root'
})
export class FilesApiService {
  private http = inject(HttpClient);

  async uploadFile(file: File): Promise<UploadedFileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return firstValueFrom(
      this.http.post<UploadedFileResponse>(API_ENDPOINTS.FILES.UPLOAD, formData)
    );
  }

  async deleteFile(path: string): Promise<{ success: boolean }> {
    return firstValueFrom(
      this.http.delete<{ success: boolean }>(API_ENDPOINTS.FILES.DELETE || '/files/delete', { body: { path } })
    );
  }
}
