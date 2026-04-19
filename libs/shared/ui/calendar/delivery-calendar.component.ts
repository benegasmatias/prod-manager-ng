import { Component, input, output, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight, Calendar } from 'lucide-angular';
import { PedidosApiService } from '@core/api/pedidos.api.service';
import { SessionService } from '@core/session/session.service';

interface DayWorkload {
  date: Date;
  count: number;
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-delivery-calendar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden w-80">
      <!-- Header -->
      <div class="p-6 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div class="flex flex-col">
           <span class="text-[10px] font-black uppercase tracking-widest text-primary">{{ currentYear() }}</span>
           <span class="text-sm font-black text-zinc-800 dark:text-white">{{ monthNames[currentMonth()] }}</span>
        </div>
        <div class="flex gap-1">
          <button type="button" (click)="prevMonth()" class="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition-all">
            <lucide-angular [img]="icons.ChevronLeft" class="h-4 w-4"></lucide-angular>
          </button>
          <button type="button" (click)="nextMonth()" class="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition-all">
            <lucide-angular [img]="icons.ChevronRight" class="h-4 w-4"></lucide-angular>
          </button>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="p-4">
        <div class="grid grid-cols-7 mb-2">
          @for (day of weekDays; track day) {
            <span class="text-[9px] font-black uppercase text-zinc-500 dark:text-zinc-400 text-center py-2">{{ day }}</span>
          }
        </div>

        <div class="grid grid-cols-7 gap-1">
          @for (day of calendarDays(); track day.date.getTime()) {
            <button 
              type="button"
              (click)="selectDate(day.date)"
              [disabled]="!day.isCurrentMonth"
              [class]="cn(
                'relative h-10 w-full rounded-xl flex flex-col items-center justify-center transition-all group',
                day.isCurrentMonth ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50' : 'opacity-10 cursor-default',
                day.isSelected ? '!bg-primary text-white shadow-lg' : 'text-zinc-900 dark:text-zinc-100',
                day.isToday && !day.isSelected ? 'ring-2 ring-primary/30 text-primary font-black' : ''
              )"
            >
              <span class="text-[11px]">{{ day.date.getDate() }}</span>
              
              <!-- Workload Bubble -->
              @if (day.count > 0 && day.isCurrentMonth) {
                <div 
                  [class]="cn(
                    'absolute -top-1 -right-1 h-[18px] min-w-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white dark:border-zinc-900 shadow-sm z-20',
                    day.isSelected ? 'bg-white text-primary' : 'bg-primary text-white'
                  )"
                >
                  {{ day.count }}
                </div>
              }
            </button>
          }
        </div>
      </div>

      <!-- Footer Info -->
      <div class="px-6 py-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
        <div class="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <lucide-angular [img]="icons.Calendar" class="h-4 w-4"></lucide-angular>
        </div>
        <div>
          <p class="text-[9px] font-black uppercase text-zinc-400 tracking-widest leading-none mb-1">Carga de Hoy</p>
          <p class="text-xs font-black text-zinc-800 dark:text-white">{{ todayLoad() }} Pedidos Pendientes</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class DeliveryCalendarComponent implements OnInit {
  private api = inject(PedidosApiService);
  private session = inject(SessionService);

  selectedDate = input<Date | string | undefined>();
  dateChange = output<Date>();

  currentMonth = signal(new Date().getMonth());
  currentYear = signal(new Date().getFullYear());
  workload = signal<Record<string, number>>({});

  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  weekDays = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  icons = { ChevronLeft, ChevronRight, Calendar };

  calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: DayWorkload[] = [];
    
    // Previous month padding
    const startPadding = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(this.createDay(new Date(year, month - 1, prevMonthLastDay - i), false));
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(this.createDay(new Date(year, month, i), true));
    }
    
    // Next month padding
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
        days.push(this.createDay(new Date(year, month + 1, i), false));
    }
    
    return days;
  });

  todayLoad = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.workload()[today] || 0;
  });

  ngOnInit() {
    this.loadWorkload();
  }

  async loadWorkload() {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    try {
      // Load current month and surroundings
      const start = new Date(this.currentYear(), this.currentMonth(), 1).toISOString().split('T')[0];
      const end = new Date(this.currentYear(), this.currentMonth() + 1, 0).toISOString().split('T')[0];
      
      const data = await this.api.getWorkload(businessId, start, end);
      const map: Record<string, number> = {};
      data.forEach(item => {
        // item.date is from DB
        const d = new Date(item.date).toISOString().split('T')[0];
        map[d] = parseInt(item.count);
      });
      this.workload.set(map);
    } catch (e) {
      console.error('Error loading workload', e);
    }
  }

  private createDay(date: Date, isCurrentMonth: boolean): DayWorkload {
    const dateStr = date.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const selectedStr = this.selectedDate() ? new Date(this.selectedDate()!).toISOString().split('T')[0] : '';

    return {
      date,
      count: this.workload()[dateStr] || 0,
      isSelected: dateStr === selectedStr,
      isToday: dateStr === todayStr,
      isCurrentMonth
    };
  }

  prevMonth() {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
    this.loadWorkload();
  }

  nextMonth() {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
    this.loadWorkload();
  }

  selectDate(date: Date) {
    this.dateChange.emit(date);
  }

  cn(...args: any[]) {
    return args.filter(Boolean).join(' ');
  }
}
