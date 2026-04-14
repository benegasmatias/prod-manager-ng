import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlatformAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  async getUsers(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/users`));
  }

  async approveUser(id: string): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiUrl}/users/${id}/approve`, {}));
  }

  async blockUser(id: string): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiUrl}/users/${id}/block`, {}));
  }

  async getBusinesses(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/businesses`));
  }

  async updateBusinessStatus(id: string, status: string): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiUrl}/businesses/${id}/status`, { status }));
  }

  async getPlans(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/plans`));
  }
}
