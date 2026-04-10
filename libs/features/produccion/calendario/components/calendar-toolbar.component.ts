import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Columns, Grid, List } from 'lucide-angular';
import { CalendarViewMode } from '../models/calendar.models';

@Component({
  selector: 'app-calendar-toolbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl p-4 lg:p-6 rounded-[2.5rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm animate-in slide-in-from-top-4 duration-500">
      
      <!-- Date Navigation -->
      <div class="flex items-center justify-between md:justify-start gap-4 order-2 md:order-1">
        <div class="flex items-center gap-1.5 p-1.5 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-2xl">
          <button 
            (click)="onPrev.emit()"
            class="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm active:scale-95 transition-all text-zinc-500">
            <lucide-angular [img]="icons.ChevronLeft" class="h-4 w-4"></lucide-angular>
          </button>
          
          <button 
            (click)="onToday.emit()"
            class="px-4 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-700 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 shadow-sm hover:shadow-md active:scale-95 transition-all">
            Hoy
          </button>

          <button 
            (click)="onNext.emit()"
            class="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm active:scale-95 transition-all text-zinc-500">
            <lucide-angular [img]="icons.ChevronRight" class="h-4 w-4"></lucide-angular>
          </button>
        </div>

        <div class="hidden sm:flex flex-col">
          <p class="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Rango Actual</p>
          <span class="text-[13px] font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">{{ currentRangeLabel() }}</span>
        </div>
      </div>

      <!-- Center (Visible only on mobile for date context) -->
      <div class="sm:hidden text-center order-1 mb-2">
         <span class="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{{ currentRangeLabel() }}</span>
      </div>

      <!-- View Selector -->
      <div class="flex items-center justify-center gap-1.5 p-1.5 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-2xl order-3">
        @for (mode of viewModes; track mode.mode) {
          <button 
            (click)="onViewChange.emit(mode.mode)"
            [class]="cn(
              'h-10 px-4 rounded-xl flex items-center gap-2 transition-all duration-300 active:scale-95',
              currentView() === mode.mode 
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10' 
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            )"
          >
            <lucide-angular [img]="mode.icon" class="h-4 w-4"></lucide-angular>
            <span class="hidden lg:block text-[10px] font-black uppercase tracking-widest">{{ mode.label }}</span>
          </button>
        }
      </div>

    </header>
  `,
  styles: [`:host { display: block; }`]
})
export class CalendarToolbarComponent {
  currentRangeLabel = input.required<string>();
  currentView = input.required<CalendarViewMode>();
  
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
