import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ENDPOINTS } from '@shared/config/api-endpoints.config';
import { Employee } from '@shared/models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PersonalApiService {
  private http = inject(HttpClient);
  private cache = new Map<string, Employee[]>();

  async getAll(businessId: string, activeOnly = false): Promise<Employee[]> {
    const cacheKey = `${businessId}_${activeOnly}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let params = new HttpParams().set('businessId', businessId);
    if (activeOnly) {
      params = params.set('active', 'true');
    }
    
    const data = await firstValueFrom(
      this.http.get<Employee[]>(API_ENDPOINTS.EMPLOYEES.LIST, { params })
    );

    this.cache.set(cacheKey, data);
    setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000); // 5 min cache
    
    return data;
  }

  async create(businessId: string, data: Partial<Employee>): Promise<Employee> {
    this.cache.clear(); // Invalidate all employee results
    return firstValueFrom(
      this.http.post<Employee>(API_ENDPOINTS.EMPLOYEES.CREATE, { ...data, businessId })
    );
  }

  async update(id: string, businessId: string, data: Partial<Employee>): Promise<Employee> {
    this.cache.clear();
    return firstValueFrom(
      this.http.patch<Employee>(API_ENDPOINTS.EMPLOYEES.UPDATE(id), data, { params: { businessId } })
    );
  }

  async remove(id: string, businessId: string): Promise<void> {
    this.cache.clear();
    await firstValueFrom(
      this.http.delete<void>(API_ENDPOINTS.EMPLOYEES.REMOVE(id), { params: { businessId } })
    );
  }
}
