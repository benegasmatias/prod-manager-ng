import { Component, inject, signal, computed, OnInit, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Filter, X, ChevronDown, User, Cpu, AlertCircle, Sparkles, RefreshCw, Layers, TrendingUp, AlertOctagon, Clock, Settings2 } from 'lucide-angular';
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
    <div class="min-h-screen bg-[#fafbfc] dark:bg-zinc-950 p-3 sm:p-4 lg:p-10 space-y-4 sm:space-y-6 lg:space-y-10 animate-in fade-in duration-700 relative overflow-x-hidden">
      
      <!-- DASHBOARD HIGHLIGHTS: 3-Card Metrics Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <!-- CARD 1: Volumen Total -->
        <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 relative group overflow-hidden">
          <div class="absolute top-6 right-6 h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500">
            <lucide-angular [img]="icons.TrendingUp" class="h-6 w-6"></lucide-angular>
          </div>
          <div class="space-y-4">
            <span class="text-xs font-black uppercase tracking-widest text-zinc-400">Volumen Total</span>
            <div class="flex flex-col">
              <p class="text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter tabular-nums">{{ filteredEvents().length }}</p>
              <div class="flex items-center gap-1.5 mt-2">
                 <lucide-angular [img]="icons.TrendingUp" class="h-3 w-3 text-emerald-500"></lucide-angular>
                 <span class="text-[10px] font-bold text-emerald-500">+12% <span class="text-zinc-400 lowercase italic ml-1">vs mes anterior</span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 2: En Riesgo -->
        <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 relative group overflow-hidden">
          <div class="absolute top-6 right-6 h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500">
            <lucide-angular [img]="icons.AlertCircle" class="h-6 w-6"></lucide-angular>
          </div>
          <div class="space-y-4">
            <span class="text-xs font-black uppercase tracking-widest text-zinc-400">En Riesgo</span>
            <div class="flex flex-col">
              <p class="text-5xl font-black text-rose-500 tracking-tighter tabular-nums">{{ riskyCount() }}</p>
              <div class="flex items-center gap-1.5 mt-2">
                 <span class="text-[10px] font-black uppercase tracking-widest text-rose-400/80">! Requiere atención</span>
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 3: Vencidos -->
        <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 relative group overflow-hidden">
          <div class="absolute top-6 right-6 h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500">
            <lucide-angular [img]="icons.AlertOctagon" class="h-6 w-6"></lucide-angular>
          </div>
          <div class="space-y-4">
            <span class="text-xs font-black uppercase tracking-widest text-zinc-400">Vencidos</span>
            <div class="flex flex-col">
              <p class="text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter tabular-nums">
                {{ overdueCount() < 10 ? '0' + overdueCount() : overdueCount() }}
              </p>
              <div class="flex items-center gap-1.5 mt-2 text-rose-500">
                 <lucide-angular [img]="icons.Clock" class="h-3 w-3"></lucide-angular>
                 <span class="text-[10px] font-black uppercase tracking-widest italic">Items vencidos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- OPERATIONAL FILTERS ROW: Pill styled -->
      <div class="mb-12">
         <app-calendar-filters 
           [employees]="employees()"
           [statusOptions]="statusOptions()"
           [layout]="'HORIZONTAL'"
           (onFiltersChange)="handleFilterChange($event)">
         </app-calendar-filters>
      </div>

      <!-- TOOLBAR: Now closer to the calendar -->
      <app-calendar-toolbar 
        [currentRangeLabel]="displayDateRange()"
        [currentView]="viewMode()"
        [isMobile]="isMobile()"
        (onPrev)="navigateRange(-1)"
        (onNext)="navigateRange(1)"
        (onToday)="setToday()"
        (onViewChange)="setViewMode($event)">
      </app-calendar-toolbar>

      <!-- MAIN CONTENT -->
      <main class="flex-1 mt-6 w-full space-y-6 sm:space-y-8 pb-20 lg:pb-0 min-h-[60vh] relative">
         @if (loading()) {
            <div class="flex flex-col items-center justify-center py-40 gap-4">
               <div class="relative">
                  <div class="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <lucide-angular [img]="icons.RefreshCw" class="absolute inset-0 m-auto h-6 w-6 text-primary"></lucide-angular>
               </div>
               <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 animate-pulse">Analizando Producción...</p>
            </div>
         } @else if (filteredEvents().length === 0) {
            <div class="py-24 lg:py-40 text-center space-y-6 bg-white dark:bg-zinc-950 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] lg:rounded-[3rem] mx-1">
               <div class="h-20 w-20 bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] mx-auto flex items-center justify-center text-zinc-200 dark:text-zinc-700">
                  <lucide-angular [img]="icons.Layers" class="h-10 w-10"></lucide-angular>
               </div>
               <div class="space-y-1">
                  <h3 class="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Zona Despejada</h3>
                  <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-8">No hay órdenes programadas para este rango de fecha.</p>
               </div>
            </div>
         } @else {
            <!-- Dynamic View Dispatcher -->
            @if (viewMode() === 'WEEK') {
               <div [class]="cn(isMobile() ? '' : 'overflow-x-auto lg:overflow-visible no-scrollbar -mx-4 px-4 lg:-mx-0 lg:px-0 text-zinc-900')">
                  <app-calendar-week-view 
                    [class]="isMobile() ? '' : 'min-w-[800px] lg:min-w-0'"
                    [events]="filteredEvents()"
                    [currentDate]="currentDate()"
                    [density]="cardDensity()"
                    [isMobile]="isMobile()"
                    (onEventClick)="goToDetail($event)">
                  </app-calendar-week-view>
               </div>
            } @else if (viewMode() === 'AGENDA') {
               <app-calendar-agenda-view
                 [events]="filteredEvents()"
                 [currentDate]="currentDate()"
                 [isMobile]="isMobile()"
                 (onEventClick)="goToDetail($event)">
               </app-calendar-agenda-view>
            } @else if (viewMode() === 'MONTH') {
               <app-calendar-month-view
                 [events]="filteredEvents()"
                 [currentDate]="currentDate()"
                 [isMobile]="isMobile()"
                 (onEventClick)="goToDetail($event)">
               </app-calendar-month-view>
            }
         }
      </main>
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
  isMobile = computed(() => this.windowWidth() < 768);

  icons = { RefreshCw, Layers, AlertCircle, AlertOctagon, TrendingUp, Clock, Filter, X };

  // Computeds
  displayDateRange = computed(() => {
    const d = this.currentDate();
    const start = this.getStartOfWeek(d);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    // Formateo manual para asegurar estilo premium y control total sobre el texto
    const month = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    
    if (this.viewMode() === 'MONTH') return month.charAt(0).toUpperCase() + month.slice(1);
    if (this.viewMode() === 'AGENDA') return `Agenda ${month}`;
    return `Semana del ${start.getDate()} al ${end.getDate()} de ${month}`;
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
    // We no longer force Agenda, we let WeekView adapt to its own mobile layout
  }

  private async loadEmployees() {
    const bId = this.session.activeNegocio()?.id;
    if (!bId) return;
    const emps = await this.api.getEmployees(bId);
    this.employees.set(emps);
  }

  async loadBatch() {
    if (this.store.loading()) return;
    
    const bId = this.session.activeNegocio()?.id;
    if (!bId) return;

    const start = this.getStartOfWeek(this.currentDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 35); // Monthly buffer for cache

    // CACHE AUDIT: Avoid refetch if params haven't changed
    if (!this.store.shouldRefetch(bId, start, end)) {
       return; 
    }

    this.store.setLoading(true);
    this.loading.set(true); // Keep local for internal UI logic if needed
    
    try {
      const items = await this.calendarService.getEvents(bId, start, end);
      this.store.setEvents(items, bId, start, end);
    } catch (err) {
      console.error('Error loading calendar:', err);
      this.store.setLoading(false);
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
    const start = new Date(d);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  cn(...args: any[]) { return args.filter(Boolean).join(' '); }
}
