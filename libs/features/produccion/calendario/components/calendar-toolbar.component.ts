import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Columns, Grid, List } from 'lucide-angular';
import { CalendarViewMode } from '../models/calendar.models';

@Component({
  selector: 'app-calendar-toolbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <header [class]="cn(
      'bg-surface-container-low/30 backdrop-blur-3xl border border-border/5 shadow-2xl shadow-text/5 animate-in slide-in-from-top-4 duration-500 overflow-hidden w-full',
      isMobile() ? 'flex flex-col gap-4 p-4 rounded-3xl' : 'flex flex-col md:flex-row md:items-center justify-between gap-8 p-6 lg:p-10 rounded-[4rem]'
    )">
      
      <!-- 1. MOBILE TOP ROW: Context + Navigation -->
      <div *ngIf="isMobile()" class="flex items-center justify-between gap-4">
         <div class="flex flex-col min-w-0 flex-1">
            <span class="text-[10px] font-black text-text uppercase tracking-tight truncate italic">{{ currentRangeLabel() }}</span>
         </div>
         <div class="flex items-center gap-1.5 p-1 bg-surface rounded-xl border border-border/5">
            <button (click)="onPrev.emit()" class="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low active:scale-95 transition-all">
               <lucide-angular [img]="icons.ChevronLeft" class="h-3.5 w-3.5"></lucide-angular>
            </button>
            <button (click)="onToday.emit()" class="h-8 px-3 rounded-lg bg-primary text-[8px] font-black uppercase text-white shadow-xl shadow-primary/20 italic">Hoy</button>
            <button (click)="onNext.emit()" class="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low active:scale-95 transition-all">
               <lucide-angular [img]="icons.ChevronRight" class="h-3.5 w-3.5"></lucide-angular>
            </button>
         </div>
      </div>
 
      <!-- 2. DESKTOP ONLY: Context Badge (Moved out of mobile row) -->
      <div *ngIf="!isMobile()" class="flex flex-col md:order-1">
         <p class="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted/20 italic">Rango Operativo</p>
         <span class="text-[14px] font-black text-text tracking-tighter uppercase font-display italic">{{ currentRangeLabel() }}</span>
      </div>
 
      <!-- 3. VIEW SELECTOR: Full width on mobile -->
      <div [class]="cn(
        'flex items-center gap-1 p-1 bg-surface-container-low rounded-2xl border border-border/5 transition-all',
        isMobile() ? 'w-full grid grid-cols-3' : 'md:order-3 justify-center rounded-[1.8rem]'
      )">
        @for (mode of viewModes; track mode.mode) {
          <button 
            (click)="onViewChange.emit(mode.mode)"
            [class]="cn(
              'rounded-xl flex items-center justify-center gap-2 transition-all duration-500 active:scale-95 h-9 md:h-11 md:px-6',
              currentView() === mode.mode 
                ? 'bg-text text-surface shadow-2xl shadow-text/20' 
                : 'text-text-muted/30 hover:text-text'
            )"
          >
            <lucide-angular [img]="mode.icon" class="h-3.5 w-3.5 md:h-5 md:w-5"></lucide-angular>
            <span class="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] font-display italic">
              {{ mode.label }}
            </span>
          </button>
        }
      </div>
 
      <!-- 4. DESKTOP NAVIGATION -->
      <div *ngIf="!isMobile()" class="flex items-center gap-3 p-1.5 bg-surface rounded-2xl border border-border/5 order-2">
           <button (click)="onPrev.emit()" class="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low transition-all"><lucide-angular [img]="icons.ChevronLeft" class="h-4 w-4"></lucide-angular></button>
           <button (click)="onToday.emit()" class="h-11 px-6 rounded-xl bg-primary text-[9px] font-black uppercase tracking-widest text-white shadow-2xl shadow-primary/20 italic">Hoy</button>
           <button (click)="onNext.emit()" class="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low transition-all"><lucide-angular [img]="icons.ChevronRight" class="h-4 w-4"></lucide-angular></button>
      </div>
 
    </header>
  `,
  styles: [`:host { display: block; }`]
})
export class CalendarToolbarComponent {
  currentRangeLabel = input.required<string>();
  currentView = input.required<CalendarViewMode>();
  isMobile = input<boolean>(false);
  
  onPrev = output<void>();
  onNext = output<void>();
  onToday = output<void>();
  onViewChange = output<CalendarViewMode>();

  icons = { ChevronLeft, ChevronRight, CalendarIcon, Columns, Grid, List };

  viewModes: { mode: CalendarViewMode; label: string; icon: any }[] = [
    { mode: 'AGENDA', label: 'Agenda', icon: List },
    { mode: 'WEEK', label: 'Semana', icon: Columns },
    { mode: 'MONTH', label: 'Mes', icon: Grid }
  ];

  cn(...args: any[]) { return args.filter(Boolean).join(' '); }
}
