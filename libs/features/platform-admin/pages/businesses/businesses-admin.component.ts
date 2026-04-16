import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';

import { BusinessPlanModalComponent } from './components/plan-modal/plan-modal.component';

@Component({
  selector: 'app-businesses-admin',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BusinessPlanModalComponent],
  templateUrl: './businesses-admin.component.html',
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessesAdminComponent implements OnInit {
  private adminService = inject(PlatformAdminService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);
  
  businesses = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedBusinessForPlan = signal<any | null>(null);

  ngOnInit() {
    this.loadBusinesses();
  }

  async loadBusinesses() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await this.adminService.getBusinesses();
      this.businesses.set(data || []);
    } catch (e: any) {
      this.error.set(e.message || 'Error al conectar con el servidor');
    } finally {
      this.loading.set(false);
    }
  }

  async updateStatus(business: any, newStatus: string) {
    const action = newStatus === 'ACTIVE' ? 'REACTIVAR' : 'SUSPENDER';
    const confirmed = await this.confirmService.confirm({
      title: `${action} NEGOCIO`,
      message: `¿Estás seguro de que quieres ${action.toLowerCase()} el negocio "${business.name}"?`,
      type: newStatus === 'ACTIVE' ? 'warning' : 'danger',
      confirmLabel: action,
      cancelLabel: 'Volver'
    });

    if (!confirmed) return;
    
    try {
      await this.adminService.updateBusinessStatus(business.id, newStatus);
      const msg = newStatus === 'ACTIVE' ? 'reactivado' : 'suspendido';
      this.toast.success(`El negocio "${business.name}" fue ${msg} correctamente`);
      this.loadBusinesses();
    } catch (e: any) {
      this.toast.error('Error al actualizar estado del negocio');
    }
  }

  configurePlan(business: any) {
    this.selectedBusinessForPlan.set(business);
  }
}
