import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { PlatformAdminService } from '../../../../services/platform-admin.service';
import { ToastService } from '../../../../../../shared/services/toast.service';

@Component({
  selector: 'app-business-plan-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './plan-modal.component.html',
  styles: [`
    :host { display: block; }
  `]
})
export class BusinessPlanModalComponent implements OnInit {
  private adminService = inject(PlatformAdminService);
  private toast = inject(ToastService);

  @Input() business: any;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  plans = signal<any[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  selectedPlanId = signal<string>('');
  selectedMonths = signal<number>(1);

  ngOnInit() {
    this.selectedPlanId.set(this.business?.planId || 'free');
    this.loadPlans();
  }

  async loadPlans() {
    try {
      this.loading.set(true);
      const data = await this.adminService.getPlans();
      this.plans.set(data);
    } catch (e) {
      this.toast.error('Error al cargar planes');
    } finally {
      this.loading.set(false);
    }
  }

  async save() {
    if (!this.selectedPlanId()) return;
    
    try {
      this.saving.set(true);
      // Calculate expiry date: today + selected months
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + this.selectedMonths());
      
      await this.adminService.updateBusinessSubscription(
        this.business.id, 
        this.selectedPlanId(), 
        expiry
      );
      
      this.toast.success('Suscripción actualizada correctamente');
      this.updated.emit();
      this.close.emit();
    } catch (e) {
      this.toast.error('Error al actualizar suscripción');
    } finally {
      this.saving.set(false);
    }
  }
}
