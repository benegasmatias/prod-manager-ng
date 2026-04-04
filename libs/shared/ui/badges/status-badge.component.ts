import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderItemStatus } from '../../models/pedido';
import { ProductionJobStatus } from '../../models/production-job';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all duration-300"
      [ngClass]="styles()"
    >
      {{ label() }}
    </span>
  `
})
export class StatusBadgeComponent {
  status = input.required<OrderItemStatus | ProductionJobStatus | string>();
  
  label = computed(() => {
    const s = this.status();
    const map: Record<string, string> = {
      // OrderItem
      [OrderItemStatus.PENDING]: 'Pendiente',
      [OrderItemStatus.IN_PROGRESS]: 'En Proceso',
      [OrderItemStatus.READY]: 'Listo p/ Entrega',
      [OrderItemStatus.DONE]: 'Entregado',
      [OrderItemStatus.FAILED]: 'Fallido',
      [OrderItemStatus.CANCELLED]: 'Cancelado',
      // ProductionJob (Extras)
      [ProductionJobStatus.QUEUED]: 'En Cola',
      [ProductionJobStatus.PAUSED]: 'Pausado',
    };
    return map[s] || s;
  });

  styles = computed(() => {
    const s = this.status();
    const emerald = 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
    const indigo = 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50';
    const rose = 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50';
    const amber = 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
    const zinc = 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800';

    const colorMap: Record<string, string> = {
      'PENDING': zinc,
      'IN_PROGRESS': indigo,
      'READY': emerald,
      'DONE': emerald,
      'FAILED': rose,
      'CANCELLED': zinc,
      'QUEUED': zinc,
      'PAUSED': amber,
    };

    return colorMap[s] || zinc;
  });
}
