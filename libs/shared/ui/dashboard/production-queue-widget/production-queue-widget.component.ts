import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Activity, Clock, Layers, AlertCircle, ChevronRight } from 'lucide-angular';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-production-queue-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-sm">
      <div class="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
         <div class="flex items-center gap-4">
            <div class="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
               <lucide-angular [img]="icons.Activity" class="h-5 w-5"></lucide-angular>
            </div>
            <h3 class="text-sm font-black uppercase tracking-[0.2em] text-zinc-950 dark:text-white">Cola de Fabricación Priorizada</h3>
         </div>
         <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 opacity-60">Ordenado por Criticidad</span>
      </div>

      <div class="divide-y divide-zinc-50 dark:divide-zinc-800">
        @for (item of queue(); track item.id) {
          <div class="p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-all cursor-pointer group">
             <div class="flex items-center gap-8 flex-1">
                <div class="min-w-[80px] text-[11px] font-black text-zinc-400 group-hover:text-primary transition-colors">#{{ item.id }}</div>
                
                <div class="flex flex-col gap-1 flex-1">
                   <h5 class="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-tight">{{ item.jobName }}</h5>
                   <div class="flex items-center gap-3">
                      <span class="text-[10px] font-black uppercase tracking-widest opacity-50">{{ item.clientName }}</span>
                      <div class="h-1 w-1 rounded-full bg-zinc-300"></div>
                      <span [class]="cn('text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest', getPriorityColor(item.priority))">
                        {{ item.priority }}
                      </span>
                   </div>
                </div>

                <div class="hidden md:flex items-center gap-12">
                   <div class="flex flex-col items-end">
                      <span class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Entrega ETA</span>
                      <span class="text-xs font-black text-zinc-700 dark:text-zinc-300">{{ item.eta }}</span>
                   </div>
                   <div class="flex flex-col items-end min-w-[100px]">
                      <span class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Estado Impulsado</span>
                      <span class="text-xs font-black text-emerald-500 uppercase">{{ item.status }}</span>
                   </div>
                </div>
             </div>
             <div class="ml-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <lucide-angular [img]="icons.ChevronRight" class="h-5 w-5 text-primary"></lucide-angular>
             </div>
          </div>
        } @empty {
          <div class="p-20 flex flex-col items-center justify-center text-center space-y-4">
             <div class="h-20 w-20 rounded-full bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-200">
                <lucide-angular [img]="icons.Layers" class="h-10 w-10"></lucide-angular>
             </div>
             <p class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Sin órdenes en cola de fabricación inmediata</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ProductionQueueWidgetComponent {
  queue = input.required<any[]>();

  readonly icons = { Activity, Clock, Layers, AlertCircle, ChevronRight };

  getPriorityColor(priority: string) {
    const map: any = {
      'HIGH': 'text-rose-500 bg-rose-500/10',
      'MEDIUM': 'text-amber-500 bg-amber-500/10',
      'LOW': 'text-emerald-500 bg-emerald-500/10'
    };
    return map[priority] || 'text-zinc-500 bg-zinc-500/10';
  }

  cn = cn;
}
