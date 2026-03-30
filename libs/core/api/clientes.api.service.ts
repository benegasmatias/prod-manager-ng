import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Client } from '../../shared/models';
import { environment } from '../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientesApiService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  async getListing(businessId: string): Promise<Client[]> {
    const params = new HttpParams().set('businessId', businessId);
    return firstValueFrom(this.http.get<Client[]>(`${this.API_URL}/clients`, { params }));
  }

  async create(businessId: string, data: Partial<Client>): Promise<Client> {
    return firstValueFrom(this.http.post<Client>(`${this.API_URL}/clients`, { ...data, businessId }));
  }

  async update(id: string, data: Partial<Client>): Promise<Client> {
    return firstValueFrom(this.http.patch<Client>(`${this.API_URL}/clients/${id}`, data));
  }
}
