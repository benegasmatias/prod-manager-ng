import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Client } from '@shared/models';
import { API_ENDPOINTS } from '@shared/config/api-endpoints.config';

@Injectable({
  providedIn: 'root'
})
export class ClientesApiService {
  private http = inject(HttpClient);
  private cache = new Map<string, Client[]>();

  async getListing(businessId: string, context?: any): Promise<Client[]> {
    if (this.cache.has(businessId)) {
      return this.cache.get(businessId)!;
    }

    const params = new HttpParams().set('businessId', businessId);
    const res = await firstValueFrom(this.http.get<{ items: Client[] }>(API_ENDPOINTS.CUSTOMERS.LIST, { params, context }));
    const items = res.items || [];
    
    this.cache.set(businessId, items);
    setTimeout(() => this.cache.delete(businessId), 2 * 60 * 1000); // 2 min cache
    
    return items;
  }

  async create(businessId: string, data: Partial<Client>): Promise<Client> {
    this.cache.delete(businessId); // Invalidate cache
    return firstValueFrom(this.http.post<Client>(API_ENDPOINTS.CUSTOMERS.LIST, { ...data, businessId }));
  }

  async update(id: string, data: Partial<Client>): Promise<Client> {
    // We don't have businessId here easily to invalidate just one, 
    // but usually update is rare or followed by redirect.
    // For safety, clear all or wait for timeout.
    return firstValueFrom(this.http.patch<Client>(API_ENDPOINTS.CUSTOMERS.ONE(id), data));
  }
}
