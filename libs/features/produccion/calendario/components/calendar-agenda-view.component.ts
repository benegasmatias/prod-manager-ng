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
    <div [class]="cn('relative space-y-16 lg:space-y-24 animate-in fade-in slide-in-from-bottom-10 duration-1000', isMobile() ? 'px-4' : 'px-0')">
      
      <!-- Vertical Timeline Decorative Line -->
      <div *ngIf="!isEmpty()" class="absolute left-10 lg:left-14 top-10 bottom-10 w-px bg-gradient-to-b from-primary/20 via-border/5 to-transparent hidden md:block"></div>

      @for (day of columns(); track day.date) {
        @if (day.events.length > 0) {
          <div class="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 relative">
            
            <!-- Day Timeline Marker -->
            <div class="flex items-center gap-6 relative z-10">
               <div [class]="cn(
                 'flex flex-col items-center justify-center rounded-2xl shadow-2xl border transition-all duration-1000 italic font-display shrink-0',
                 isMobile() ? 'h-16 w-16' : 'h-20 w-20',
                 day.isToday ? 'bg-primary border-primary text-white scale-110 shadow-primary/30' : 'bg-surface border-border/5 text-text'
               )">
                  <span class="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 mb-0.5">{{ day.date | date:'EEE' }}</span>
                  <span [class]="cn('font-black tracking-tighter leading-none', isMobile() ? 'text-2xl' : 'text-3xl')">{{ day.date | date:'dd' }}</span>
               </div>
               
               <div class="flex flex-col">
                  <h3 class="text-xs md:text-sm font-black text-text-muted/40 uppercase tracking-[0.5em] italic font-display">{{ day.date | date:'MMMM, yyyy' }}</h3>
                  <div *ngIf="day.isToday" class="flex items-center gap-2 mt-2">
                     <span class="inline-block h-2 w-2 rounded-full bg-primary animate-ping"></span>
                     <span class="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic">Eje de Operación Actual</span>
                  </div>
               </div>

               <!-- Avatars of assignees for that day (Desktop only) -->
               <div class="ml-auto hidden md:flex items-center gap-4">
                  <div class="flex -space-x-3">
                     @for (ev of day.events.slice(0, 5); track ev.id) {
                        <div [class]="cn('h-10 w-10 rounded-2xl border-4 border-surface flex items-center justify-center text-[10px] font-black uppercase text-white shadow-2xl italic', getRiskColor(ev))">
                           {{ ev.code.slice(-1) }}
                        </div>
                     }
                  </div>
               </div>
            </div>

            <!-- Events Container -->
            <div [class]="cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:pl-28 relative')">
               <!-- Horizontal line connector on Desktop -->
               <div class="absolute left-[-40px] top-1/2 w-10 h-px bg-border/10 hidden lg:block"></div>
               
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
         <div class="py-40 text-center space-y-10 animate-in fade-in duration-1000">
            <div class="h-24 w-24 bg-surface-container-low rounded-[3rem] mx-auto flex items-center justify-center text-text-muted/10 border border-border/5 shadow-2xl shadow-text/5">
                <lucide-angular [img]="icons.CalendarIcon" class="h-10 w-10"></lucide-angular>
            </div>
            <div class="space-y-4">
               <h3 class="text-xl font-black text-text uppercase tracking-tighter italic font-display">Cronología Despejada</h3>
               <p class="text-[10px] font-black text-text-muted/20 uppercase tracking-[0.4em] px-12 italic leading-relaxed">No se han detectado eventos de manufactura en el intervalo seleccionado.</p>
            </div>
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
    if (e.risk.level === 'CRITICAL') return 'bg-error';
    if (e.risk.level === 'HIGH') return 'bg-accent';
    return 'bg-text-muted/20';
  }

  cn(...args: any[]) { return args.filter(Boolean).join(' '); }
}
