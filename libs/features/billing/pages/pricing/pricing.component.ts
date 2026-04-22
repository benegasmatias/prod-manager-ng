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
      description: 'Ideal para emprendedores individuales',
      features: ['Hasta 2 máquinas', 'Hasta 3 empleados', 'Gestión de pedidos básica'],
      buttonText: 'Plan Actual',
      popular: false
    },
    {
      id: 'PRO',
      name: 'Profesional',
      price: 15000,
      description: 'Para negocios en crecimiento',
      features: ['Máquinas ilimitadas', 'Hasta 10 empleados', 'Reportes avanzados', 'Prioridad de soporte'],
      buttonText: 'Cambiarse a Pro',
      popular: true
    },
    {
      id: 'ENTERPRISE',
      name: 'Empresa',
      price: 45000,
      description: 'Control total de tu producción',
      features: ['Todo lo de Pro', 'Empleados ilimitados', 'API de integración', 'Account Manager'],
      buttonText: 'Contactar Ventas',
      popular: false
    }
  ];

  ngOnInit() {
    this.billing.loadSubscription().catch(console.error);
  }

  async onSelectPlan(plan: any) {
    if (plan.id === this.billing.planId()) return;
    
    if (plan.id === 'ENTERPRISE') {
      window.open('https://wa.me/your-whatsapp-number', '_blank');
      return;
    }

    try {
      await this.billing.startCheckout(plan.id, plan.price, `Plan ${plan.name} - suscripción mensual`);
    } catch (e) {
      console.error('Checkout error:', e);
    }
  }
}
