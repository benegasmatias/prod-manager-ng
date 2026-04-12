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
  template: `
    <div class="overflow-hidden rounded-[2.5rem] border border-zinc-100/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-zinc-50/30 dark:bg-zinc-900 border-b border-zinc-100/50 dark:border-zinc-800/50">
              <th class="px-10 py-6 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">ID / Cliente</th>
              <th class="px-10 py-6 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">Tipo / Trabajo</th>
              <th class="px-10 py-6 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 text-center">Estado</th>
              <th class="px-10 py-6 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 text-right">Total / Vence</th>
              <th class="px-6 py-6 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100/50 dark:divide-zinc-800/50">
            @for (order of orders(); track order.id) {
              <tr class="group hover:bg-zinc-50/[0.4] dark:hover:bg-zinc-900/40 transition-all duration-300">
                <td class="px-10 py-7">
                  <div class="flex flex-col gap-1">
                    <span class="text-[9px] font-bold text-primary opacity-60 tracking-wider truncate max-w-[150px]">#{{ order.id }}</span>
                    <span class="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{{ order.clientName }}</span>
                  </div>
                </td>
                <td class="px-10 py-7">
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-black text-zinc-800 dark:text-zinc-300 uppercase tracking-tighter">{{ order.type }}</span>
                    <div class="flex items-center gap-1.5 text-zinc-400">
                      <lucide-angular [img]="icons.Package" class="h-3 w-3 opacity-50"></lucide-angular>
                      <span class="text-[9px] font-bold uppercase tracking-tight">Trabajo de Planta</span>
                    </div>
                  </div>
                </td>
                <td class="px-10 py-7">
                  <div class="flex justify-center">
                    <span [class]="cn(
                      'px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-300',
                      getStatusStyles(order.status)
                    )">
                      {{ order.status }}
                    </span>
                  </div>
                </td>
                <td class="px-10 py-7 text-right">
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-black text-zinc-900 dark:text-zinc-100">$ {{ order.total | number:'1.2-2' }}</span>
                    <span *ngIf="order.dueDate" class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{{ order.dueDate | date:'yyyy-MM-dd' }}</span>
                  </div>
                </td>
                <td class="px-6 py-7">
                  <button [routerLink]="['/pedidos', order.id]" class="h-10 w-10 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-110 transition-all active:scale-95 group-hover:bg-white dark:group-hover:bg-zinc-800">
                    <lucide-angular [img]="icons.ChevronRight" class="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors"></lucide-angular>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-10 py-24 text-center">
                  <div class="flex flex-col items-center gap-4 opacity-20 transition-opacity hover:opacity-40">
                    <lucide-angular [img]="icons.Clock" class="h-12 w-12"></lucide-angular>
                    <span class="text-[10px] font-black uppercase tracking-[0.4em]">Sin actividad reciente</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class RecentOrdersWidgetComponent {
  orders = input.required<RecentOrderEntry[]>();

  readonly icons = { ChevronRight, Clock, User, Package, Wallet };

  getStatusStyles(status: string): string {
    const s = status.toUpperCase();
    if (s.includes('PEND')) return 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-sm shadow-amber-500/10';
    if (s.includes('PROD') || s.includes('PRIN')) return 'bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/10';
    if (s.includes('DELI') || s.includes('READY')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-sm shadow-emerald-500/10';
    return 'bg-zinc-100 text-zinc-600 border-zinc-200';
  }

  cn = cn;
}
