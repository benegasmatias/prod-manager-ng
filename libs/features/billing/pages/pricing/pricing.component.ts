import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BillingService } from '@core/api/billing.service';
import { LucideAngularModule, Zap, Check, Minus, Info, CreditCard, Globe, ArrowRight, Shield } from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, ButtonSpinnerComponent, LucideAngularModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  billing = inject(BillingService);
  private router = inject(Router);

  readonly icons = { Zap, Check, Minus, Info, CreditCard, Globe, ArrowRight, Shield };

  plans = [
    {
      id: 'free-3d',
      name: 'Free por Siempre',
      price: 0,
      description: 'Ideal para hobbistas y makers solitarios.',
      features: ['30 pedidos / mes', '1 impresora', '1 Usuario', 'Smart Dashboard'],
      buttonText: 'Cambiar a Gratis',
      popular: false
    },
    {
      id: 'pro-3d',
      name: 'Taller Inicial',
      price: 8900,
      description: 'Para pequeños talleres que empiezan a crecer.',
      features: ['60 pedidos / mes', '2 impresoras', '2 Usuarios', 'Control de materiales', 'Soporte prioritario'],
      buttonText: 'Cambiarse a Pro',
      popular: true
    },
    {
      id: 'business-3d',
      name: 'Pequeñas Granja Produccion',
      price: 29500,
      description: 'Control total y escalabilidad para fábricas de gran escala.',
      features: ['Pedidos ilimitados', '5 impresoras', '5 Usuarios', 'Reportes avanzados', 'Soporte prioritario'],
      buttonText: 'Mejorar a Business',
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
