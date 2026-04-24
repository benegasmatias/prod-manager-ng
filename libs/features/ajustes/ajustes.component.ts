import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Landmark, Globe, Save, Trash2, Mail, Phone, Zap, CreditCard, ChevronRight, Edit3, Info, AlertOctagon, ArrowRight } from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui';
import { SessionService } from '../../core/session/session.service';
import { ApiService } from '../../core/api/api.service';
import { ConfirmService } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../shared/services/toast.service';
import { PlanSelectorModalComponent } from './components/plan-selector/plan-selector.component';
import { PageShellComponent } from '../../shared/ui/layout/page-shell.component';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PlanSelectorModalComponent, ButtonSpinnerComponent, PageShellComponent],
  templateUrl: './ajustes.component.html'
})
export class AjustesComponent {
  public sessionService = inject(SessionService);
  private confirmService = inject(ConfirmService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private api = inject(ApiService);
  
  // Use a computed signal for the active business to ensure reactivity
  negocioActivo = computed(() => this.sessionService.activeNegocio());
  
  // Local state for editing
  nombre = signal('');
  moneda = signal('ARS');
  phone = signal('');
  email = signal('');
  saving = signal(false);
  showPricingModal = signal(false);
  currentPlanLimits = signal<any>(null);
  
  // Computed helpers for template
  currentPlanName = computed(() => {
    return this.currentPlanLimits()?.name || 
           this.sessionService.activeSubscription()?.planName || 
           'FREE CORE';
  });

  goToBilling() {
    this.handleUpgrade();
  }

  readonly icons = {
    Landmark, Globe, Save, Trash2, Mail, Phone, Zap, CreditCard, ChevronRight, Edit3, Info, AlertOctagon, ArrowRight
  };

  readonly currencies = [
    { code: 'ARS', label: 'Pesos Argentinos', symbol: '$' },
    { code: 'USD', label: 'Dólares Estadounidenses', symbol: 'US$', disabled: true },
    { code: 'EUR', label: 'Euros', symbol: '€', disabled: true },
    { code: 'CLP', label: 'Pesos Chilenos', symbol: 'CLP$', disabled: true },
    { code: 'UYU', label: 'Pesos Uruguayos', symbol: '$U', disabled: true },
  ];

  constructor() {
    // Sync local state when the active business changes
    effect(() => {
      const active = this.negocioActivo();
      if (active) {
        this.nombre.set(active.nombre);
        this.moneda.set(active.moneda || 'ARS');
        this.phone.set(active.phone || '');
        this.email.set(active.email || '');
      }
    });

    // Dedicated effect to react to plan changes
    effect(() => {
      const sub = this.sessionService.activeSubscription();
      const active = this.negocioActivo();
      const planId = sub?.planId || active?.plan;
      
      if (planId) {
        this.loadPlanDetails(planId);
      }
    }, { allowSignalWrites: true });

    // Handle modal closing from child
    (window as any).closePricingModal = () => {
      this.showPricingModal.set(false);
    };
  }

  handleUpgrade() {
    this.router.navigate(['/billing']);
  }

  async loadPlanDetails(planId: string) {
    try {
      const active = this.negocioActivo();
      // Try to get all plans to find the right one (more robust than filtering by category)
      const plans = await this.api.businesses.billing.getPlans();
      const current = plans.find((p: any) => 
        p.id === planId || 
        p.id === planId.toLowerCase()
      );
      
      if (current) {
        this.currentPlanLimits.set(current);
      } else if (plans.length > 0) {
        // Fallback to first plan if exact match fails (usually FREE)
        this.currentPlanLimits.set(plans[0]);
      }
    } catch (error) {
      console.error('Error loading plan details:', error);
    }
  }

  async handleSave() {
    const active = this.negocioActivo();
    if (!active) return;

    this.saving.set(true);
    try {
      await this.sessionService.updateNegocio(active.id, {
        name: this.nombre(),
        currency: this.moneda(),
        phone: this.phone(),
        email: this.email()
      });
      this.toast.success('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      this.toast.error('Error al guardar la configuración');
    } finally {
      this.saving.set(false);
    }
  }

  async handleDelete() {
    const active = this.negocioActivo();
    if (!active) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Negocio',
      message: `¿Estás seguro de que deseas eliminar "${active.nombre}"? Esta acción es definitiva y borrará todos los datos asociados.`,
      confirmLabel: 'Eliminar Negocio',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await this.sessionService.removeNegocio(active.id);
        this.router.navigate(['/select-business']);
      } catch (error) {
        console.error('Error deleting business:', error);
      }
    }
  }
}
