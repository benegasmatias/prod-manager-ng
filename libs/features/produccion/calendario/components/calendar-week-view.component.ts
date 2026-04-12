import { Component, input, output, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Info } from 'lucide-angular';
import { CalendarOrderEvent, DayColumn } from '../models/calendar.models';
import { CalendarEventCardComponent, CardDensity } from './calendar-event-card.component';

@Component({
  selector: 'app-calendar-week-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CalendarEventCardComponent],
  template: `
    <!-- MOBILE VIEW: Horizontal Day Picker + Selected Day List -->
    <div *ngIf="isMobile()" class="space-y-6 animate-in fade-in duration-500">
      <!-- Sticky Day Picker -->
      <div class="sticky top-0 z-30 -mx-3 px-3 py-4 bg-[#fafbfc]/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div class="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          @for (day of columns(); track day.date) {
            <button 
              (click)="selectedMobileDay.set(day.date)"
              [class]="cn(
                'flex flex-col items-center justify-center min-w-[4.5rem] h-20 rounded-2xl transition-all duration-300 relative',
                isSameDay(selectedMobileDay(), day.date) 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 z-10' 
                  : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800'
              )"
            >
              <span class="text-[10px] font-black uppercase tracking-tighter opacity-60">{{ day.date | date:'EEE' }}</span>
              <span class="text-xl font-black tracking-tighter">{{ day.date | date:'dd' }}</span>
              
              @if (day.events.length > 0 && !isSameDay(selectedMobileDay(), day.date)) {
                <div class="absolute bottom-2 h-1 w-1 rounded-full bg-primary/50"></div>
              }
            </button>
          }
        </div>
      </div>

      <!-- Events for Selected Day -->
      <div class="space-y-4 px-1 min-h-[400px]">
        @let activeDay = getSelectedDayColumn();
        @if (activeDay) {
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">
              {{ activeDay.date | date:'EEEE, d MMMM' }}
            </h3>
            <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{{ activeDay.events.length }} compromisos</span>
          </div>

          @for (event of activeDay.events; track event.id) {
            <app-calendar-event-card 
              [event]="event" 
              density="AGENDA"
              (onClick)="onEventClick.emit($event)"
              class="animate-in slide-in-from-bottom-4 duration-500"
            ></app-calendar-event-card>
          }

          @if (activeDay.events.length === 0) {
            <div class="flex flex-col items-center justify-center py-20 opacity-30">
              <div class="h-16 w-16 bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] flex items-center justify-center text-zinc-300 mb-4">
                <lucide-angular [img]="icons.Info" class="h-8 w-8"></lucide-angular>
              </div>
              <p class="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Día sin programaciones</p>
            </div>
          }
        }
      </div>
    </div>

    <!-- DESKTOP VIEW: 7 Column Grid -->
    <div *ngIf="!isMobile()" class="grid grid-cols-1 md:grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl">
      
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
  isMobile = input<boolean>(false);
  onEventClick = output<CalendarOrderEvent>();

  selectedMobileDay = signal<Date>(new Date());
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

  getSelectedDayColumn = computed(() => {
    return this.columns().find(c => this.isSameDay(c.date, this.selectedMobileDay()));
  });

  private getStartOfWeek(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes inicio
    return new Date(new Date(d).setDate(diff));
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
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
