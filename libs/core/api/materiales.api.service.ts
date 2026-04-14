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
  private cache = new Map<string, Material[]>();

  async getAll(businessId: string): Promise<Material[]> {
    if (this.cache.has(businessId)) {
      return this.cache.get(businessId)!;
    }

    const params = new HttpParams().set('businessId', businessId);
    const data = await firstValueFrom(this.http.get<Material[]>(API_ENDPOINTS.MATERIALS.LIST, { params }));
    
    this.cache.set(businessId, data);
    setTimeout(() => this.cache.delete(businessId), 5 * 60 * 1000);
    return data;
  }

  async create(data: Partial<Material>): Promise<Material> {
    this.cache.clear();
    return firstValueFrom(this.http.post<Material>(API_ENDPOINTS.MATERIALS.LIST, data));
  }

  async update(id: string, data: Partial<Material>): Promise<Material> {
    this.cache.clear();
    return firstValueFrom(this.http.patch<Material>(API_ENDPOINTS.MATERIALS.ONE(id), data));
  }

  async remove(id: string): Promise<void> {
    this.cache.clear();
    return firstValueFrom(this.http.delete<void>(API_ENDPOINTS.MATERIALS.ONE(id)));
  }
}
