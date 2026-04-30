import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronRight, Clock, User, Package, Wallet } from 'lucide-angular';
import { RecentOrderEntry } from '@shared/models/dashboard';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-recent-orders-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './recent-orders-widget.component.html'
})
export class RecentOrdersWidgetComponent {
  orders = input.required<RecentOrderEntry[]>();

  readonly icons = { ChevronRight, Clock, User, Package, Wallet };

  getStatusLabel(status: string): string {
    const s = status.toUpperCase();
    const map: Record<string, string> = {
      'PENDING': 'PENDIENTE',
      'IN_PROGRESS': 'EN PROCESO',
      'READY': 'LISTO',
      'DONE': 'TERMINADO',
      'DELIVERED': 'ENTREGADO',
      'CANCELLED': 'CANCELADO',
      'IN_STOCK': 'EN STOCK',
      'OFFICIAL_ORDER': 'ORDEN OFICIAL',
      'QUOTATION': 'PRESUPUESTO'
    };
    return map[s] || s;
  }

  getStatusStyles(status: string): string {
    const s = status.toUpperCase();
    if (s.includes('PEND') || s.includes('QUOT')) return 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-sm shadow-amber-500/10';
    if (s.includes('PROG') || s.includes('PROD') || s.includes('OFFIC')) return 'bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/10';
    if (s.includes('READY') || s.includes('DONE')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-sm shadow-emerald-500/10';
    if (s.includes('DELI') || s.includes('STOCK')) return 'bg-zinc-100 text-zinc-500 border-zinc-200';
    return 'bg-zinc-100 text-zinc-600 border-zinc-200';
  }

  cn = cn;
}
