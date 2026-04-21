import { Injectable, inject, signal, computed } from '@angular/core';
import { CalibrationsApiService } from './calibrations.api.service';
import { SessionService } from '../session/session.service';
import { Calibration, CreateCalibrationDto } from '@shared/models/calibration';

@Injectable({ providedIn: 'root' })
export class CalibrationsService {
  private api = inject(CalibrationsApiService);
  private session = inject(SessionService);

  loading = signal(false);
  saving = signal(false);
  items = signal<Calibration[]>([]);

  async loadCalibrations(machineId?: string, materialId?: string) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    this.loading.set(true);
    try {
      const res = await this.api.getAll(businessId, machineId, materialId);
      this.items.set(res || []);
    } catch (e) {
      console.error('Error loadCalibrations:', e);
    } finally {
      this.loading.set(false);
    }
  }

  async create(data: CreateCalibrationDto) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    this.saving.set(true);
    try {
      await this.api.create(data, businessId);
      await this.loadCalibrations(data.machineId);
    } finally {
      this.saving.set(false);
    }
  }

  async remove(id: string, machineId?: string) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    this.saving.set(true);
    try {
      await this.api.remove(id, businessId);
      await this.loadCalibrations(machineId);
    } finally {
      this.saving.set(false);
    }
  }
}
