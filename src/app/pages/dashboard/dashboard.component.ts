import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetalurgicaDashboardComponent } from '@business/metalurgica';
import { AuthService } from '@core/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MetalurgicaDashboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  authService = inject(AuthService);
  
  loading = signal(false);
  
  // Mock data for initial testing
  dashboardSummary = signal({
    operationalCounters: {
      visitsToday: 3,
      pendingBudgets: 12,
      inProduction: 8,
      deliveriesThisWeek: 5,
      delayedOrders: 2,
      pendingPayments: 4
    },
    pipelineSummary: [
      { stage: 'SITE_VISIT', count: 5 },
      { stage: 'QUOTATION', count: 12 },
      { stage: 'APPROVED', count: 8 },
      { stage: 'CUTTING', count: 3 },
      { stage: 'WELDING', count: 2 },
      { stage: 'DONE', count: 4 }
    ],
    calendarEvents: [
      { id: '1', type: 'VISIT', clientName: 'García, Alberto', date: new Date().toISOString().split('T')[0], time: '10:00', status: 'SITE_VISIT' },
      { id: '2', type: 'DELIVERY', clientName: 'Herrería El Sanjuanino', date: new Date().toISOString().split('T')[0], time: '15:30', status: 'DONE' }
    ],
    alerts: [
      { message: 'Pedido #452 (Reja p/ Balcón) con retraso en Soldadura.' }
    ]
  });
}
