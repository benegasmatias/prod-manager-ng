import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { LucideAngularModule, Building2, RefreshCw, ShieldAlert, Pause, DollarSign, Loader2, Mail } from 'lucide-angular';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ButtonSpinnerComponent } from '../../../../shared/ui/button-spinner/button-spinner.component';

import { BusinessPlanModalComponent } from './components/plan-modal/plan-modal.component';
import { AuditCapabilitiesModalComponent } from './components/audit-modal/audit-modal.component';

@Component({
  selector: 'app-businesses-admin',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    BusinessPlanModalComponent, 
    AuditCapabilitiesModalComponent,
    ButtonSpinnerComponent
  ],
  templateUrl: './businesses-admin.component.html',
  styleUrls: ['./businesses-admin.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessesAdminComponent implements OnInit {
  private adminService = inject(PlatformAdminService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  readonly icons = {
    Building2, RefreshCw, ShieldAlert, Pause, DollarSign, Loader2, Mail
  };

  constructor() {
    LucideAngularModule.pick(this.icons);
  }
  
  businesses = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedBusinessForPlan = signal<any | null>(null);
  showAuditModal = signal<boolean>(false);

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

  fixAllCapabilities() {
    this.showAuditModal.set(true);
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

  contactBusiness(business: any) {
    if (business.ownerEmail || (business.memberships && business.memberships[0]?.user?.email)) {
        const email = business.ownerEmail || business.memberships[0].user.email;
        window.open(`mailto:${email}?subject=ProdManager: Contacto Administrativo para ${business.name}`, '_blank');
    } else {
        this.toast.error('No se encontró un email de contacto para este negocio');
    }
  }
}
