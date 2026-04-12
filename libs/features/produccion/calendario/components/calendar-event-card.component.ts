import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertCircle, Clock, User, CheckCircle2 } from 'lucide-angular';
import { CalendarOrderEvent } from '../models/calendar.models';
import { getStatusStyles, getStatusLabel, cn } from '@shared/utils';

export type CardDensity = 'FULL' | 'COMPACT' | 'AGENDA';

@Component({
  selector: 'app-calendar-event-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- MAIN CARD CONTAINER -->
    <div 
      (click)="onClick.emit(event())"
      [class]="cn(
        'group relative border-2 transition-all duration-300 cursor-pointer active:scale-[0.98] select-none overflow-hidden',
        getUrgencyStyles(),
        density() === 'AGENDA' ? 'p-3 flex items-center gap-4 rounded-2xl' : 'p-4 rounded-3xl flex flex-col gap-3',
        event().risk.level === 'CRITICAL' && density() !== 'AGENDA' ? 'shadow-lg shadow-red-500/5' : ''
      )"
    >
      <!-- RISK GLOW (Only for Full/Compact) -->
      <div *ngIf="density() !== 'AGENDA' && event().risk.level === 'CRITICAL'" class="absolute -top-10 -right-10 h-24 w-24 bg-red-500/5 rounded-full blur-2xl"></div>

      <!-- DENSITY DISPATCHER -->
      <ng-container [ngSwitch]="density()">

        <!-- 1. FULL DENSITY (Desktop Large) -->
        <ng-container *ngSwitchCase="'FULL'">
          <div class="flex items-start justify-between gap-3 relative z-10">
            <div class="flex flex-col gap-1 min-w-0 flex-1">
               <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-[9px] font-black tracking-widest text-zinc-400">#{{ event().code }}</span>
                  <span *ngIf="isStock()" class="px-1.5 py-0.5 bg-purple-500/10 text-purple-600 text-[7px] font-black uppercase rounded-md border border-purple-500/20">STOCK</span>
               </div>
               <p class="text-[11px] font-black text-zinc-900 dark:text-white leading-tight uppercase group-hover:text-primary transition-colors truncate">
                 {{ eventName() }}
               </p>
            </div>
            <div [class]="cn('h-2 w-2 rounded-full shrink-0 mt-1', getRiskCircleClass())"></div>
          </div>

          <div class="flex items-center justify-between gap-2">
             <div class="flex items-center gap-2 min-w-0">
                <div class="h-6 w-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                   <lucide-angular [img]="icons.User" class="h-3 w-3"></lucide-angular>
                </div>
                <span class="text-[10px] font-bold text-zinc-500 truncate">{{ operatorName() }}</span>
             </div>
             <div class="flex items-center gap-1 shrink-0">
                <lucide-angular [img]="icons.Clock" class="h-3 w-3 text-zinc-400"></lucide-angular>
                <span class="text-[9px] font-black tabular-nums text-zinc-400">{{ event().completionPercentage }}%</span>
             </div>
          </div>

          <div class="flex items-center justify-between pt-1">
             <div [class]="cn('px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border', getStatusClass())">
                {{ getLabel() }}
             </div>
             <lucide-angular *ngIf="isRisk()" [img]="icons.AlertCircle" class="h-3.5 w-3.5 text-red-500 animate-pulse"></lucide-angular>
             <lucide-angular *ngIf="isDone()" [img]="icons.CheckCircle2" class="h-3.5 w-3.5 text-emerald-500"></lucide-angular>
          </div>
        </ng-container>

        <!-- 2. COMPACT DENSITY (Tablet / Narrow Columns) -->
        <ng-container *ngSwitchCase="'COMPACT'">
          <div class="flex items-start justify-between gap-2 relative z-10">
             <p class="text-[10px] font-black text-zinc-900 dark:text-zinc-50 leading-tight uppercase truncate flex-1">
               {{ eventName() }}
             </p>
             <div [class]="cn('h-2 w-2 rounded-full shrink-0', getRiskCircleClass())"></div>
          </div>
          
          <div class="flex items-center justify-between">
             <span class="text-[9px] font-bold text-zinc-400">{{ operatorName() }}</span>
             <span class="text-[9px] font-black text-zinc-400">{{ event().completionPercentage }}%</span>
          </div>

          <div class="flex items-center justify-between pt-1">
             <span class="text-[7px] font-black text-zinc-500 uppercase tracking-widest">{{ getLabel() }}</span>
             <lucide-angular *ngIf="isRisk()" [img]="icons.AlertCircle" class="h-3 w-3 text-red-500"></lucide-angular>
          </div>
        </ng-container>

        <!-- 3. AGENDA DENSITY (Mobile List) -->
        <ng-container *ngSwitchCase="'AGENDA'">
           <!-- Indicator -->
           <div [class]="cn('w-1.5 h-12 rounded-full shrink-0', getRiskCircleClass())"></div>
           
           <!-- Content -->
           <div class="flex-1 min-w-0 py-1">
              <div class="flex items-center gap-2 mb-1.5">
                 <span class="text-[10px] sm:text-[11px] font-black text-zinc-400">#{{ event().code }}</span>
                 <p class="text-[13px] sm:text-sm font-black text-zinc-900 dark:text-white uppercase truncate">{{ eventName() }}</p>
              </div>
              <div class="flex items-center gap-3">
                 <div class="flex items-center gap-2 text-zinc-500">
                    <div class="h-6 w-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                       <lucide-angular [img]="icons.User" class="h-3 w-3"></lucide-angular>
                    </div>
                    <span class="text-[11px] sm:text-xs font-bold truncate max-w-[80px] sm:max-w-none">{{ operatorName() }}</span>
                 </div>
                 <div class="px-3 py-1 rounded-lg border text-[9px] sm:text-[10px] font-black uppercase tracking-widest" [class]="getStatusClass()">
                    {{ getLabel() }}
                 </div>
              </div>
           </div>

           <!-- Right Actions / Progress -->
           <div class="flex flex-col items-end gap-1.5 shrink-0 pr-1">
              <div class="flex items-center gap-1.5">
                 <span class="text-sm font-black tabular-nums text-zinc-900 dark:text-white">{{ event().completionPercentage }}%</span>
                 <div class="h-8 w-8 rounded-full border-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-center relative">
                    <svg class="h-8 w-8 -rotate-90 absolute">
                       <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2.5" class="text-zinc-100 dark:text-zinc-800"/>
                       <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2.5" 
                          [attr.stroke-dasharray]="88" 
                          [attr.stroke-dashoffset]="88 - (88 * event().completionPercentage / 100)"
                          class="text-primary"/>
                    </svg>
                    <lucide-angular *ngIf="isRisk()" [img]="icons.AlertCircle" class="h-3 w-3 text-red-500 z-10 animate-pulse"></lucide-angular>
                    <lucide-angular *ngIf="isDone()" [img]="icons.CheckCircle2" class="h-3 w-3 text-emerald-500 z-10"></lucide-angular>
                 </div>
              </div>
           </div>
        </ng-container>

      </ng-container>

      <!-- PROGRESS LINE (Common for Full/Compact) -->
      <div *ngIf="density() !== 'AGENDA'" class="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-1000 opacity-20" [style.width.%]="event().completionPercentage"></div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class CalendarEventCardComponent {
  event = input.required<CalendarOrderEvent>();
  density = input<CardDensity>('FULL');
  onClick = output<CalendarOrderEvent>();

  icons = { AlertCircle, Clock, User, CheckCircle2 };

  isStock = computed(() => this.event().type === 'STOCK');
  isDone = computed(() => this.event().status === 'DONE' || this.event().status === 'IN_STOCK' || this.event().status === 'DELIVERED');
  isRisk = computed(() => this.event().risk.level === 'HIGH' || this.event().risk.level === 'CRITICAL');

  eventName = computed(() => this.event().items?.[0]?.nombreProducto || 'Orden Especial');
  operatorName = computed(() => this.event().responsableGeneral?.firstName || 'Sin asignar');

  getUrgencyStyles() {
    const u = this.event().urgency;
    const r = this.event().risk.level;
    
    if (this.density() === 'AGENDA') {
       return 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800';
    }

    if (r === 'CRITICAL' || u === 'OVERDUE') return 'bg-red-50/20 border-red-100 dark:bg-red-950/10 dark:border-red-900/40';
    if (u === 'TODAY' || r === 'HIGH') return 'bg-amber-50/20 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/40';
    return 'bg-white/80 border-zinc-100 dark:bg-zinc-900/60 dark:border-zinc-800 hover:border-primary/50';
  }

  getRiskCircleClass() {
    const r = this.event().risk.level;
    const u = this.event().urgency;
    if (r === 'CRITICAL' || u === 'OVERDUE') return 'bg-red-500 shadow-sm shadow-red-500/50';
    if (r === 'HIGH' || u === 'TODAY') return 'bg-amber-500';
    if (r === 'MEDIUM') return 'bg-blue-400';
    return 'bg-zinc-200 dark:bg-zinc-700';
  }

  getStatusClass() {
    return getStatusStyles(this.event().status);
  }

  getLabel() {
    return getStatusLabel(this.event().status);
  }

  cn(...args: any[]) { return cn(...args); }
}
