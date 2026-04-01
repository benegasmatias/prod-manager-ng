import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Printer, Clock, Layers, AlertCircle, Play, Pause, Activity } from 'lucide-angular';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-printers-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      @for (p of printers(); track p.id) {
        <div class="group relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5">
           <div [class]="cn('absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity', getStatusColor(p.status))"></div>
           
           <div class="flex flex-col h-full space-y-6">
              <div class="flex items-center justify-between">
                 <div class="h-14 w-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                    <lucide-angular [img]="icons.Printer" class="h-7 w-7"></lucide-angular>
                 </div>
                 <div [class]="cn('px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all', getStatusColor(p.status))">
                    {{ p.status }}
                 </div>
              </div>

              <div>
                 <h4 class="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">{{ p.name }}</h4>
                 <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mt-1">{{ p.model }}</p>
              </div>

              @if (p.status === 'PRINTING') {
                <div class="space-y-4 pt-2">
                   <div class="flex justify-between items-end">
                      <div class="space-y-1">
                         <span class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Trabajo Actual</span>
                         <p class="text-[11px] font-black text-zinc-700 dark:text-zinc-300 truncate">{{ p.jobTitle }}</p>
                      </div>
                      <span class="text-xl font-black text-primary tabular-nums">{{ p.progress }}%</span>
                   </div>
                   <div class="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div class="h-full bg-primary transition-all duration-1000 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" [style.width.%]="p.progress"></div>
                   </div>
                   <div class="flex items-center gap-2 text-[10px] font-bold text-zinc-400 mt-2">
                      <lucide-angular [img]="icons.Clock" class="h-3 w-3"></lucide-angular>
                      <span class="uppercase tracking-widest">{{ p.timeRemaining }} restantes</span>
                   </div>
                </div>
              } @else {
                <div class="flex-1 flex items-center justify-center pt-4 opacity-30 group-hover:opacity-100 transition-opacity">
                   <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Lista para Producir</span>
                </div>
              }
           </div>
        </div>
      }
    </div>
  `
})
export class PrintersWidgetComponent {
  printers = input.required<any[]>();

  readonly icons = { Printer, Clock, Layers, AlertCircle, Play, Pause, Activity };

  getStatusColor(status: string) {
    const map: any = {
      'PRINTING': 'bg-primary text-primary border-primary/20',
      'READY': 'bg-emerald-500 text-emerald-500 border-emerald-500/20',
      'ERROR': 'bg-rose-500 text-rose-500 border-rose-500/20',
      'MAINTENANCE': 'bg-amber-500 text-amber-500 border-amber-500/20'
    };
    return map[status] || 'bg-zinc-500 text-zinc-500';
  }

  cn = cn;
}
