import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ENDPOINTS } from '@shared/config/api-endpoints.config';
import { Employee } from '@shared/models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PersonalApiService {
  private http = inject(HttpClient);

  async getAll(businessId: string, activeOnly = false): Promise<Employee[]> {
    let params = new HttpParams().set('businessId', businessId);
    if (activeOnly) {
      params = params.set('active', 'true');
    }
    return firstValueFrom(
      this.http.get<Employee[]>(API_ENDPOINTS.EMPLOYEES.LIST, { params })
    );
  }

  async create(businessId: string, data: Partial<Employee>): Promise<Employee> {
    return firstValueFrom(
      this.http.post<Employee>(API_ENDPOINTS.EMPLOYEES.CREATE, { ...data, businessId })
    );
  }

  async update(id: string, businessId: string, data: Partial<Employee>): Promise<Employee> {
    return firstValueFrom(
      this.http.patch<Employee>(API_ENDPOINTS.EMPLOYEES.UPDATE(id), data, { params: { businessId } })
    );
  }

  async remove(id: string, businessId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(API_ENDPOINTS.EMPLOYEES.REMOVE(id), { params: { businessId } })
    );
  }
}
