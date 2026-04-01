import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, AlertTriangle, AlertCircle, ArrowRight, ExternalLink, Search } from 'lucide-angular';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-alerts-priority-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    @if (alerts().length > 0) {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        @for (alert of alerts(); track alert.message) {
          <div 
            [routerLink]="getRoute(alert)"
            [queryParams]="getQueryParams(alert)"
            [class]="cn(
              'p-6 rounded-[2.5rem] border shadow-2xl relative overflow-hidden group transition-all duration-300',
              (alert.orderId || alert.searchQuery) ? 'cursor-pointer hover:-translate-y-1 hover:shadow-primary/20 active:scale-[0.98]' : 'cursor-default',
              alert.type === 'error' ? 'bg-rose-500 border-rose-400 text-white shadow-rose-500/20' : 'bg-amber-500 border-amber-400 text-white shadow-amber-500/20'
            )"
          >
             <!-- Decorative Icon -->
             <div class="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-700">
               <lucide-angular [img]="alert.type === 'error' ? icons.AlertCircle : icons.AlertTriangle" class="h-40 w-40"></lucide-angular>
             </div>
             
             <div class="relative z-10 flex items-start gap-4">
               <!-- Status Icon -->
               <div class="h-12 w-12 shrink-0 rounded-2xl bg-white/20 flex items-center justify-center">
                 <lucide-angular [img]="alert.type === 'error' ? icons.AlertCircle : icons.AlertTriangle" class="h-6 w-6"></lucide-angular>
               </div>
               
               <div class="flex-1 space-y-4">
                 <div class="space-y-1">
                   <div class="flex items-center justify-between">
                     <span class="text-[9px] font-black uppercase tracking-[0.3em] opacity-80">{{ alert.timestamp }}</span>
                     <div class="flex items-center gap-2">
                        @if (alert.orderId || alert.searchQuery) {
                          <lucide-angular [img]="alert.orderId ? icons.ExternalLink : icons.Search" class="h-3 w-3 opacity-50"></lucide-angular>
                        }
                        <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-black/10 rounded-lg">ALERTA CRÍTICA</span>
                     </div>
                   </div>
                   <h4 class="text-base font-black tracking-tight leading-snug">{{ alert.message }}</h4>
                 </div>
                 
                 @if (alert.orderId) {
                   <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-xl group-hover:bg-white/20 transition-colors">
                     Gestionar Pedido #{{ alert.orderId }}
                     <lucide-angular [img]="icons.ArrowRight" class="h-3 w-3 group-hover:translate-x-1 transition-transform"></lucide-angular>
                   </div>
                 } @else if (alert.searchQuery) {
                   <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-xl group-hover:bg-white/20 transition-colors">
                     Buscar Pedido {{ alert.searchQuery }}
                     <lucide-angular [img]="icons.ArrowRight" class="h-3 w-3 group-hover:translate-x-1 transition-transform"></lucide-angular>
                   </div>
                 }
               </div>
             </div>
          </div>
        }
      </div>
    }
  `
})
export class AlertsPriorityWidgetComponent {
  alerts = input.required<any[]>();

  readonly icons = { AlertTriangle, AlertCircle, ArrowRight, ExternalLink, Search };

  getRoute(alert: any): any[] | null {
    if (alert.orderId) return ['/pedidos', alert.orderId];
    if (alert.searchQuery) return ['/pedidos'];
    return null;
  }

  getQueryParams(alert: any): any | null {
    if (!alert.orderId && alert.searchQuery) {
      return { search: alert.searchQuery };
    }
    return null;
  }

  cn = cn;
}
