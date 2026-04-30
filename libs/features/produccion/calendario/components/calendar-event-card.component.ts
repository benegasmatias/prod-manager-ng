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
        'group relative border transition-all duration-1000 cursor-pointer active:scale-[0.98] select-none overflow-hidden backdrop-blur-3xl',
        getUrgencyStyles(),
        density() === 'AGENDA' ? 'p-6 flex items-center gap-8 rounded-3xl' : 'p-6 rounded-3xl flex flex-col gap-6',
        event().risk.level === 'CRITICAL' && density() !== 'AGENDA' ? 'shadow-2xl shadow-error/10' : 'shadow-2xl shadow-text/5'
      )"
    >
      <!-- RISK GLOW (Only for Full/Compact) -->
      <div *ngIf="density() !== 'AGENDA' && event().risk.level === 'CRITICAL'" class="absolute -top-10 -right-10 h-32 w-32 bg-error/5 rounded-full blur-3xl"></div>
 
      <!-- DENSITY DISPATCHER -->
      <ng-container [ngSwitch]="density()">
 
        <!-- 1. FULL DENSITY (Desktop Large) -->
        <ng-container *ngSwitchCase="'FULL'">
          <div class="flex items-start justify-between gap-4 relative z-10">
            <div class="flex flex-col gap-2 min-w-0 flex-1">
               <div class="flex items-center gap-3 flex-wrap">
                  <span class="text-[9px] font-black tracking-[0.3em] text-text-muted/20 italic">#{{ event().code }}</span>
                  <span *ngIf="isStock()" class="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase rounded-full border border-primary/20 italic">STOCK</span>
               </div>
               <p class="text-[13px] font-black text-text leading-tight uppercase group-hover:text-primary transition-colors truncate font-display italic">
                 {{ eventName() }}
               </p>
            </div>
            <div [class]="cn('h-2 w-2 rounded-full shrink-0 mt-2', getRiskCircleClass())"></div>
          </div>
 
          <div class="flex items-center justify-between gap-4 pt-2">
             <div class="flex items-center gap-3 min-w-0">
                <div class="h-8 w-8 rounded-xl bg-surface flex items-center justify-center text-text-muted/20 shrink-0 border border-border/5 shadow-2xl shadow-text/5">
                   <lucide-angular [img]="icons.User" class="h-4 w-4"></lucide-angular>
                </div>
                <span class="text-[10px] font-black text-text-muted/60 uppercase tracking-widest italic truncate">{{ operatorName() }}</span>
             </div>
             <div class="flex items-center gap-2 shrink-0">
                <lucide-angular [img]="icons.Clock" class="h-3.5 w-3.5 text-text-muted/20"></lucide-angular>
                <span class="text-[10px] font-black tabular-nums text-text-muted/40 italic">{{ event().completionPercentage }}%</span>
             </div>
          </div>
 
          <div class="flex items-center justify-between pt-4 border-t border-border/5">
             <div [class]="cn('px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] border italic', getStatusClass())">
                {{ getLabel() }}
             </div>
             <lucide-angular *ngIf="isRisk()" [img]="icons.AlertCircle" class="h-4 w-4 text-error animate-pulse"></lucide-angular>
             <lucide-angular *ngIf="isDone()" [img]="icons.CheckCircle2" class="h-4 w-4 text-emerald-500"></lucide-angular>
          </div>
        </ng-container>
 
        <!-- 2. COMPACT DENSITY (Tablet / Narrow Columns) -->
        <ng-container *ngSwitchCase="'COMPACT'">
          <div class="flex items-start justify-between gap-3 relative z-10">
             <p class="text-xs font-black text-text leading-tight uppercase truncate flex-1 font-display italic">
               {{ eventName() }}
             </p>
             <div [class]="cn('h-1.5 w-1.5 rounded-full shrink-0 mt-1.5', getRiskCircleClass())"></div>
          </div>
          
          <div class="flex items-center justify-between pt-2">
             <span class="text-[9px] font-black text-text-muted/30 uppercase tracking-[0.2em] italic truncate grow">{{ operatorName() }}</span>
             <span class="text-[9px] font-black text-text-muted/20 tabular-nums italic ml-2">{{ event().completionPercentage }}%</span>
          </div>
 
          <div class="flex items-center justify-between pt-4 border-t border-border/5">
             <span class="text-[8px] font-black text-text-muted/20 uppercase tracking-[0.4em] italic">{{ getLabel() }}</span>
             <lucide-angular *ngIf="isRisk()" [img]="icons.AlertCircle" class="h-3.5 w-3.5 text-error"></lucide-angular>
          </div>
        </ng-container>
 
        <!-- 3. AGENDA DENSITY (Mobile List) -->
        <ng-container *ngSwitchCase="'AGENDA'">
           <!-- Modern Timeline Strip -->
           <div [class]="cn('w-1.5 h-full absolute left-0 top-0', getRiskCircleClass())"></div>
           
           <!-- Content Body -->
           <div class="flex-1 min-w-0 pl-2">
              <div class="flex items-center gap-3 mb-2">
                 <span class="text-[8px] font-black text-text-muted/10 tracking-[0.4em] uppercase italic">#{{ event().code }}</span>
                 <span *ngIf="isStock()" class="px-2 py-0.5 bg-primary/10 text-primary text-[7px] font-black uppercase rounded-md border border-primary/10 italic">STOCK</span>
              </div>
              
              <h4 class="text-xl font-black text-text uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors mb-4">
                {{ eventName() }}
              </h4>

              <div class="flex items-center gap-4">
                 <!-- Status Bubble -->
                 <div class="flex items-center gap-3">
                    <div [class]="cn('h-8 w-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black uppercase shadow-inner transition-transform group-hover:rotate-12', isRisk() ? 'bg-error/10 border-error/20 text-error' : 'bg-surface-container-low border-border/5 text-text-muted/60')">
                       {{ operatorName().charAt(0) }}
                    </div>
                    <div class="flex flex-col">
                       <span class="text-[8px] font-black text-text-muted/30 uppercase tracking-widest italic">Responsable</span>
                       <span class="text-[10px] font-black text-text-muted/80 uppercase truncate italic max-w-[100px]">{{ operatorName() }}</span>
                    </div>
                 </div>

                 <div class="h-6 w-px bg-border/5"></div>

                 <!-- Operational Pill -->
                 <div class="px-4 py-1.5 rounded-full bg-surface-container-low border border-border/5 text-[8px] font-black uppercase tracking-[0.3em] italic text-text-muted/60 group-hover:border-primary/20 group-hover:text-primary transition-all">
                    {{ getLabel() }}
                 </div>
              </div>
           </div>

           <!-- Operational Gauge -->
           <div class="flex flex-col items-center justify-center shrink-0 ml-4 group-hover:scale-110 transition-transform duration-700">
              <div class="relative h-16 w-16 flex items-center justify-center">
                 <svg class="h-16 w-16 -rotate-90 absolute">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" stroke-width="2.5" class="text-border/5"/>
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" stroke-width="3.5" 
                       stroke-linecap="round"
                       [attr.stroke-dasharray]="176" 
                       [attr.stroke-dashoffset]="176 - (176 * event().completionPercentage / 100)"
                       [class]="cn('transition-all duration-1000 ease-out', isRisk() ? 'text-error' : 'text-primary')"/>
                 </svg>
                 <div class="flex flex-col items-center">
                    <span class="text-xs font-black tabular-nums text-text italic leading-none">{{ event().completionPercentage }}%</span>
                    <lucide-angular *ngIf="isRisk()" [img]="icons.AlertCircle" class="h-3 w-3 text-error mt-0.5 animate-pulse"></lucide-angular>
                    <lucide-angular *ngIf="isDone()" [img]="icons.CheckCircle2" class="h-3 w-3 text-emerald-500 mt-0.5"></lucide-angular>
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
       return 'bg-surface border-border/5 shadow-2xl shadow-text/5';
    }

    if (r === 'CRITICAL' || u === 'OVERDUE') return 'bg-error/5 border-error/20 shadow-2xl shadow-error/10 scale-105 z-10 animate-pulse';
    if (u === 'TODAY' || r === 'HIGH') return 'bg-accent/5 border-accent/20 shadow-2xl shadow-accent/10';
    return 'bg-surface/40 border-border/5 hover:border-primary/50 shadow-2xl shadow-text/5';
  }

  getRiskCircleClass() {
    const r = this.event().risk.level;
    const u = this.event().urgency;
    if (r === 'CRITICAL' || u === 'OVERDUE') return 'bg-error shadow-2xl shadow-error/50';
    if (r === 'HIGH' || u === 'TODAY') return 'bg-accent shadow-2xl shadow-accent/50';
    if (r === 'MEDIUM') return 'bg-primary/40';
    return 'bg-text-muted/10';
  }

  getStatusClass() {
    return getStatusStyles(this.event().status);
  }

  getLabel() {
    return getStatusLabel(this.event().status);
  }

  cn(...args: any[]) { return cn(...args); }
}
