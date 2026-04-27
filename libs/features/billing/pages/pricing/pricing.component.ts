import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '@core/session/session.service';
import { BillingService } from '@core/api/billing.service';
import { BillingApiService } from '@core/api/billing.api.service';
import { LayoutService } from '@core/layout/layout.service';
import { LucideAngularModule, Zap, Check, Minus, Info, CreditCard, Globe, ArrowRight, Shield, Rocket, Factory, Scissors } from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';

import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, ButtonSpinnerComponent, LucideAngularModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit, OnDestroy {
  billing: BillingService = inject(BillingService);
  private api = inject(BillingApiService);
  private session = inject(SessionService);
  private router = inject(Router);
  layout = inject(LayoutService);

  cn = cn;
  activeTab = 'Profesional';
  
  selectedCategory = signal<string>('IMPRESION_3D');
  plans = signal<any[]>([]);
  isLoadingPlans = signal<boolean>(false);

  comparisonFeatures = computed(() => {
    const list = this.plans();
    const free = list.find(p => p.sortOrder === 0);
    const pro = list.find(p => p.sortOrder === 1);
    const enterprise = list.find(p => p.sortOrder === 2);

    return [
        { 
            name: 'Máquinas conectadas', 
            free: free?.maxMachines || '2', 
            pro: pro?.maxMachines === 0 ? 'Ilimitadas' : (pro?.maxMachines || 'Ilimitadas'), 
            enterprise: enterprise?.maxMachines === 0 ? 'Ilimitadas' : (enterprise?.maxMachines || 'Ilimitadas') 
        },
        { 
            name: 'Colaboradores', 
            free: free?.maxUsers ? `Hasta ${free.maxUsers}` : 'Hasta 1', 
            pro: pro?.maxUsers === 0 ? 'Ilimitados' : `Hasta ${pro?.maxUsers || 3}`, 
            enterprise: enterprise?.maxUsers === 0 ? 'Ilimitados' : (enterprise?.maxUsers || 10) 
        },
        { name: 'Gestión de Materiales', free: free?.metadata?.gestionMateriales || 'Básica', pro: pro?.metadata?.gestionMateriales || 'Avanzada', enterprise: enterprise?.metadata?.gestionMateriales || 'Avanzada' },
        { name: 'Trazabilidad de Fallas', free: !!free?.metadata?.trazabilidadFallas, pro: !!pro?.metadata?.trazabilidadFallas, enterprise: !!enterprise?.metadata?.trazabilidadFallas },
        { name: 'Reportes de Eficiencia', free: !!free?.metadata?.reportesEficiencia, pro: !!pro?.metadata?.reportesEficiencia, enterprise: !!enterprise?.metadata?.reportesEficiencia },
        { name: 'API & Webhooks', free: !!free?.metadata?.apiWebhooks, pro: !!pro?.metadata?.apiWebhooks, enterprise: !!enterprise?.metadata?.apiWebhooks },
        { name: 'Soporte 24/7', free: free?.metadata?.soporte || 'Comunidad', pro: pro?.metadata?.soporte || 'Prioritario', enterprise: enterprise?.metadata?.soporte || 'Dedicado' },
    ];
  });

  readonly icons = { Zap, Check, Minus, Info, CreditCard, Globe, ArrowRight, Shield, Rocket, Factory, Scissors };

  async ngOnInit() {
    this.billing.loadSubscription().catch(console.error);
    this.layout.showBackButton.set(true);
    this.layout.backAction.set(() => {
      this.router.navigate(['/ajustes']);
    });
    
    // Auto-detectar rubro del negocio actual
    const business = this.session.activeNegocio();
    if (business?.category) {
      this.selectedCategory.set(business.category);
    }

    await this.loadPlans();
  }

  async loadPlans() {
    this.isLoadingPlans.set(true);
    try {
      const data = await this.api.getPlans(this.selectedCategory());
      this.plans.set(data);
    } catch (e) {
      console.error('Error loading plans:', e);
    } finally {
      this.isLoadingPlans.set(false);
    }
  }

  ngOnDestroy() {
    this.layout.backAction.set(null);
  }

  async onSelectPlan(plan: any) {
    if (plan.id === this.billing.planId()) return;
    
    if (plan.id === 'business-3d') {
      window.open('https://wa.me/5491112345678', '_blank');
      return;
    }

    try {
      this.router.navigate(['/billing/checkout'], { 
        queryParams: { plan: plan.id } 
      });
    } catch (e) {
      console.error('Checkout error:', e);
    }
  }
}
