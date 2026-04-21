import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '@shared/config/api-endpoints.config';
import { Calibration, CreateCalibrationDto } from '@shared/models/calibration';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CalibrationsApiService {
  private http = inject(HttpClient);

  async getAll(businessId: string, machineId?: string, materialId?: string, context?: any): Promise<Calibration[]> {
    const params: any = { businessId };
    if (machineId) params.machineId = machineId;
    if (materialId) params.materialId = materialId;

    return firstValueFrom(
      this.http.get<Calibration[]>(API_ENDPOINTS.CALIBRATIONS.LIST, { params, context })
    );
  }

  async getOne(id: string, businessId: string): Promise<Calibration> {
    return firstValueFrom(
      this.http.get<Calibration>(API_ENDPOINTS.CALIBRATIONS.ONE(id), { params: { businessId } })
    );
  }

  async create(data: CreateCalibrationDto, businessId: string): Promise<Calibration> {
    return firstValueFrom(
      this.http.post<Calibration>(API_ENDPOINTS.CALIBRATIONS.CREATE, data, { params: { businessId } })
    );
  }

  async update(id: string, data: Partial<Calibration>, businessId: string): Promise<Calibration> {
    return firstValueFrom(
      this.http.patch<Calibration>(API_ENDPOINTS.CALIBRATIONS.UPDATE(id), data, { params: { businessId } })
    );
  }

  async remove(id: string, businessId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(API_ENDPOINTS.CALIBRATIONS.REMOVE(id), { params: { businessId } })
    );
  }
}
