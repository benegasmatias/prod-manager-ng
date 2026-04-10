import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Info } from 'lucide-angular';
import { CalendarOrderEvent, DayColumn } from '../models/calendar.models';
import { CalendarEventCardComponent, CardDensity } from './calendar-event-card.component';

@Component({
  selector: 'app-calendar-week-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CalendarEventCardComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl">
      
      @for (day of columns(); track day.date) {
        <div 
          [class]="cn(
            'min-h-[600px] flex flex-col bg-zinc-50/80 dark:bg-zinc-950/40 backdrop-blur-md transition-colors',
            day.isToday ? 'bg-primary/5 dark:bg-primary/10' : ''
          )"
        >
          <!-- Column Header -->
          <div [class]="cn(
            'p-6 text-center border-b border-zinc-100 dark:border-zinc-800/50 space-y-1 transition-all',
            day.isToday ? 'bg-white dark:bg-zinc-900 shadow-sm' : ''
          )">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{{ day.date | date:'EEEE' }}</p>
            <div class="flex items-center justify-center gap-2">
               <span [class]="cn(
                 'text-2xl font-black tracking-tighter tabular-nums',
                 day.isToday ? 'text-primary' : 'text-zinc-900 dark:text-zinc-100'
               )">
                 {{ day.date | date:'dd' }}
               </span>
               <span *ngIf="day.isToday" class="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase rounded-full">Hoy</span>
            </div>
            <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{{ day.date | date:'MMMM' }}</p>
          </div>

          <!-- Column Tasks -->
          <div class="flex-1 p-4 space-y-4 overflow-y-auto max-h-[1000px] hide-scrollbar custom-scroll">
            @for (event of day.events; track event.id) {
               <app-calendar-event-card 
                 [event]="event" 
                 [density]="density()"
                 (onClick)="onEventClick.emit($event)"
                 class="animate-in slide-in-from-bottom-4 duration-500"
               ></app-calendar-event-card>
            }

            @if (day.events.length === 0) {
              <div class="flex flex-col items-center justify-center py-20 opacity-20 grayscale transition-all hover:opacity-40">
                 <div class="h-10 w-10 rounded-2xl border-2 border-dashed border-zinc-400 mb-2 flex items-center justify-center">
                    <lucide-angular [img]="icons.Info" class="h-4 w-4 text-zinc-400"></lucide-angular>
                 </div>
                 <p class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Sin Entregas</p>
              </div>
            }
          </div>

          <!-- Column Footer: Summary -->
          <div class="p-4 bg-white/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
             <div class="flex items-center gap-1.5">
                <div class="h-1.5 w-1.5 rounded-full bg-zinc-300"></div>
                <span class="text-[9px] font-black tabular-nums text-zinc-400">{{ day.events.length }} ítems</span>
             </div>
             @if (hasCriticalTask(day)) {
               <div class="flex items-center gap-1.5">
                  <div class="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></div>
                  <span class="text-[9px] font-black tabular-nums text-red-500 uppercase tracking-tighter">Acción Requerida</span>
               </div>
             }
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: block; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
  `]
})
export class CalendarWeekViewComponent {
  events = input.required<CalendarOrderEvent[]>();
  currentDate = input.required<Date>();
  density = input<CardDensity>('FULL');
  onEventClick = output<CalendarOrderEvent>();

  icons = { Info };

  columns = computed(() => {
    const start = this.getStartOfWeek(this.currentDate());
    const days: DayColumn[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      d.setHours(0, 0, 0, 0);

      const columnEvents = this.events().filter(e => {
        if (!e.dueDate) return false;
        const due = new Date(e.dueDate);
        due.setHours(0, 0, 0, 0);
        return due.getTime() === d.getTime();
      });

      days.push({
        date: d,
        isToday: d.getTime() === today.getTime(),
        events: this.sortEvents(columnEvents)
      });
    }
    return days;
  });

  private getStartOfWeek(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes inicio
    return new Date(new Date(d).setDate(diff));
  }

  private sortEvents(events: CalendarOrderEvent[]): CalendarOrderEvent[] {
    // Prioritize Risk then Urgency
    const riskMap: Record<string, number> = { 'CRITICAL': 5, 'HIGH': 4, 'MEDIUM': 3, 'LOW': 2, 'NONE': 1 };
    return events.sort((a, b) => riskMap[b.risk.level] - riskMap[a.risk.level]);
  }

  hasCriticalTask(day: DayColumn): boolean {
    return day.events.some(e => e.risk.level === 'CRITICAL' || e.risk.level === 'HIGH');
  }

  cn(...args: any[]) { return args.filter(Boolean).join(' '); }
}
