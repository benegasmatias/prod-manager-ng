import { Injectable, inject, signal, computed } from '@angular/core';
import { MaquinasApiService } from './maquinas.api.service';
import { SessionService } from '../session/session.service';
import { Machine } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class MaquinasService {
  private api = inject(MaquinasApiService);
  private session = inject(SessionService);

  loading = signal(false);
  saving = signal(false);
  items = signal<Machine[]>([]);
  loadedBusinessId = signal<string | null>(null);

  stats = computed(() => {
    const machines = this.items();
    return {
      count: machines.length,
      idle: machines.filter(m => m.status === 'IDLE').length,
      working: machines.filter(m => m.status === 'WORKING').length,
    };
  });

  async loadMaquinas(force = false) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;
    if (!force && this.loadedBusinessId() === businessId) return;

    this.loading.set(true);
    try {
      const res = await this.api.getAll(businessId);
      this.items.set(res.data || []);
      this.loadedBusinessId.set(businessId);
    } catch (e) {
      console.error('Error loadMaquinas:', e);
    } finally {
      this.loading.set(false);
    }
  }

  async create(data: Partial<Machine>) {
    this.saving.set(true);
    try {
      await this.api.create(data);
      await this.loadMaquinas(true);
    } finally {
      this.saving.set(false);
    }
  }

  async update(id: string, data: Partial<Machine>) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    this.saving.set(true);
    try {
      await this.api.update(id, data, businessId);
      await this.loadMaquinas(true);
    } finally {
      this.saving.set(false);
    }
  }

  async remove(id: string) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    this.saving.set(true);
    try {
      await this.api.remove(id, businessId);
      await this.loadMaquinas(true);
    } finally {
      this.saving.set(false);
    }
  }

  async assignOrder(machineId: string, orderId: string, materialId?: string) {
    const businessId = this.session.activeNegocio()?.id;
    this.saving.set(true);
    try {
      await this.api.assignOrder(machineId, orderId, materialId, businessId);
      await this.loadMaquinas(true);
    } finally {
      this.saving.set(false);
    }
  }

  async release(machineId: string) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    this.saving.set(true);
    try {
      await this.api.release(machineId, businessId);
      await this.loadMaquinas(true);
    } finally {
      this.saving.set(false);
    }
  }
  
  async getOne(id: string) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return null;
    return this.api.getOne(id, businessId);
  }
}
