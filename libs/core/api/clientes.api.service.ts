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
  async getListing(businessId: string, context?: any): Promise<Client[]> {
    const params = new HttpParams().set('businessId', businessId);
    const res = await firstValueFrom(this.http.get<{ items: Client[] }>(API_ENDPOINTS.CUSTOMERS.LIST, { params, context }));
    return res.items || [];
  }

  async create(businessId: string, data: Partial<Client>): Promise<Client> {
    return firstValueFrom(this.http.post<Client>(API_ENDPOINTS.CUSTOMERS.LIST, { ...data, businessId }));
  }

  async update(id: string, data: Partial<Client>): Promise<Client> {
    return firstValueFrom(this.http.patch<Client>(API_ENDPOINTS.CUSTOMERS.ONE(id), data));
  }
}
