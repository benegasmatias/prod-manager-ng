import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Negocio, UserProfile, Notification, DashboardSummary } from '../../shared/models';
import { environment } from '../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const url = `${this.API_URL}${path.startsWith('/') ? path : `/${path}`}`;
    
    // El interceptor se encargará de añadir el token de autorización automáticamente
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
    getAll: () => this.request<any[]>('GET', '/businesses'),
    getOne: (id: string) => this.request<any>('GET', `/businesses/${id}`),
    getDashboardSummary: (id: string) => this.request<DashboardSummary>('GET', `/businesses/${id}/dashboard-summary`),
    create: (data: any) => this.request<any>('POST', '/businesses', data),
    update: (id: string, data: any) => this.request<any>('PUT', `/businesses/${id}`, data),
    delete: (id: string) => this.request<any>('DELETE', `/businesses/${id}`),
  };

  users = {
    getMe: () => this.request<UserProfile>('GET', '/me'),
    setDefaultBusiness: (id: string) => this.request<any>('PUT', '/me/default-business', { businessId: id })
  };

  notifications = {
    getAll: (businessId?: string) => this.request<Notification[]>(
      'GET', 
      `/notifications${businessId ? `?businessId=${businessId}` : ''}`
    ),
    markAsRead: (id: string) => this.request<any>('PATCH', `/notifications/${id}/read`),
    markAllAsRead: (businessId?: string) => this.request<any>('PATCH', '/notifications/read-all', { businessId }),
    remove: (id: string) => this.request<any>('DELETE', `/notifications/${id}`),
    removeAll: (businessId?: string) => this.request<any>('DELETE', '/notifications/all', { businessId }),
  };
}
