import { Injectable, inject, signal, computed } from '@angular/core';
import { PersonalApiService } from './personal.api.service';
import { SessionService } from '../session/session.service';
import { Employee } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class PersonalService {
  private api = inject(PersonalApiService);
  private session = inject(SessionService);

  loading = signal(false);
  saving = signal(false);
  items = signal<Employee[]>([]);
  loadedBusinessId = signal<string | null>(null);

  stats = computed(() => {
    const employees = this.items();
    return {
      total: employees.length,
      active: employees.filter(e => e.active).length,
      specialties: new Set(employees.map(e => e.specialties).filter(Boolean)).size
    };
  });

  async loadPersonal(force = false) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;
    if (!force && this.loadedBusinessId() === businessId) return;

    this.loading.set(true);
    try {
      const data = await this.api.getAll(businessId);
      this.items.set(data || []);
      this.loadedBusinessId.set(businessId);
    } catch (e) {
      console.error('Error loadPersonal:', e);
    } finally {
      this.loading.set(false);
    }
  }

  async saveEmployee(data: Partial<Employee>, id?: string) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    this.saving.set(true);
    try {
      if (id) {
        await this.api.update(id, businessId, data);
      } else {
        await this.api.create(businessId, data);
      }
      await this.loadPersonal(true);
    } finally {
      this.saving.set(false);
    }
  }

  async toggleStatus(employee: Employee) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    this.saving.set(true);
    try {
      await this.api.update(employee.id, businessId, { active: !employee.active });
      await this.loadPersonal(true);
    } finally {
      this.saving.set(false);
    }
  }

  async removeEmployee(id: string) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    this.saving.set(true);
    try {
      await this.api.remove(id, businessId);
      await this.loadPersonal(true);
    } finally {
      this.saving.set(false);
    }
  }
}
