import { Component, inject, signal, computed, OnInit, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, AlertCircle, RefreshCw, Layers, Filter, X } from 'lucide-angular';
import { CalendarService } from './services/calendar.service';
import { CalendarStoreService } from './services/calendar-store.service';
import { SessionService } from '@core/session/session.service';
import { CalendarOrderEvent, CalendarViewMode, CalendarFilters } from './models/calendar.models';
import { CalendarToolbarComponent } from './components/calendar-toolbar.component';
import { CalendarWeekViewComponent } from './components/calendar-week-view.component';
import { CalendarAgendaViewComponent } from './components/calendar-agenda-view.component';
import { CalendarMonthViewComponent } from './components/calendar-month-view.component';
import { CalendarFiltersComponent } from './components/calendar-filters.component';
import { Employee } from '@shared/models';
import { PedidosApiService } from '@core/api/pedidos.api.service';
import { getNegocioConfig } from '@shared/utils';

@Component({
  selector: 'app-calendario-page',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    CalendarToolbarComponent, 
    CalendarWeekViewComponent,
    CalendarAgendaViewComponent,
    CalendarMonthViewComponent,
    CalendarFiltersComponent
  ],
  template: `
    <div class="min-h-screen bg-[#fafbfc] dark:bg-zinc-950 p-4 lg:p-10 space-y-6 lg:space-y-10 animate-in fade-in duration-700 relative overflow-x-hidden">
      
      <!-- Toolbar Orchestrator (Adaptive) -->
      <app-calendar-toolbar 
        [currentRangeLabel]="displayDateRange()"
        [currentView]="viewMode()"
        (onPrev)="navigateRange(-1)"
        (onNext)="navigateRange(1)"
        (onToday)="setToday()"
        (onViewChange)="setViewMode($event)">
      </app-calendar-toolbar>

      <div class="flex flex-col lg:flex-row gap-8 items-start relative">
        
        <!-- Collapsible Sidebar Toggle (Mobile/Tablet) -->
        <button 
          (click)="showFilters.set(!showFilters())"
          class="lg:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all">
          <lucide-angular [img]="showFilters() ? icons.X : icons.Filter" class="h-6 w-6"></lucide-angular>
        </button>

        <!-- Left: Context Filters (Adaptive Drawer on Mobile/Tablet) -->
        <aside [class]="cn(
          'w-full lg:w-80 space-y-8 lg:sticky lg:top-10 transition-all duration-500 ease-in-out',
          'fixed lg:relative inset-0 lg:inset-auto z-40 bg-[#fafbfc]/90 dark:bg-zinc-950/90 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-6 lg:p-0 overflow-y-auto lg:overflow-visible',
          showFilters() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )">
           <div class="flex items-center justify-between lg:hidden mb-6">
              <h2 class="text-xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter">Filtros</h2>
              <button (click)="showFilters.set(false)" class="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                 <lucide-angular [img]="icons.X" class="h-5 w-5"></lucide-angular>
              </button>
           </div>

           <app-calendar-filters 
             [employees]="employees()"
             [statusOptions]="statusOptions()"
             (onFiltersChange)="handleFilterChange($event)">
           </app-calendar-filters>

           <!-- Quick Summary Card -->
           <div class="p-8 rounded-[2.5rem] bg-zinc-900 text-white shadow-2xl relative overflow-hidden group">
              <div class="absolute -top-10 -right-10 h-32 w-32 bg-primary/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
              <div class="relative z-10 flex flex-col gap-6">
                 <div class="flex flex-col">
                    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Volumen en Rango</span>
                    <p class="text-4xl font-black tabular-nums tracking-tighter">{{ filteredEvents().length }} <span class="text-xs text-primary italic lowercase">u.</span></p>
                 </div>
                 <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col">
                       <span class="text-[8px] font-black uppercase tracking-widest text-zinc-500">En Riesgo</span>
                       <p class="text-xl font-black text-red-500">{{ riskyCount() }}</p>
                    </div>
                    <div class="flex flex-col">
                       <span class="text-[8px] font-black uppercase tracking-widest text-zinc-500">Vencidos</span>
                       <p class="text-xl font-black text-zinc-400">{{ overdueCount() }}</p>
                    </div>
                 </div>
              </div>
           </div>
        </aside>

        <!-- Right: The Operational Grid (Adaptive) -->
        <main class="flex-1 min-w-0 space-y-8 w-full">
           @if (loading()) {
              <div class="flex flex-col items-center justify-center py-40 gap-4">
                 <lucide-angular [img]="icons.RefreshCw" class="h-10 w-10 text-primary animate-spin"></lucide-angular>
                 <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Analizando Producción...</p>
              </div>
           } @else if (filteredEvents().length === 0) {
              <div class="py-24 lg:py-40 text-center space-y-6 bg-white dark:bg-zinc-950 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] lg:rounded-[3rem]">
                 <div class="h-16 w-16 bg-zinc-50 dark:bg-zinc-900 rounded-3xl mx-auto flex items-center justify-center text-zinc-200">
                    <lucide-angular [img]="icons.Layers" class="h-8 w-8"></lucide-angular>
                 </div>
                 <div class="space-y-1">
                    <h3 class="text-base font-black text-zinc-400 tracking-tight">Zona Despejada</h3>
                    <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-6">No hay órdenes programadas para este rango.</p>
                 </div>
              </div>
           } @else {
              <!-- Dynamic View Dispatcher -->
              @if (viewMode() === 'WEEK') {
                 <div class="overflow-x-auto lg:overflow-visible no-scrollbar -mx-4 px-4 lg:-mx-0 lg:px-0">
                    <app-calendar-week-view 
                      class="min-w-[800px] lg:min-w-0"
                      [events]="filteredEvents()"
                      [currentDate]="currentDate()"
                      [density]="cardDensity()"
                      (onEventClick)="goToDetail($event)">
                    </app-calendar-week-view>
                 </div>
              } @else if (viewMode() === 'AGENDA') {
                 <app-calendar-agenda-view
                   [events]="filteredEvents()"
                   [currentDate]="currentDate()"
                   (onEventClick)="goToDetail($event)">
                 </app-calendar-agenda-view>
              } @else if (viewMode() === 'MONTH') {
                 <app-calendar-month-view
                   [events]="filteredEvents()"
                   [currentDate]="currentDate()"
                   (onEventClick)="goToDetail($event)">
                 </app-calendar-month-view>
              } @else {
                 <div class="py-40 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border border-zinc-100 dark:border-zinc-800">
                    <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">Implementando Vista Avanzada {{ viewMode() }}...</p>
                 </div>
              }
           }
        </main>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `]
})
export class CalendarioPageComponent implements OnInit {
  private calendarService = inject(CalendarService);
  private store = inject(CalendarStoreService);
  private session = inject(SessionService);
  private api = inject(PedidosApiService);
  private router = inject(Router);

