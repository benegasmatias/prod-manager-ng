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
    <div class="space-y-6">
      <!-- DESKTOP TABLE VIEW -->
      <div class="hidden lg:block overflow-hidden rounded-[2.5rem] border border-zinc-100/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 shadow-sm">
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
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MOBILE CARD VIEW -->
      <div class="lg:hidden space-y-3">
        @for (order of orders(); track order.id) {
          <div [routerLink]="['/pedidos', order.id]" class="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-sm active:scale-[0.98] transition-all flex flex-col gap-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex flex-col min-w-0">
                <span class="text-[8px] font-bold text-primary opacity-60 tracking-wider truncate mb-0.5">#{{ order.id }}</span>
                <span class="text-xs font-black text-zinc-900 dark:text-zinc-100 tracking-tight truncate">{{ order.clientName }}</span>
              </div>
              <span [class]="cn(
                'px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shrink-0',
                getStatusStyles(order.status)
              )">
                {{ order.status }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2 border-y border-zinc-100/50 dark:border-zinc-800/50">
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300">
                  <lucide-angular [img]="icons.Package" class="h-4 w-4"></lucide-angular>
                </div>
                <div class="flex flex-col">
                  <span class="text-[9px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">{{ order.type }}</span>
                  <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-tight">Trabajo Planta</span>
                </div>
              </div>
              <div class="flex flex-col items-end">
                <span class="text-xs font-black text-zinc-900 dark:text-zinc-100 tabular-nums font-mono">$ {{ order.total | number:'1.0-0' }}</span>
                <span *ngIf="order.dueDate" class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{{ order.dueDate | date:'dd MMM' }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      @if (orders().length === 0) {
        <div class="py-12 md:py-24 text-center border-2 border-dashed border-zinc-100 rounded-[2.5rem]">
          <div class="flex flex-col items-center gap-4 opacity-20">
            <lucide-angular [img]="icons.Clock" class="h-12 w-12"></lucide-angular>
            <span class="text-[10px] font-black uppercase tracking-[0.4em]">Sin actividad reciente</span>
          </div>
        </div>
      }

      <!-- TABLE FOOTER ACTIONS -->
      <div class="flex items-center justify-center pt-2">
         <button class="w-full sm:w-auto px-12 py-3.5 md:py-4 rounded-xl md:rounded-full border border-zinc-100 dark:border-zinc-800 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-primary transition-all active:scale-95">
           Ver historial completo
         </button>
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
