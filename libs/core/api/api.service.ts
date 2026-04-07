import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserProfile, Notification, DashboardSummary } from '@shared/models';
import { API_ENDPOINTS } from '@shared/config/api-endpoints.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  private async request<T>(method: string, url: string, body?: any): Promise<T> {
    const request$ = this.http.request<T>(method, url, {
      body,
      headers: { 'Content-Type': 'application/json' }
    });

    try {
      return await firstValueFrom(request$);
    } catch (error: any) {
      console.error(`[ApiService] Error in ${method} ${url}:`, error);
      throw error;
    }
  }

  businesses = {
    getAll: () => this.request<any[]>('GET', API_ENDPOINTS.BUSINESSES.LIST),
    getTemplates: () => this.request<any[]>('GET', API_ENDPOINTS.BUSINESSES.TEMPLATES),
    getOne: (id: string) => this.request<any>('GET', API_ENDPOINTS.BUSINESSES.ONE(id)),
    getDashboardSummary: (id: string) => this.request<DashboardSummary>('GET', API_ENDPOINTS.BUSINESSES.DASHBOARD(id)),
    create: (data: any) => this.request<any>('POST', API_ENDPOINTS.BUSINESSES.LIST, data),
    update: (id: string, data: any) => this.request<any>('PATCH', API_ENDPOINTS.BUSINESSES.ONE(id), data),
    delete: (id: string) => this.request<any>('DELETE', API_ENDPOINTS.BUSINESSES.ONE(id)),
  };

  users = {
    getMe: () => this.request<UserProfile>('GET', API_ENDPOINTS.USERS.ME),
    setDefaultBusiness: (id: string) => this.request<any>('PUT', API_ENDPOINTS.USERS.SET_DEFAULT_BUSINESS, { businessId: id })
  };

  notifications = {
    getAll: (businessId?: string) => this.request<Notification[]>(
      'GET', 
      API_ENDPOINTS.NOTIFICATIONS.LIST(businessId)
    ),
    markAsRead: (id: string) => this.request<any>('PATCH', API_ENDPOINTS.NOTIFICATIONS.READ(id)),
    markAllAsRead: (businessId?: string) => this.request<any>('PATCH', API_ENDPOINTS.NOTIFICATIONS.READ_ALL, { businessId }),
    remove: (id: string) => this.request<any>('DELETE', API_ENDPOINTS.NOTIFICATIONS.REMOVE(id)),
    removeAll: (businessId?: string) => this.request<any>('DELETE', API_ENDPOINTS.NOTIFICATIONS.REMOVE_ALL, { businessId }),
  };
}
