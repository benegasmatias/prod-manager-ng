import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingService } from '@core/api/billing.service';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, ButtonSpinnerComponent],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  billing = inject(BillingService);

  plans = [
    {
      id: 'FREE',
      name: 'Gratis',
      price: 0,
      description: 'Para emprendedores y pequeños talleres que recién comienzan.',
      features: ['2 Máquinas', '3 Empleados', 'Gestión de pedidos básica'],
      buttonText: 'Plan Actual',
      popular: false
    },
    {
      id: 'PRO',
      name: 'Taller Inicial',
      price: 15000,
      description: 'La herramienta definitiva para profesionalizar tu producción.',
      features: ['Máquinas ilimitadas', '10 Empleados', 'Reportes avanzados', 'Soporte prioritario'],
      buttonText: 'Cambiarse a Pro',
      popular: true
    },
    {
      id: 'ENTERPRISE',
      name: 'Alto en Producción',
      price: 45000,
      description: 'Control total y escalabilidad para fábricas de gran escala.',
      features: ['Todo lo de Pro', 'Empleados ilimitados', 'API de integración', 'Account Manager'],
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
  }

  async onSelectPlan(plan: any) {
    if (plan.id === this.billing.planId()) return;
    
    if (plan.id === 'ENTERPRISE') {
      window.open('https://wa.me/5491112345678', '_blank');
      return;
    }

    try {
      await this.billing.startCheckout(plan.id, plan.price, `Plan ${plan.name} - Suscripción mensual`);
    } catch (e) {
      console.error('Checkout error:', e);
    }
  }
}
