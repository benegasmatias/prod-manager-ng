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
    <div *ngIf="isMobile()" class="space-y-10 animate-in fade-in duration-1000">
      <!-- Sticky Day Picker -->
      <div class="sticky top-0 z-30 -mx-3 px-3 py-6 bg-surface/80 backdrop-blur-2xl border-b border-border/5">
        <div class="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 px-2">
          @for (day of columns(); track day.date) {
            <button 
              (click)="selectedMobileDay.set(day.date)"
              [class]="cn(
                'flex flex-col items-center justify-center min-w-[5rem] h-24 rounded-[1.8rem] transition-all duration-700 relative border italic',
                isSameDay(selectedMobileDay(), day.date) 
                  ? 'bg-primary border-primary text-white shadow-2xl shadow-primary/40 scale-105 z-10' 
                  : 'bg-surface-container-low text-text-muted/30 border-border/5'
              )"
            >
              <span class="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1 leading-none">{{ day.date | date:'EEE' }}</span>
              <span class="text-2xl font-black tracking-tighter tabular-nums leading-none">{{ day.date | date:'dd' }}</span>
              
              @if (day.events.length > 0 && !isSameDay(selectedMobileDay(), day.date)) {
                <div class="absolute bottom-3 h-1.5 w-1.5 rounded-full bg-primary/40 shadow-sm"></div>
              }
            </button>
          }
        </div>
      </div>
 
      <!-- Events for Selected Day -->
      <div class="space-y-6 px-1 min-h-[400px]">
        @let activeDay = getSelectedDayColumn();
        @if (activeDay) {
          <div class="flex items-center justify-between mb-6 px-4">
            <h3 class="text-xs font-black text-text uppercase tracking-[0.3em] italic font-display">
              {{ activeDay.date | date:'EEEE, d MMMM' }}
            </h3>
            <span class="text-[9px] font-black text-text-muted/20 uppercase tracking-[0.4em] italic">{{ activeDay.events.length }} ítems</span>
          </div>
 
          <div class="grid grid-cols-1 gap-6">
            @for (event of activeDay.events; track event.id) {
              <app-calendar-event-card 
                [event]="event" 
                density="AGENDA"
                (onClick)="onEventClick.emit($event)"
                class="animate-in slide-in-from-bottom-6 duration-700"
              ></app-calendar-event-card>
            }
          </div>
 
          @if (activeDay.events.length === 0) {
            <div class="flex flex-col items-center justify-center py-32 opacity-20">
              <div class="h-20 w-20 bg-surface-container-low rounded-[2.5rem] flex items-center justify-center text-text-muted/20 border border-border/5 mb-6">
                <lucide-angular [img]="icons.Info" class="h-8 w-8"></lucide-angular>
              </div>
              <p class="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted/40 italic">Ciclo de Producción Despejado</p>
            </div>
          }
        }
      </div>
    </div>
 
    <!-- DESKTOP VIEW: 7 Column Grid -->
    <div *ngIf="!isMobile()" class="grid grid-cols-1 md:grid-cols-7 gap-px bg-border/5 rounded-[4rem] overflow-hidden border border-border/5 shadow-2xl backdrop-blur-3xl group">
      
      @for (day of columns(); track day.date) {
        <div 
          [class]="cn(
            'min-h-[700px] flex flex-col transition-all duration-1000 border-r border-border/5 last:border-r-0',
            day.isToday ? 'bg-primary/5' : 'bg-surface-container-low/20 hover:bg-surface-container-low/40'
          )"
        >
          <!-- Column Header -->
          <div [class]="cn(
            'p-8 text-center border-b border-border/5 space-y-3 transition-all duration-700',
            day.isToday ? 'bg-surface shadow-2xl shadow-primary/5' : ''
          )">
            <p class="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted/20 italic">{{ day.date | date:'EEEE' }}</p>
            <div class="flex items-center justify-center gap-3">
               <span [class]="cn(
                 'text-4xl font-black tracking-tighter tabular-nums font-display italic leading-none',
                 day.isToday ? 'text-primary' : 'text-text'
               )">
                 {{ day.date | date:'dd' }}
               </span>
               <div *ngIf="day.isToday" class="px-3 py-1 bg-primary text-white text-[8px] font-black uppercase rounded-full shadow-2xl shadow-primary/40 italic">Hoy</div>
            </div>
            <p class="text-[9px] font-black text-text-muted/30 uppercase tracking-[0.5em] italic">{{ day.date | date:'MMMM' }}</p>
          </div>
 
          <!-- Column Tasks -->
          <div class="flex-1 p-6 space-y-6 overflow-y-auto max-h-[1200px] hide-scrollbar custom-scroll">
            @for (event of day.events; track event.id) {
               <app-calendar-event-card 
                 [event]="event" 
                 [density]="density()"
                 (onClick)="onEventClick.emit($event)"
                 class="animate-in slide-in-from-bottom-8 duration-1000"
               ></app-calendar-event-card>
            }
 
            @if (day.events.length === 0) {
              <div class="flex flex-col items-center justify-center py-24 opacity-10 grayscale transition-all duration-1000 hover:opacity-30">
                 <div class="h-14 w-14 rounded-[1.8rem] border-2 border-dashed border-text-muted/20 mb-4 flex items-center justify-center">
                    <lucide-angular [img]="icons.Info" class="h-5 w-5 text-text-muted/30"></lucide-angular>
                 </div>
                 <p class="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted/40 italic">Sin Actividad</p>
              </div>
            }
          </div>
 
          <!-- Column Footer: Summary -->
          <div class="p-6 bg-surface/50 border-t border-border/5 flex items-center justify-between">
             <div class="flex items-center gap-3">
                <div [class]="cn('h-2 w-2 rounded-full', day.events.length > 0 ? 'bg-primary animate-pulse' : 'bg-text-muted/10')"></div>
                <span class="text-[11px] font-black tabular-nums text-text-muted/40 uppercase tracking-widest italic">{{ day.events.length }} ítems</span>
             </div>
             @if (hasCriticalTask(day)) {
               <div class="flex items-center gap-2">
                  <div class="h-2 w-2 rounded-full bg-error animate-ping"></div>
                  <span class="text-[9px] font-black tabular-nums text-error uppercase tracking-[0.2em] italic">Intervención</span>
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
