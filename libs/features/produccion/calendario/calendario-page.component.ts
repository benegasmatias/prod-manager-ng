import { Component, inject, signal, computed, OnInit, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, RefreshCw, Layers, TrendingUp, AlertCircle, AlertOctagon, Clock, ChevronLeft, ChevronRight } from 'lucide-angular';
import { CalendarService } from './services/calendar.service';
import { CalendarStoreService } from './services/calendar-store.service';
import { SessionService } from '@core/session/session.service';
import { CalendarOrderEvent, CalendarViewMode, CalendarFilters } from './models/calendar.models';
import { CalendarWeekViewComponent } from './components/calendar-week-view.component';
import { CalendarAgendaViewComponent } from './components/calendar-agenda-view.component';
import { CalendarMonthViewComponent } from './components/calendar-month-view.component';
import { CalendarFiltersComponent } from './components/calendar-filters.component';
import { Employee } from '@shared/models';
import { PedidosApiService } from '@core/api/pedidos.api.service';
import { getNegocioConfig } from '@shared/utils';
import { PageShellComponent } from '@shared/ui/layout/page-shell.component';

@Component({
  selector: 'app-calendario-page',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    CalendarWeekViewComponent,
    CalendarAgendaViewComponent,
    CalendarMonthViewComponent,
    CalendarFiltersComponent,
    PageShellComponent
  ],
  template: `
<app-page-shell
  title="Mapa de"
  titleAccent="Cronología"
  category="PRODUCTION TIMELINE"
  description="Visualización Estratégica de Carga Horaria y Despliegue de Planta"
>
  <div class="pb-48 overflow-hidden">
    
    <!-- 1. MOBILE APP HEADER: Dynamic & Minimal -->
    <div *ngIf="isMobile()" class="mb-8 space-y-6">
       <div class="flex items-center justify-between">
          <div class="flex flex-col">
             <span class="text-[9px] font-black uppercase tracking-[0.4em] text-primary italic">Status Realtime</span>
             <h2 class="text-2xl font-black text-text uppercase italic tracking-tighter">Cronología</h2>
          </div>
          <button (click)="showFilters.set(true)" class="h-12 w-12 flex items-center justify-center rounded-2xl bg-surface-container-low/50 border border-border/5 text-primary shadow-xl shadow-primary/5 active:scale-90 transition-all">
             <lucide-angular [img]="icons.RefreshCw" [class]="cn('h-5 w-5 transition-transform duration-700', loading() ? 'animate-spin text-primary' : 'text-text-muted/40')"></lucide-angular>
          </button>
       </div>

       <!-- Mobile Status Chips (Metrics transformed) -->
       <div class="flex items-center gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 py-2">
          <div class="flex items-center gap-4 bg-surface-container-low/30 backdrop-blur-3xl border border-border/5 rounded-2xl p-4 shrink-0 transition-all active:scale-95">
             <div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><lucide-angular [img]="icons.TrendingUp" class="h-4 w-4"></lucide-angular></div>
             <div class="flex flex-col"><span class="text-[8px] font-black uppercase text-text-muted/60 italic tracking-widest">Protocolos</span><span class="text-lg font-black text-text italic tabular-nums grow leading-none mt-1">{{ filteredEvents().length }}</span></div>
          </div>
          <div class="flex items-center gap-4 bg-surface-container-low/30 backdrop-blur-3xl border border-border/5 rounded-2xl p-4 shrink-0 transition-all active:scale-95">
             <div class="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent"><lucide-angular [img]="icons.AlertCircle" class="h-4 w-4"></lucide-angular></div>
             <div class="flex flex-col"><span class="text-[8px] font-black uppercase text-text-muted/60 italic tracking-widest">Riesgo</span><span class="text-lg font-black text-accent italic tabular-nums grow leading-none mt-1">{{ riskyCount() }}</span></div>
          </div>
          <div class="flex items-center gap-4 bg-surface-container-low/30 backdrop-blur-3xl border border-border/5 rounded-2xl p-4 shrink-0 transition-all active:scale-95">
             <div class="h-8 w-8 rounded-lg bg-error/10 flex items-center justify-center text-error"><lucide-angular [img]="icons.AlertOctagon" class="h-4 w-4"></lucide-angular></div>
             <div class="flex flex-col"><span class="text-[8px] font-black uppercase text-text-muted/60 italic tracking-widest">Vencidos</span><span class="text-lg font-black text-error italic tabular-nums grow leading-none mt-1">{{ overdueCount() }}</span></div>
          </div>
       </div>
    </div>

    <!-- 2. DESKTOP DASHBOARD HIGHLIGHTS -->
    <div *ngIf="!isMobile()" class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
      
      <!-- CARD 1: Volumen Total -->
      <div class="bg-surface-container-low/30 backdrop-blur-3xl rounded-[3.5rem] p-10 border border-border/5 shadow-2xl shadow-text/5 relative group overflow-hidden">
        <div class="absolute -right-10 -top-10 h-32 w-32 bg-primary/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>
        <div class="absolute top-10 right-10 h-14 w-14 rounded-2xl bg-surface flex items-center justify-center text-primary shadow-2xl shadow-text/5 border border-border/5">
          <lucide-angular [img]="icons.TrendingUp" class="h-6 w-6 group-hover:scale-110 transition-transform"></lucide-angular>
        </div>
        <div class="space-y-6">
          <span class="text-[9px] font-black uppercase tracking-[0.5em] text-text-muted/40 italic">Carga de Protocolos</span>
          <div class="flex flex-col">
            <p class="text-6xl font-black text-text tracking-tighter tabular-nums font-display italic leading-none">{{ filteredEvents().length }}</p>
            <div class="flex items-center gap-3 mt-4">
               <div class="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
               <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic animate-pulse">Flujo Estable</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CARD 2: En Riesgo -->
      <div class="bg-surface-container-low/30 backdrop-blur-3xl rounded-[3.5rem] p-10 border border-border/5 shadow-2xl shadow-text/5 relative group overflow-hidden">
        <div class="absolute -right-10 -top-10 h-32 w-32 bg-accent/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>
        <div class="absolute top-10 right-10 h-14 w-14 rounded-2xl bg-surface flex items-center justify-center text-accent shadow-2xl shadow-text/5 border border-border/5">
          <lucide-angular [img]="icons.AlertCircle" class="h-6 w-6 animate-pulse"></lucide-angular>
        </div>
        <div class="space-y-6">
          <span class="text-[9px] font-black uppercase tracking-[0.5em] text-text-muted/40 italic">Protocolos en Riesgo</span>
          <div class="flex flex-col">
            <p class="text-6xl font-black text-accent tracking-tighter tabular-nums font-display italic leading-none">{{ riskyCount() }}</p>
            <div class="flex items-center gap-3 mt-4">
               <span class="text-[9px] font-black uppercase tracking-widest text-accent/60 italic leading-none">Intervención Requerida</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CARD 3: Vencidos -->
      <div class="bg-surface-container-low/30 backdrop-blur-3xl rounded-[3.5rem] p-10 border border-border/5 shadow-2xl shadow-text/5 relative group overflow-hidden">
        <div class="absolute -right-10 -top-10 h-32 w-32 bg-error/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>
        <div class="absolute top-10 right-10 h-14 w-14 rounded-2xl bg-surface flex items-center justify-center text-error shadow-2xl shadow-text/5 border border-border/5">
          <lucide-angular [img]="icons.AlertOctagon" class="h-6 w-6"></lucide-angular>
        </div>
        <div class="space-y-6">
          <span class="text-[9px] font-black uppercase tracking-[0.5em] text-text-muted/40 italic">Vencimientos Activos</span>
          <div class="flex flex-col">
            <p class="text-6xl font-black text-text tracking-tighter tabular-nums font-display italic leading-none">
              {{ overdueCount() < 10 ? '0' + overdueCount() : overdueCount() }}
            </p>
            <div class="flex items-center gap-3 mt-4 text-error">
               <lucide-angular [img]="icons.Clock" class="h-3 w-3"></lucide-angular>
               <span class="text-[9px] font-black uppercase tracking-widest italic">Fuera de Término</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. STICKY DATE NAV: Very clean on mobile -->
    <div [class]="cn('sticky top-0 z-[40] pb-6 bg-surface md:bg-transparent', isMobile() ? 'pt-2 border-b border-border/5' : 'md:static')">
       <div class="flex items-center justify-between gap-4">
          <div *ngIf="!isMobile()" class="hidden md:flex flex-col">
             <span class="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted/40 italic">Timeline</span>
             <h3 class="text-xl font-black text-text italic grow uppercase tabular-nums tracking-tighter">{{ displayDateRange() }}</h3>
          </div>
          
          <!-- Compact Navigation -->
          <div [class]="cn('flex items-center gap-2 p-1 bg-surface-container-low/50 rounded-2xl border border-border/5', isMobile() ? 'flex-1 grow justify-between px-3 h-12' : 'h-14 px-4 shadow-2xl shadow-text/5')">
             <button (click)="navigateRange(-1)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-surface border border-border/5 text-text-muted/60 active:scale-90 transition-all">
                <lucide-angular [img]="icons.ChevronLeft" class="h-4 w-4"></lucide-angular>
             </button>
             
             <div *ngIf="isMobile()" class="flex flex-col items-center">
                <span class="text-[9px] font-black text-text uppercase tracking-tight italic">{{ displayDateRange() }}</span>
             </div>

             <button (click)="setToday()" class="px-5 h-9 bg-primary text-[9px] font-black uppercase text-white rounded-xl shadow-xl shadow-primary/20 active:scale-95 transition-all italic">Hoy</button>
             
             <button (click)="navigateRange(1)" class="h-9 w-9 flex items-center justify-center rounded-xl bg-surface border border-border/5 text-text-muted/60 active:scale-90 transition-all">
                <lucide-angular [img]="icons.ChevronRight" class="h-4 w-4"></lucide-angular>
             </button>
          </div>

          <!-- Filter Trigger (Mobile only) -->
          <button *ngIf="isMobile()" (click)="showFilters.set(true)" class="h-12 w-12 flex items-center justify-center rounded-2xl bg-text text-surface active:scale-90 transition-all">
             <lucide-angular [img]="icons.Layers" class="h-5 w-5"></lucide-angular>
          </button>

          <!-- Desktop View Selector -->
          <div *ngIf="!isMobile()" class="hidden md:flex items-center gap-1 p-1 bg-surface-container-low rounded-2xl border border-border/5">
             @for (mode of viewOptions; track mode) {
                <button (click)="setViewMode(mode)" [class]="cn('px-6 h-11 rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all', viewMode() === mode ? 'bg-text text-surface shadow-2xl shadow-text/20' : 'text-text-muted/40 hover:text-text')">
                   {{ mode }}
                </button>
             }
          </div>
       </div>
    </div>

    <!-- 4. OPERATIONAL FILTERS (Desktop Only here, mobile in Drawer) -->
    <div *ngIf="!isMobile()" class="bg-surface-container-low/10 rounded-[3rem] border border-border/5 p-4 mb-12">
       <app-calendar-filters [employees]="employees()" [statusOptions]="statusOptions()" [layout]="'HORIZONTAL'" (onFiltersChange)="handleFilterChange($event)"></app-calendar-filters>
    </div>

    <!-- MOBILE FILTERS BOTTOM SHEET -->
    <div *ngIf="isMobile() && showFilters()" class="fixed inset-0 z-[100] flex flex-col justify-end">
       <div class="absolute inset-0 bg-text/40 backdrop-blur-sm" (click)="showFilters.set(false)"></div>
       <div class="relative bg-surface rounded-t-[3rem] p-8 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
          <div class="w-12 h-1.5 bg-border/20 rounded-full mx-auto mb-8"></div>
          <div class="flex items-center justify-between mb-8">
             <h4 class="text-xl font-black text-text uppercase italic tracking-tighter">Filtros Avanzados</h4>
             <button (click)="showFilters.set(false)" class="h-10 w-10 flex items-center justify-center rounded-full bg-surface-container-low border border-border/5"><lucide-angular [img]="icons.Layers" class="h-4 w-4 rotate-45"></lucide-angular></button>
          </div>
          <app-calendar-filters [employees]="employees()" [statusOptions]="statusOptions()" [layout]="'HORIZONTAL'" (onFiltersChange)="handleFilterChange($event)"></app-calendar-filters>
          <button (click)="showFilters.set(false)" class="w-full h-14 bg-primary text-white rounded-2xl mt-12 font-black uppercase tracking-[0.3em] text-[10px] italic shadow-2xl shadow-primary/30">Aplicar Filtros</button>
       </div>
    </div>

    <!-- MOBILE BOTTOM NAVIGATION BAR -->
    <div *ngIf="isMobile()" class="fixed bottom-24 left-6 right-6 z-[40]">
       <div class="bg-text backdrop-blur-3xl rounded-[2.5rem] h-20 px-4 flex items-center justify-between border border-white/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
          @for (opt of mobileNavOptions; track opt.mode) {
             <button (click)="setViewMode(opt.mode)" [class]="cn('flex-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-700', viewMode() === opt.mode ? 'scale-105' : 'opacity-40 hover:opacity-100')">
                <lucide-angular [img]="opt.icon" [class]="cn('h-5 w-5', viewMode() === opt.mode ? 'text-primary' : 'text-white')"></lucide-angular>
                <span [class]="cn('text-[8px] font-black uppercase tracking-widest italic', viewMode() === opt.mode ? 'text-white' : 'text-white/60')">{{ opt.label }}</span>
                <div *ngIf="viewMode() === opt.mode" class="h-1 w-1 rounded-full bg-primary mt-0.5 shadow-[0_0_10px_rgba(116,47,229,0.8)]"></div>
             </button>
          }
       </div>
    </div>

    <!-- MAIN CALENDAR CANVAS -->
    <main class="relative z-10">
       @if (loading()) {
          <div class="flex flex-col items-center justify-center py-40 gap-8 animate-in fade-in duration-700">
             <div class="relative">
                <div class="h-24 w-24 border-[3px] border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <lucide-angular [img]="icons.RefreshCw" class="absolute inset-0 m-auto h-8 w-8 text-primary opacity-40"></lucide-angular>
             </div>
             <p class="text-[10px] font-black uppercase tracking-[0.6em] text-text-muted/40 animate-pulse italic">Mapeando Flujo de Planta...</p>
          </div>
       } @else if (filteredEvents().length === 0) {
          <div class="py-40 text-center space-y-10 bg-surface-container-low/30 border border-border/5 rounded-[4rem] mx-1 backdrop-blur-3xl shadow-2xl shadow-text/5">
             <div class="h-24 w-24 bg-surface rounded-[2.5rem] mx-auto flex items-center justify-center text-text-muted/10 border border-border/5 shadow-2xl shadow-text/5">
                <lucide-angular [img]="icons.Layers" class="h-10 w-10"></lucide-angular>
             </div>
             <div class="space-y-4">
                <h3 class="text-xl font-black text-text uppercase tracking-tighter italic font-display">Cronología Despejada</h3>
                <p class="text-[10px] font-black text-text-muted/20 uppercase tracking-[0.4em] px-12 italic leading-relaxed">No se han detectado eventos de manufactura en el intervalo seleccionado.</p>
             </div>
          </div>
       } @else {
          <!-- Dynamic View Dispatcher -->
          <div class="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            @if (viewMode() === 'WEEK') {
               <div [class]="cn(isMobile() ? '' : 'overflow-x-auto lg:overflow-visible no-scrollbar -mx-4 px-4 lg:-mx-0 lg:px-0')">
                  <app-calendar-week-view 
                    [class]="isMobile() ? '' : 'min-w-[1000px] lg:min-w-0'"
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
          </div>
       }
    </main>
  </div>
</app-page-shell>
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

  icons = { RefreshCw, Layers, AlertCircle, AlertOctagon, TrendingUp, Clock, ChevronLeft, ChevronRight };

  viewOptions: CalendarViewMode[] = ['AGENDA', 'WEEK', 'MONTH'];
  
  mobileNavOptions = [
    { mode: 'AGENDA' as CalendarViewMode, label: 'Hoy', icon: Clock },
    { mode: 'WEEK' as CalendarViewMode, label: 'Semana', icon: Layers },
    { mode: 'MONTH' as CalendarViewMode, label: 'Mes', icon: TrendingUp }
  ];

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
