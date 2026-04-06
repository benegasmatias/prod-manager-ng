import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ProductionJob, ProductionJobStatus, ProductionJobPriority } from '../../shared/models/production-job';
import { API_ENDPOINTS } from '@shared/config/api-endpoints.config';

@Injectable({
  providedIn: 'root'
})
export class ProductionApiService {
  private http = inject(HttpClient);

  async getJobs(params: { 
    businessId: string;
    status?: ProductionJobStatus;
    priority?: ProductionJobPriority;
    machineId?: string;
    operatorId?: string;
    orderId?: string;
  }): Promise<ProductionJob[]> {
    let httpParams = new HttpParams().set('businessId', params.businessId);
    
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.priority) httpParams = httpParams.set('priority', params.priority);
    if (params.machineId) httpParams = httpParams.set('machineId', params.machineId);
    if (params.operatorId) httpParams = httpParams.set('operatorId', params.operatorId);
    if (params.orderId) httpParams = httpParams.set('orderId', params.orderId);

    return firstValueFrom(this.http.get<ProductionJob[]>(API_ENDPOINTS.PRODUCTION.LIST, { params: httpParams }));
  }

  async getJob(id: string): Promise<ProductionJob> {
    return firstValueFrom(this.http.get<ProductionJob>(API_ENDPOINTS.PRODUCTION.ONE(id)));
  }

  async updateStatus(id: string, status: ProductionJobStatus): Promise<ProductionJob> {
    return firstValueFrom(this.http.patch<ProductionJob>(API_ENDPOINTS.PRODUCTION.STATUS(id), { status }));
  }

  async assignResources(id: string, resources: { operatorId?: string, machineId?: string }): Promise<ProductionJob> {
    return firstValueFrom(this.http.patch<ProductionJob>(API_ENDPOINTS.PRODUCTION.RESOURCES(id), resources));
  }

  async updatePriority(id: string, priority: ProductionJobPriority): Promise<ProductionJob> {
    return firstValueFrom(this.http.patch<ProductionJob>(API_ENDPOINTS.PRODUCTION.PRIORITY(id), { priority }));
  }

  async updateStage(id: string, stage: string): Promise<ProductionJob> {
    return firstValueFrom(this.http.patch<ProductionJob>(API_ENDPOINTS.PRODUCTION.STAGE(id), { stage }));
  }

  async assignMaterial(businessId: string, jobId: string, data: { materialId: string, quantity: number }): Promise<ProductionJob> {
    const url = `${this.baseUrl}/${businessId}/production-jobs/${jobId}/materials`;
    return lastValueFrom(this.http.post<ProductionJob>(url, data));
  }
}
