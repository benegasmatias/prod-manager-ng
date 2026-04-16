import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Material } from '@shared/models';
import { API_ENDPOINTS } from '@shared/config/api-endpoints.config';

@Injectable({
  providedIn: 'root'
})
export class MaterialesApiService {
  private http = inject(HttpClient);
  async getAll(businessId: string): Promise<Material[]> {
    const params = new HttpParams().set('businessId', businessId);
    return firstValueFrom(this.http.get<Material[]>(API_ENDPOINTS.MATERIALS.LIST, { params }));
  }

  async create(data: Partial<Material>): Promise<Material> {
    return firstValueFrom(this.http.post<Material>(API_ENDPOINTS.MATERIALS.LIST, data));
  }

  async update(id: string, data: Partial<Material>): Promise<Material> {
    return firstValueFrom(this.http.patch<Material>(API_ENDPOINTS.MATERIALS.ONE(id), data));
  }

  async remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(API_ENDPOINTS.MATERIALS.ONE(id)));
  }
}
