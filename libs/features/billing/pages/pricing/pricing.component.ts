import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BillingService } from '@core/api/billing.service';
import { LayoutService } from '@core/layout/layout.service';
import { LucideAngularModule, Zap, Check, Minus, Info, CreditCard, Globe, ArrowRight, Shield } from 'lucide-angular';
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
  billing = inject(BillingService);
  private router = inject(Router);
  layout = inject(LayoutService);

  cn = cn;
  activeTab = 'Profesional';

  readonly icons = { Zap, Check, Minus, Info, CreditCard, Globe, ArrowRight, Shield };

  plans: any[] = [
    {
      id: 'free-3d',
      name: 'Maker',
      price: 0,
      description: 'Digitalizá tu flujo de trabajo sin costos operativos.',
      features: [
        { label: 'Gestión esencial', items: ['30 pedidos mensuales', '1 impresora activa', '1 Usuario'] },
        { label: 'Visibilidad', items: ['Smart Dashboard básico'] }
      ],
      buttonText: 'Empezar ahora',
      popular: false
    },
    {
      id: 'pro-3d',
      name: 'Taller Pro',
      price: 8900,
      promoPrice: 4900,
      promoDurationMonths: 6,
      promoLabel: '60% OFF',
      description: 'Potenciá tu producción con herramientas de precisión.',
      features: [
        { label: 'Escalabilidad', highlight: true, items: ['60 pedidos mensuales', '2 impresoras activas', '2 Usuarios'] },
        { label: 'Control Industrial', items: ['Gestión de materiales', 'Trazabilidad de fallas'] },
        { label: 'Soporte', items: ['Prioridad de respuesta'] }
      ],
      buttonText: 'Activar Taller Pro',
      popular: true
    },
    {
      id: 'business-3d',
      name: 'Fábrica Industrial',
      price: 29500,
      description: 'Ecosistema total para operaciones de alto volumen.',
      features: [
        { label: 'Capacidad Total', highlight: true, items: ['Pedidos ilimitados', '5 impresoras activas'] },
        { label: 'Analytics Pro', items: ['Reportes avanzados', 'Auditoría de operarios'] },
        { label: 'Infraestructura', items: ['Soporte dedicado 24/7'] }
      ],
      buttonText: 'Contactar Ventas',
      popular: false
    }
  ];

  comparisonFeatures = [
    { name: 'Máquinas conectadas', free: '2', pro: 'Ilimitadas', enterprise: 'Ilimitadas' },
    { name: 'Colaboradores', free: 'Hasta 3', pro: 'Hasta 10', enterprise: 'Ilimitados' },
    { name: 'Gestión de Materiales', free: 'Básica', pro: 'Avanzada', enterprise: 'Avanzada' },
    { name: 'Trazabilidad de Fallas', free: false, pro: true, enterprise: true },
    { name: 'Reportes de Eficiencia', free: false, pro: true, enterprise: true },
    { name: 'API & Webhooks', free: false, pro: false, enterprise: true },
    { name: 'Soporte 24/7', free: false, pro: 'Prioritario', enterprise: 'Dedicado' },
  ];

  ngOnInit() {
    this.billing.loadSubscription().catch(console.error);
    this.layout.showBackButton.set(true);
    this.layout.backAction.set(() => {
      this.router.navigate(['/ajustes']);
    });
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
