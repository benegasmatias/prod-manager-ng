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

  private async request<T>(method: string, url: string, body?: any, context?: any): Promise<T> {
    const request$ = this.http.request<T>(method, url, {
      body,
      context,
      headers: { 'Content-Type': 'application/json' }
    });

    try {
      return await firstValueFrom(request$);
    } catch (error: any) {
      console.error(`[ApiService] Error in ${method} ${url}:`, error);
      throw error;
    }
  }

  get<T>(url: string): Promise<T> {
    return this.request<T>('GET', url);
  }

  post<T>(url: string, body: any): Promise<T> {
    return this.request<T>('POST', url, body);
  }

  put<T>(url: string, body: any): Promise<T> {
    return this.request<T>('PUT', url, body);
  }

  delete<T>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  }

  businesses = {
    getAll: () => this.request<any[]>('GET', API_ENDPOINTS.BUSINESSES.LIST),
    getTemplates: () => this.request<any[]>('GET', API_ENDPOINTS.BUSINESSES.TEMPLATES),
    getOne: (id: string) => this.request<any>('GET', API_ENDPOINTS.BUSINESSES.ONE(id)),
    getConfig: (id: string) => this.request<any>('GET', API_ENDPOINTS.BUSINESSES.CONFIG(id)),
    getDashboardSummary: (id: string, context?: any) => this.request<DashboardSummary>('GET', API_ENDPOINTS.BUSINESSES.DASHBOARD(id), null, context),
    getPlanUsage: (id: string) => this.request<import('@shared/models').PlanUsage>('GET', API_ENDPOINTS.BUSINESSES.PLAN_USAGE(id)),
    create: (data: any) => this.request<any>('POST', API_ENDPOINTS.BUSINESSES.LIST, data),
    activate: (id: string) => this.request<any>('POST', `${API_ENDPOINTS.BUSINESSES.LIST}/${id}/activate`),
    update: (id: string, data: any) => this.request<any>('PATCH', API_ENDPOINTS.BUSINESSES.ONE(id), data),
    delete: (id: string) => this.request<any>('DELETE', API_ENDPOINTS.BUSINESSES.ONE(id)),
    billing: {
      getPlans: (category?: string) => this.request<any[]>('GET', `/admin/plans${category ? '?category=' + category : ''}`),
      preflight: (id: string, plan: string) => this.request<any>('GET', `/businesses/${id}/subscription/preflight?plan=${plan}`),
      changePlan: (id: string, plan: string) => this.request<any>('PATCH', `/businesses/${id}/subscription/plan`, { plan }),
    }
  };

  users = {
    getMe: () => this.request<UserProfile>('GET', API_ENDPOINTS.USERS.ME),
    setDefaultBusiness: (id: string) => this.request<any>('PUT', API_ENDPOINTS.USERS.SET_DEFAULT_BUSINESS, { businessId: id }),
    acceptTerms: () => this.request<any>('POST', '/me/accept-terms')
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
