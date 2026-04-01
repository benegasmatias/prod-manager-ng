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
    <div class="overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-zinc-50/50 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800">
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">ID / Cliente</th>
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Tipo / Trabajo</th>
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">Estado</th>
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Total / Vence</th>
              <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            @for (order of orders(); track order.id) {
              <tr class="group hover:bg-primary/[0.02] transition-all duration-300">
                <td class="px-8 py-6">
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-black text-primary/70 tracking-widest">#{{ order.id }}</span>
                    <span class="text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-100">{{ order.clientName }}</span>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="flex flex-col gap-1">
                    <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">{{ order.type }}</span>
                    <div class="flex items-center gap-1.5 opacity-60">
                      <lucide-angular [img]="icons.Package" class="h-3 w-3"></lucide-angular>
                      <span class="text-[10px] font-bold uppercase tracking-tighter">Trabajo de Planta</span>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="flex justify-center">
                    <span [class]="cn(
                      'px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all',
                      getStatusStyles(order.status)
                    )">
                      {{ order.status }}
                    </span>
                  </div>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-100">$ {{ order.total | number:'1.2-2' }}</span>
                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{{ order.dueDate }}</span>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <button [routerLink]="['/pedidos', order.id]" class="h-10 w-10 rounded-2xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-primary hover:text-white transition-all active:scale-90 group-hover:translate-x-1">
                    <lucide-angular [img]="icons.ChevronRight" class="h-5 w-5"></lucide-angular>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-8 py-20 text-center">
                  <div class="flex flex-col items-center gap-4 opacity-30">
                    <lucide-angular [img]="icons.Clock" class="h-12 w-12"></lucide-angular>
                    <span class="text-[10px] font-black uppercase tracking-[0.3em]">No hay pedidos recientes</span>
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
