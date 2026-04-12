import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertCircle } from 'lucide-angular';
import { CalendarOrderEvent } from '../models/calendar.models';
import { cn } from '@shared/utils';

@Component({
  selector: 'app-calendar-month-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden animate-in fade-in duration-700">
      
      <!-- Days of Week Header -->
      <div class="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
         @for (day of daysOfWeek; track day) {
           <div class="py-2 sm:py-4 text-center">
              <span class="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {{ isMobile() ? day.charAt(0) : day }}
              </span>
           </div>
         }
      </div>

      <!-- Grid -->
      <div [class]="cn(
        'grid grid-cols-7 gap-px bg-zinc-100 dark:bg-zinc-800',
        isMobile() ? 'auto-rows-[60px]' : 'auto-rows-[120px] lg:auto-rows-[160px]'
      )">
         @for (cell of calendarCells(); track cell.date.getTime()) {
            <div 
              [class]="cn(
                'bg-white dark:bg-zinc-950 flex flex-col transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900',
                isMobile() ? 'p-1 items-center justify-center gap-1' : 'p-2 lg:p-4 gap-1 lg:gap-2',
                cell.isCurrentMonth ? '' : 'bg-zinc-50/50 dark:bg-zinc-900/50 opacity-40 grayscale',
                cell.isToday ? 'bg-primary/5 dark:bg-primary/10' : ''
              )"
            >
              <div [class]="cn('flex items-center justify-between', isMobile() ? 'flex-col gap-1' : 'w-full')">
                 <span [class]="cn(
                   'font-black tabular-nums',
                   isMobile() ? 'text-[10px]' : 'text-xs lg:text-sm',
                   cell.isToday ? 'text-primary' : 'text-zinc-400'
                 )">{{ cell.date | date:'dd' }}</span>
                 
                 @if (cell.events.length > 0 && isMobile()) {
                    <div class="flex gap-0.5">
                       @for(dot of cell.events.slice(0, 3); track dot.id) {
                          <span [class]="cn('h-1 w-1 rounded-full', getStatusDotColor(dot))"></span>
                       }
                    </div>
                 }
                 @if (cell.events.length > 0 && !isMobile()) {
                    <span class="h-1.5 w-1.5 rounded-full bg-primary shadow-sm shadow-primary/40"></span>
                 }
              </div>

              <!-- Compact Events List (Desktop Only) -->
              <div *ngIf="!isMobile()" class="flex-1 space-y-1 lg:space-y-1.5 overflow-y-auto no-scrollbar pt-1 lg:pt-0">
                 @for (event of cell.events.slice(0, 3); track event.id) {
                    <div 
                      (click)="onEventClick.emit(event)"
                      [class]="cn(
                        'px-1.5 py-0.5 lg:py-1 rounded-md text-[7px] lg:text-[8px] font-bold truncate transition-all active:scale-95 cursor-pointer border',
                        getEventClass(event)
                      )"
                    >
                       <span class="font-black opacity-50 mr-1 lg:inline hidden">#{{ event.code.slice(-4) }}</span>
                       {{ event.items[0]?.nombreProducto || 'Orden' }}
                    </div>
                 }
                 @if (cell.events.length > 3) {
                    <p class="text-[7px] lg:text-[8px] font-black text-zinc-400 uppercase tracking-tighter pl-1">+ {{ cell.events.length - 3 }} más</p>
                 }
              </div>
            </div>
         }
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `]
})
export class CalendarMonthViewComponent {
  events = input.required<CalendarOrderEvent[]>();
  currentDate = input.required<Date>();
  isMobile = input<boolean>(false);
  onEventClick = output<CalendarOrderEvent>();

  daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  calendarCells = computed(() => {
    const d = this.currentDate();
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    
    // Adjust to start of week (Sunday)
    const firstDay = new Date(start);
    firstDay.setDate(start.getDate() - firstDay.getDay());

    const cells = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    // 42 cells for a full 6x7 grid
    for(let i = 0; i < 42; i++) {
      const current = new Date(firstDay);
      current.setDate(firstDay.getDate() + i);
      current.setHours(0,0,0,0);

      const cellEvents = this.events().filter(e => {
        if (!e.dueDate) return false;
        const due = new Date(e.dueDate);
        due.setHours(0,0,0,0);
        return due.getTime() === current.getTime();
      });

      cells.push({
        date: current,
        isCurrentMonth: current.getMonth() === d.getMonth(),
        isToday: current.getTime() === today.getTime(),
        events: cellEvents
      });
    }
    return cells;
  });

  getEventClass(e: CalendarOrderEvent) {
    if (e.risk.level === 'CRITICAL' || e.urgency === 'OVERDUE') 
      return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:border-red-900/40';
    if (e.risk.level === 'HIGH' || e.urgency === 'TODAY') 
      return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40';
    if (e.status === 'DONE' || e.status === 'DELIVERED') 
      return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40';
    
    return 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700';
  }

  getStatusDotColor(e: CalendarOrderEvent) {
    if (e.risk.level === 'CRITICAL') return 'bg-red-500';
    if (e.risk.level === 'HIGH') return 'bg-amber-500';
    return 'bg-zinc-400';
  }

  cn(...args: any[]) { return cn(...args); }
}
