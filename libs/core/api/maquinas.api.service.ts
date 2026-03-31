import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '@shared/config/api-endpoints.config';
import { Machine } from '@shared/models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MaquinasApiService {
  private http = inject(HttpClient);

  async getAll(businessId: string): Promise<Machine[]> {
    return firstValueFrom(
      this.http.get<Machine[]>(API_ENDPOINTS.MACHINES.LIST, { params: { businessId } })
    );
  }

  async getOne(id: string, businessId: string): Promise<Machine> {
    return firstValueFrom(
      this.http.get<Machine>(API_ENDPOINTS.MACHINES.ONE(id), { params: { businessId } })
    );
  }

  async create(data: Partial<Machine>): Promise<Machine> {
    return firstValueFrom(
      this.http.post<Machine>(API_ENDPOINTS.MACHINES.CREATE, data)
    );
  }

  async update(id: string, data: Partial<Machine>, businessId: string): Promise<Machine> {
    return firstValueFrom(
      this.http.patch<Machine>(API_ENDPOINTS.MACHINES.UPDATE(id), data, { params: { businessId } })
    );
  }

  async remove(id: string, businessId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(API_ENDPOINTS.MACHINES.REMOVE(id), { params: { businessId } })
    );
  }

  async assignOrder(machineId: string, orderId: string, materialId?: string, businessId?: string): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(API_ENDPOINTS.MACHINES.ASSIGN(machineId), { orderId, materialId, businessId })
    );
  }

  async release(machineId: string, businessId: string): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(API_ENDPOINTS.MACHINES.RELEASE(machineId), { businessId })
    );
  }
}
