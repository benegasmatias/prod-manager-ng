import { Injectable, inject, signal, computed } from '@angular/core';
import { MaterialesApiService } from './materiales.api.service';
import { SessionService } from '../session/session.service';
import { Material } from '../../shared/models/material';

@Injectable({ providedIn: 'root' })
export class MaterialesService {
  private api = inject(MaterialesApiService);
  private session = inject(SessionService);

  loading = signal(false);
  saving = signal(false);
  items = signal<Material[]>([]);
  loadedBusinessId = signal<string | null>(null);

  stats = computed(() => {
    const materials = this.items();
    return {
      count: materials.length,
      critical: materials.filter(m => (m.remainingWeightGrams / m.totalWeightGrams) < 0.2).length,
      estimatedValue: materials.reduce((acc, m) => acc + (m.remainingWeightGrams * (m.costPerKg / 1000)), 0)
    };
  });

  async loadMateriales(force = false) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;
    if (!force && this.loadedBusinessId() === businessId) return;

    this.loading.set(true);
    try {
      const data = await this.api.getAll(businessId);
      this.items.set(data || []);
      this.loadedBusinessId.set(businessId);
    } catch (e) {
      console.error('Error loadMateriales:', e);
    } finally {
      this.loading.set(false);
    }
  }

  async createMaterial(data: Partial<Material>) {
    this.saving.set(true);
    try {
      const res = await this.api.create(data);
      this.items.update(list => [...list, res]);
      return res;
    } finally {
      this.saving.set(false);
    }
  }

  async updateMaterial(id: string, data: Partial<Material>) {
    this.saving.set(true);
    try {
      const res = await this.api.update(id, data);
      this.items.update(list => list.map(m => m.id === id ? res : m));
      return res;
    } finally {
      this.saving.set(false);
    }
  }

  async deleteMaterial(id: string) {
    try {
      await this.api.remove(id);
      this.items.update(list => list.filter(m => m.id !== id));
    } catch (e) {
      console.error('Error deleteMaterial:', e);
      throw e;
    }
  }
}
