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
    <div class="bg-surface-container-low/30 backdrop-blur-3xl rounded-[4rem] border border-border/5 shadow-2xl shadow-text/5 overflow-hidden animate-in fade-in duration-1000">
      
      <!-- Days of Week Header -->
      <div class="grid grid-cols-7 border-b border-border/5 bg-surface/50">
         @for (day of daysOfWeek; track day) {
           <div class="py-4 sm:py-6 text-center">
              <span class="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted/20 italic">
                {{ isMobile() ? day.charAt(0) : day }}
              </span>
           </div>
         }
      </div>
 
      <!-- Grid -->
      <div [class]="cn(
        'grid grid-cols-7 gap-px bg-border/5',
        isMobile() ? 'auto-rows-[80px]' : 'auto-rows-[140px] lg:auto-rows-[180px]'
      )">
         @for (cell of calendarCells(); track cell.date.getTime()) {
            <div 
              [class]="cn(
                'bg-surface/40 flex flex-col transition-all duration-700 hover:bg-surface/80 group/cell',
                isMobile() ? 'p-2 items-center justify-center gap-2' : 'p-4 lg:p-6 gap-3',
                cell.isCurrentMonth ? '' : 'bg-surface-container-low/20 opacity-30 grayscale blur-[1px]',
                cell.isToday ? 'bg-primary/5' : ''
              )"
            >
              <div [class]="cn('flex items-center justify-between', isMobile() ? 'flex-col gap-2' : 'w-full')">
                 <span [class]="cn(
                   'font-black tabular-nums font-display italic transition-all duration-700',
                   isMobile() ? 'text-[12px]' : 'text-sm lg:text-base',
                   cell.isToday ? 'text-primary scale-125' : 'text-text-muted/30 group-hover/cell:text-text'
                 )">{{ cell.date | date:'dd' }}</span>
                 
                 @if (cell.events.length > 0 && isMobile()) {
                    <div class="flex gap-1">
                       @for(dot of cell.events.slice(0, 3); track dot.id) {
                          <span [class]="cn('h-1.5 w-1.5 rounded-full shadow-2xl shadow-current', getStatusDotColor(dot))"></span>
                       }
                    </div>
                 }
                 @if (cell.events.length > 0 && !isMobile()) {
                    <div class="flex items-center gap-2">
                       <span class="text-[9px] font-black text-text-muted/10 italic">#{{ cell.events.length }}</span>
                       <span [class]="cn('h-2 w-2 rounded-full shadow-2xl shadow-primary/40', cell.events.some(e => e.risk.level === 'CRITICAL') ? 'bg-error animate-pulse' : 'bg-primary')"></span>
                    </div>
                 }
              </div>
 
              <!-- Compact Events List (Desktop Only) -->
              <div *ngIf="!isMobile()" class="flex-1 space-y-2 overflow-y-auto no-scrollbar pt-1 lg:pt-0">
                 @for (event of cell.events.slice(0, 3); track event.id) {
                    <div 
                      (click)="onEventClick.emit(event)"
                      [class]="cn(
                        'px-3 py-1.5 rounded-xl text-[8px] lg:text-[9px] font-black truncate transition-all duration-500 active:scale-95 cursor-pointer border uppercase tracking-widest italic',
                        getEventClass(event)
                      )"
                    >
                       <span class="opacity-30 mr-1 lg:inline hidden">#{{ event.code.slice(-2) }}</span>
                       {{ event.items[0]?.nombreProducto || 'Orden' }}
                    </div>
                 }
                 @if (cell.events.length > 3) {
                    <p class="text-[8px] font-black text-text-muted/20 uppercase tracking-[0.2em] pl-2 italic">+ {{ cell.events.length - 3 }} SECUENCIAS</p>
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
      return 'bg-error/10 text-error border-error/20 shadow-2xl shadow-error/5';
    if (e.risk.level === 'HIGH' || e.urgency === 'TODAY') 
      return 'bg-accent/10 text-accent border-accent/20 shadow-2xl shadow-accent/5';
    if (e.status === 'DONE' || e.status === 'DELIVERED') 
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-2xl shadow-emerald-500/5';
    
    return 'bg-surface border-border/5 text-text-muted/40 hover:text-text';
  }

  getStatusDotColor(e: CalendarOrderEvent) {
    if (e.risk.level === 'CRITICAL') return 'bg-error';
    if (e.risk.level === 'HIGH') return 'bg-accent';
    return 'bg-primary/20';
  }

  cn(...args: any[]) { return cn(...args); }
}
