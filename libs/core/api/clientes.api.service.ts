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
  private cachedClients: Client[] = [];
  private lastBusinessId: string | null = null;

  async getListing(businessId: string, force = false): Promise<Client[]> {
    if (!force && businessId === this.lastBusinessId && this.cachedClients.length > 0) {
      return this.cachedClients;
    }

    const params = new HttpParams().set('businessId', businessId);
    const res = await firstValueFrom(this.http.get<{ items: Client[] }>(API_ENDPOINTS.CUSTOMERS.LIST, { params }));
    
    this.cachedClients = res.items || [];
    this.lastBusinessId = businessId;
    return this.cachedClients;
  }

  async create(businessId: string, data: Partial<Client>): Promise<Client> {
    const created = await firstValueFrom(this.http.post<Client>(API_ENDPOINTS.CUSTOMERS.LIST, { ...data, businessId }));
    this.lastBusinessId = null; // Invalidate
    return created;
  }

  async update(id: string, data: Partial<Client>): Promise<Client> {
    return firstValueFrom(this.http.patch<Client>(API_ENDPOINTS.CUSTOMERS.ONE(id), data));
  }
}
