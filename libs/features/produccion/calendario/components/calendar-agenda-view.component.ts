import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar as CalendarIcon, ArrowRight } from 'lucide-angular';
import { CalendarOrderEvent, DayColumn } from '../models/calendar.models';
import { CalendarEventCardComponent } from './calendar-event-card.component';

@Component({
  selector: 'app-calendar-agenda-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CalendarEventCardComponent],
  template: `
    <div [class]="cn('space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700', isMobile() ? 'px-1' : '')">
      
      @for (day of columns(); track day.date) {
        @if (day.events.length > 0) {
          <div class="space-y-4">
            <!-- Day Header Sticky -->
            <div [class]="cn(
               'sticky z-20 bg-[#fafbfc]/90 dark:bg-zinc-950/90 backdrop-blur-md py-4 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 px-2 lg:px-4',
               isMobile() ? 'top-0 -mx-4 px-6' : 'top-0'
            )">
              <div class="flex items-center gap-4">
                 <div [class]="cn(
                   'rounded-2xl flex flex-col items-center justify-center shadow-sm border transition-all',
                   isMobile() ? 'h-14 w-14' : 'h-12 w-12',
                   day.isToday ? 'bg-primary border-primary text-white scale-105 shadow-lg shadow-primary/20' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'
                 )">
                    <span class="text-[10px] font-black uppercase tracking-tighter opacity-70">{{ day.date | date:'EEE' }}</span>
                    <span [class]="cn('font-black tracking-tighter leading-none', isMobile() ? 'text-xl' : 'text-lg')">{{ day.date | date:'dd' }}</span>
                 </div>
                 <div>
                    <h3 class="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">{{ day.date | date:'MMMM, yyyy' }}</h3>
                    <div class="flex items-center gap-2">
                       <span *ngIf="day.isToday" class="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Entrega Hoy</span>
                       <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{{ day.events.length }} ítems programados</span>
                    </div>
                 </div>
              </div>

              <div class="hidden sm:flex items-center gap-2">
                 <div class="flex -space-x-2">
                    @for (ev of day.events.slice(0, 3); track ev.id) {
                       <div [class]="cn('h-6 w-6 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[8px] font-black uppercase text-white', getRiskColor(ev))">
                          {{ ev.code.slice(-1) }}
                       </div>
                    }
                 </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-2 lg:px-0">
               @for (event of day.events; track event.id) {
                  <app-calendar-event-card 
                    [event]="event" 
                    density="AGENDA"
                    (onClick)="onEventClick.emit($event)"
                    class="w-full"
                  ></app-calendar-event-card>
               }
            </div>
          </div>
        }
      }

      @if (isEmpty()) {
         <div class="py-40 text-center space-y-6">
            <div class="h-20 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem] mx-auto flex items-center justify-center text-zinc-300">
               <lucide-angular [img]="icons.CalendarIcon" class="h-10 w-10"></lucide-angular>
            </div>
            <p class="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Agenda libre para este periodo</p>
         </div>
      }

    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class CalendarAgendaViewComponent {
  events = input.required<CalendarOrderEvent[]>();
  currentDate = input.required<Date>();
  isMobile = input<boolean>(false);
  onEventClick = output<CalendarOrderEvent>();

  icons = { CalendarIcon, ArrowRight };

  columns = computed(() => {
    const start = new Date(this.currentDate());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 30); // 30 days agenda

    const days: DayColumn[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      
      const columnEvents = this.events().filter(e => {
        if (!e.dueDate) return false;
        const due = new Date(e.dueDate);
        due.setHours(0, 0, 0, 0);
        return due.getTime() === d.getTime();
      });

      if (columnEvents.length > 0 || d.getTime() === today.getTime()) {
        days.push({
          date: d,
          isToday: d.getTime() === today.getTime(),
          events: columnEvents.sort((a,b) => this.riskScore(b) - this.riskScore(a))
        });
      }
    }
    return days;
  });

  isEmpty = computed(() => !this.columns().some(d => d.events.length > 0));

  private riskScore(e: CalendarOrderEvent): number {
    const map: Record<string, number> = { 'CRITICAL': 5, 'HIGH': 4, 'MEDIUM': 3, 'LOW': 2, 'NONE': 1 };
    return map[e.risk.level];
  }

  getRiskColor(e: CalendarOrderEvent): string {
    if (e.risk.level === 'CRITICAL') return 'bg-red-500';
    if (e.risk.level === 'HIGH') return 'bg-amber-500';
    return 'bg-zinc-400';
  }

  cn(...args: any[]) { return args.filter(Boolean).join(' '); }
}
