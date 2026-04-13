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
      <div class="space-y-4">
        @for (alert of alerts(); track alert.message) {
          <div 
            [routerLink]="getRoute(alert)"
            [queryParams]="getQueryParams(alert)"
            [class]="cn(
              'p-6 rounded-[2rem] border transition-all duration-500 relative group overflow-hidden',
              (alert.orderId || alert.searchQuery) ? 'cursor-pointer hover:shadow-xl hover:shadow-black/5 active:scale-[0.98]' : 'cursor-default',
              alert.type === 'error' 
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 text-zinc-900 dark:text-zinc-100' 
                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 text-zinc-900 dark:text-zinc-100'
            )"
          >
             <div class="flex items-start gap-4">
                <div [class]="cn(
                  'h-2.5 w-2.5 rounded-full mt-2 shrink-0 animate-pulse',
                  alert.type === 'error' ? 'bg-rose-500' : 'bg-amber-500 shadow-sm shadow-amber-500/30'
                )"></div>
                
                <div class="flex-1 space-y-3">
                   <div class="space-y-0.5">
                      <p class="text-xs font-black tracking-tight leading-relaxed group-hover:text-primary transition-colors">{{ alert.message }}</p>
                      <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{{ alert.timestamp }}</p>
                   </div>
                   
                   @if (alert.orderId || alert.searchQuery) {
                     <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-primary transition-all">
                        <span>Ver detalle</span>
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