  // Read signals from Store (Persistence)
  currentDate = this.store.currentDate;
  viewMode = this.store.viewMode;
  filters = this.store.filters;
  events = this.store.events;

  // Local state
  loading = signal(false);
  employees = signal<Employee[]>([]);
  showFilters = signal(false);
  windowWidth = signal(window.innerWidth);

  icons = { RefreshCw, Layers, AlertCircle, Filter, X };

  // Computeds
  displayDateRange = computed(() => {
    const d = this.currentDate();
    const start = this.getStartOfWeek(d);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const options: any = { month: 'long', year: 'numeric' };
    const month = d.toLocaleDateString('es-ES', options);
    
    if (this.viewMode() === 'MONTH') return month;
    if (this.viewMode() === 'AGENDA') return `Agenda ${month}`;
    return `Semana ${d.getDate()} al ${end.getDate()} de ${month}`;
  });

  statusOptions = computed(() => {
    const rubro = this.session.activeNegocio()?.rubro || 'GENERICO';
    const config = getNegocioConfig(rubro);
    return config.productionStages.map(s => ({ key: s.key, label: s.label }));
  });

  filteredEvents = computed(() => {
    const f = this.filters();
    return this.events().filter((e: CalendarOrderEvent) => {
      if (f.status.length > 0 && !f.status.includes(e.status)) return false;
      if (f.operatorId && e.responsableId !== f.operatorId && e.operatorId !== f.operatorId) return false;
      if (f.onlyRisky && e.risk.level === 'NONE') return false;
      if (f.onlyOverdue && e.urgency !== 'OVERDUE') return false;
      return true;
    });
  });

  cardDensity = computed(() => {
    const w = this.windowWidth();
    if (w > 1600) return 'FULL';
    return 'COMPACT';
  });

  riskyCount = computed(() => this.filteredEvents().filter((e: CalendarOrderEvent) => e.risk.level === 'CRITICAL' || e.risk.level === 'HIGH').length);
  overdueCount = computed(() => this.filteredEvents().filter((e: CalendarOrderEvent) => e.urgency === 'OVERDUE').length);

  @HostListener('window:resize')
  onResize() {
    this.windowWidth.set(window.innerWidth);
    this.adjustViewForScreen();
  }

  constructor() {
    effect(() => {
      this.loadBatch();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.loadEmployees();
    this.adjustViewForScreen();
  }

  private adjustViewForScreen() {
    const width = this.windowWidth();
    if (width < 1024 && this.viewMode() === 'WEEK') {
      this.store.setViewMode('AGENDA');
    }
  }

  private async loadEmployees() {
    const bId = this.session.activeNegocio()?.id;
    if (!bId) return;
    const emps = await this.api.getEmployees(bId);
    this.employees.set(emps);
  }

  async loadBatch() {
    const bId = this.session.activeNegocio()?.id;
    if (!bId) return;

    const start = this.getStartOfWeek(this.currentDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 35); // Monthly buffer for cache

    // CACHE AUDIT: Avoid refetch if params haven't changed
    if (!this.store.shouldRefetch(bId, start, end)) {
       return; 
    }

    this.loading.set(true);
    try {
      const items = await this.calendarService.getEvents(bId, start, end);
      this.store.setEvents(items, { bId, start: start.toISOString(), end: end.toISOString() });
    } catch (err) {
      console.error('Error loading calendar:', err);
    } finally {
      this.loading.set(false);
    }
  }

  handleFilterChange(f: CalendarFilters) {
    this.store.setFilters(f);
    // Close sidebar on small screens after filter change for better UX
    if (window.innerWidth < 1024) {
      // Small delay for visual feedback of the click
      setTimeout(() => this.showFilters.set(false), 300);
    }
  }

  navigateRange(direction: number) {
    const d = new Date(this.currentDate());
    if (this.viewMode() === 'WEEK' || this.viewMode() === 'AGENDA') {
      d.setDate(d.getDate() + (direction * 7));
    } else {
      d.setMonth(d.getMonth() + direction);
    }
    this.store.setCurrentDate(d);
  }

  setToday() {
    this.store.setCurrentDate(new Date());
  }

  setViewMode(mode: CalendarViewMode) {
    this.store.setViewMode(mode);
  }

  goToDetail(event: CalendarOrderEvent) {
    this.router.navigate(['/pedidos', event.id]);
  }

  private getStartOfWeek(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(new Date(d).setDate(diff));
  }

  cn(...args: any[]) { return args.filter(Boolean).join(' '); }
}
