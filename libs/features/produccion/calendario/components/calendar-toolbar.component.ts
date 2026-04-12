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
      'bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm animate-in slide-in-from-top-4 duration-500',
      isMobile() ? 'fixed top-3 left-3 right-3 z-[100] p-2 rounded-3xl flex items-center justify-between gap-2 overflow-hidden' : 'flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 lg:p-6 rounded-[2.5rem]'
    )">
      
      <!-- 1. MOBILE-ONLY: Date Context Badge -->
      <div *ngIf="isMobile()" class="flex flex-col pl-3">
         <p class="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">Rango Actual</p>
         <span class="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight truncate max-w-[120px]">{{ currentRangeLabel() }}</span>
      </div>

      <!-- 2. Date Navigation Controls -->
      <div [class]="cn('flex items-center gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-2xl', isMobile() ? 'order-3' : 'order-2 md:order-1 items-center justify-between md:justify-start gap-4')">
        <div class="flex items-center gap-1">
          <button 
            (click)="onPrev.emit()"
            class="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-zinc-700 active:scale-95 transition-all text-zinc-500">
            <lucide-angular [img]="icons.ChevronLeft" class="h-4 w-4"></lucide-angular>
          </button>
          
          <button 
            (click)="onToday.emit()"
            [class]="cn(
              'flex items-center justify-center rounded-xl bg-white dark:bg-zinc-700 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 shadow-sm active:scale-95 transition-all',
              isMobile() ? 'h-9 px-2 text-[8px]' : 'h-10 px-4'
            )">
            Hoy
          </button>

          <button 
            (click)="onNext.emit()"
            class="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-zinc-700 active:scale-95 transition-all text-zinc-500">
            <lucide-angular [img]="icons.ChevronRight" class="h-4 w-4"></lucide-angular>
          </button>
        </div>

        <div *ngIf="!isMobile()" class="hidden sm:flex flex-col ml-4">
          <p class="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Rango Actual</p>
          <span class="text-[13px] font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">{{ currentRangeLabel() }}</span>
        </div>
      </div>

      <!-- 3. View Selector -->
      <div [class]="cn(
        'flex items-center gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-2xl transition-all',
        isMobile() ? 'order-2' : 'order-3 justify-center'
      )">
        @for (mode of viewModes; track mode.mode) {
          <button 
            (click)="onViewChange.emit(mode.mode)"
            [class]="cn(
              'rounded-xl flex items-center gap-2 transition-all duration-300 active:scale-95',
              isMobile() ? 'h-9 w-9 justify-center' : 'h-10 px-4',
              currentView() === mode.mode 
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10' 
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            )"
          >
            <lucide-angular [img]="mode.icon" [class]="isMobile() ? 'h-3.5 w-3.5' : 'h-4 w-4'"></lucide-angular>
            <span *ngIf="!isMobile()" class="hidden lg:block text-[10px] font-black uppercase tracking-widest">{{ mode.label }}</span>
          </button>
        }
      </div>

    </header>
    
    <!-- Header Spacer for Mobile Fixed Position -->
    <div *ngIf="isMobile()" class="h-16"></div>
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
