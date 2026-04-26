import { Component, inject, signal, OnInit, computed, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { BillingService } from '@core/api/billing.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check, Zap, X, ShieldCheck, Star, Rocket, ChevronRight, Diamond, CheckCircle2, MessageCircle, HelpCircle, Sparkles, Lock } from 'lucide-angular';
import { ApiService } from '@core/api/api.service';
import { SessionService } from '@core/session/session.service';
import { ToastService } from '@shared/services/toast.service';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-plan-selector',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, LoadingSpinnerComponent],
  templateUrl: './plan-selector.component.html'
})
export class PlanSelectorModalComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private session = inject(SessionService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  plans = signal<any[]>([]);
  loading = signal(true);
  selecting = signal<string | null>(null);

  readonly icons: any = { 
    Check, Zap, X, ShieldCheck, Star, Rocket, ChevronRight, Diamond, CheckCircle2, MessageCircle, HelpCircle, Sparkles, Lock
  };

  @HostListener('document:keydown.escape')
  onKeydownHandler() {
    this.close();
  }

  // Dynamic comparison table derived from loaded plans
  dynamicFeatures = computed(() => {
    const all = this.plans();
    if (all.length === 0) return [];

    const free = all.find(p => p.id.includes('free'));
    const pro = all.find(p => p.id.includes('pro'));
    const biz = all.find(p => p.id.includes('business'));

    const formatVal = (v: number) => v === 0 ? 'Ilimitado' : v.toString();

    return [
      { 
        name: 'Usuarios / Equipo', 
        free: free ? formatVal(free.maxUsers) : '1', 
        pro: pro ? formatVal(pro.maxUsers) : '5', 
        biz: biz ? formatVal(biz.maxUsers) : 'Ilimitado' 
      },
      { 
        name: 'Máquinas en Granja', 
        free: free ? formatVal(free.maxMachines) : '1', 
        pro: pro ? formatVal(pro.maxMachines) : '2', 
        biz: biz ? formatVal(biz.maxMachines) : 'Ilimitadas' 
      },
      { 
        name: 'Pedidos Mensuales', 
        free: free ? formatVal(free.maxOrdersPerMonth) : '30', 
        pro: pro ? formatVal(pro.maxOrdersPerMonth) : '60', 
        biz: biz ? formatVal(biz.maxOrdersPerMonth) : 'Ilimitados' 
      },
      { 
        name: 'Control de Materiales', 
        free: false, 
        pro: true, 
        biz: true 
      },
      { 
        name: 'Informes Avanzados', 
        free: false, 
        pro: false, 
        biz: true 
      },
    ];
  });

  ngOnInit() {
    this.loadPlans();
  }

  async loadPlans() {
    this.loading.set(true);
    try {
      const active = this.session.activeNegocio();
      const category = active?.rubro || 'IMPRESION_3D';
      const allPlans = await this.api.businesses.billing.getPlans(category);
      this.plans.set(allPlans.sort((a: any, b: any) => a.price - b.price));
      this.loading.set(false);
      this.cdr.detectChanges(); 
    } catch (error) {
       this.toast.error('Error al cargar planes');
    }
  }

  isCurrentPlan(planId: string): boolean {
    const currentId = (this.session.activeSubscription()?.planId || '').toLowerCase();
    const targetId = planId.toLowerCase();
    // Match if equal OR if one contains the other (for 3d suffix variations)
    return currentId === targetId || (currentId !== '' && (targetId.includes(currentId) || currentId.includes(targetId)));
  }

  getPlanPrice(planId: string) {
    const plan = this.plans().find(p => p.id === planId);
    return plan ? Math.floor(plan.price).toLocaleString() : '0';
  }

  private billing = inject(BillingService);

  async selectPlan(planId: string) {
    if (this.isCurrentPlan(planId)) return;
    
    const plan = this.plans().find(p => p.id === planId);
    if (!plan) return;

    if (plan.price === 0) {
      // For free plans, use the direct change method
      this.selecting.set(planId);
      try {
        const active = this.session.activeNegocio();
        if (!active) return;
        await this.api.businesses.billing.changePlan(active.id, planId);
        this.toast.success('¡Plan actualizado correctamente!');
        await this.session.initialize();
        this.close();
      } catch (error) {
        this.toast.error('Error al procesar el cambio de plan');
      } finally {
        this.selecting.set(null);
      }
      return;
    }

    // For paid plans, navigate to the premium checkout page
    this.router.navigate(['/billing/checkout'], { 
      queryParams: { plan: plan.id } 
    });
  }

  talkToSales() {
    window.open('https://wa.me/5492645656113?text=Hola!%20Quisiera%20más%20información%20sobre%20los%20planes%20de%20ProdManager.', '_blank');
  }

  close() {
    (window as any).closePricingModal?.();
  }
}
