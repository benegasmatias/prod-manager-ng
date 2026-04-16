import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../src/environments/environment';
import { PlatformMetadata } from '../../../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class PlatformAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  // Global cache for metadata
  private _metadata = signal<PlatformMetadata | null>(null);
  metadata = this._metadata.asReadonly();

  async ensureMetadataLoaded(): Promise<PlatformMetadata> {
    if (this._metadata()) return this._metadata()!;
    const data = await this.getMetadata();
    this._metadata.set(data);
    return data;
  }

  async getUsers(
    page: number = 1, 
    limit: number = 10, 
    filters?: { search?: string, status?: string, plan?: string }
  ): Promise<{ items: any[], meta: any }> {
    return firstValueFrom(this.http.get<{ items: any[], meta: any }>(`${this.apiUrl}/users`, {
      params: { 
        page: page.toString(), 
        limit: limit.toString(),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.plan && { plan: filters.plan })
      }
    }));
  }

  async getUserDetail(id: string): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/users/${id}`));
  }

  async getUserLogs(id: string): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/users/${id}/logs`));
  }

  async approveUser(id: string): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiUrl}/users/${id}/approve`, {}));
  }

  async blockUser(id: string): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiUrl}/users/${id}/block`, {}));
  }

  async unblockUser(id: string): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiUrl}/users/${id}/unblock`, {}));
  }

  async suspendUser(id: string): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiUrl}/users/${id}/suspend`, {}));
  }

  async reactivateUser(id: string): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiUrl}/users/${id}/reactivate`, {}));
  }

  async deleteUser(id: string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.apiUrl}/users/${id}`));
  }

  async updateUser(id: string, data: any): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiUrl}/users/${id}`, data));
  }

  // Invitaciones
  async getInvitations(
    page: number = 1, 
    limit: number = 10, 
    filters?: { search?: string, status?: string }
  ): Promise<{ items: any[], meta: any }> {
    return firstValueFrom(this.http.get<{ items: any[], meta: any }>(`${this.apiUrl}/invitations`, {
      params: { 
        page: page.toString(), 
        limit: limit.toString(),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.status && { status: filters.status })
      }
    }));
  }

  async resendInvitation(id: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiUrl}/invitations/${id}/resend`, {}));
  }

  async cancelInvitation(id: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiUrl}/invitations/${id}/cancel`, {}));
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

  async getStats(): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/stats`));
  }

  async getMetadata(): Promise<PlatformMetadata> {
    return firstValueFrom(this.http.get<PlatformMetadata>(`${this.apiUrl}/config/metadata`));
  }
  
  async updateBusinessSubscription(id: string, planId: string, expiresAt: Date): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiUrl}/businesses/${id}/subscription`, { planId, expiresAt }));
  }
}
