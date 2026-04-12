import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  ChevronRight, 
  Activity, 
  AlertCircle, 
  LayoutGrid,
  BarChart3,
  Calendar,
  Wallet,
  Printer,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  Clock
} from 'lucide-angular';
import { SessionService } from '@core/session/session.service';
import { DashboardService } from '@core/api/dashboard.service';
import { PageShellComponent } from '@shared/ui/layout/page-shell.component';
import { DASHBOARD_CONFIG, DEFAULT_DASHBOARD } from '@shared/constants/dashboard-config';
import { KpiGridComponent } from '@shared/ui/dashboard/kpi-grid/kpi-grid.component';
import { QuickActionsComponent } from '@shared/ui/dashboard/quick-actions/quick-actions.component';
import { HeroSummaryComponent } from '@shared/ui/dashboard/hero-summary/hero-summary.component';
import { AlertsPriorityWidgetComponent } from '@shared/ui/dashboard/alerts-priority/alerts-priority.component';
import { RecentOrdersWidgetComponent } from '@shared/ui/dashboard/recent-orders-widget/recent-orders-widget.component';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    PageShellComponent, 
    KpiGridComponent, 
    QuickActionsComponent,
    HeroSummaryComponent,
    AlertsPriorityWidgetComponent,
    RecentOrdersWidgetComponent
  ],
  template: `
    <app-page-shell
      [category]="activeConfig().category"
      [title]="activeConfig().title"
      [titleAccent]="activeConfig().titleAccent"
      [description]="activeConfig().description"
      [loading]="loading()"
    >
      <!-- HEADER ACTIONS -->
      <div actions>
        <app-quick-actions [actions]="activeConfig().quickActions"></app-quick-actions>
      </div>

      <!-- DASHBOARD CONTENT LAYER -->
      <div class="space-y-16 pb-20">
        
        <!-- DYNAMIC SECTIONS ENGINE -->
        @for (section of activeConfig().sections; track section.widgetId) {
          <section [class]="cn('space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000', section.fullWidth ? 'col-span-full' : '')">
            
            @if (section.title && section.widgetId !== 'hero-summary' && section.widgetId !== 'primary-metrics') {
              <div class="flex items-center justify-between px-2">
                 <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-3">
                   <div class="w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/40"></div>
                   {{ section.title }}
                 </h3>
              </div>
            }

            <!-- SPECIALIZED WIDGET DISPATCHER -->
            @switch (section.widgetId) {
              @case ('alerts-priority') {
                <app-alerts-priority-widget [alerts]="summary()?.alerts || []"></app-alerts-priority-widget>
              }
              @case ('hero-summary') {
                <app-hero-summary [summary]="summary()"></app-hero-summary>
              }
              @case ('primary-metrics') {
                <app-kpi-grid 
                  [metrics]="activeConfig().metrics" 
                  [summary]="summary()" 
                  [loading]="loading()"
                ></app-kpi-grid>
              }
              @case ('secondary-metrics') {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div class="p-10 rounded-[2.5rem] border border-zinc-100/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 flex items-center justify-between group overflow-hidden relative transition-all hover:shadow-xl hover:border-zinc-200">
                    <div class="space-y-2 z-10">
                      <span class="text-[9px] font-black uppercase tracking-widest text-zinc-400 opacity-80">Máquinas Produciendo</span>
                      <p class="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">{{ summary()?.activeMachines || 0 }} UNIDADES</p>
                    </div>
                    <div class="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-primary/30 group-hover:text-primary group-hover:bg-primary/5 transition-all duration-500">
                      <lucide-angular [img]="icons.Printer" class="h-6 w-6"></lucide-angular>
                    </div>
                  </div>
                  
                  <div class="p-10 rounded-[2.5rem] border border-zinc-100/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 flex items-center justify-between group overflow-hidden relative transition-all hover:shadow-xl hover:border-zinc-200">
                    <div class="space-y-2 z-10">
                      <span class="text-[9px] font-black uppercase tracking-widest text-zinc-400 opacity-80">Captación Mensual</span>
                      <p class="text-3xl font-black text-emerald-500 tracking-tighter">+{{ summary()?.newCustomers || 0 }} CLIENTES</p>
                    </div>
                    <div class="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-200 group-hover:text-zinc-400 group-hover:bg-zinc-100 transition-all duration-500">
                      <lucide-angular [img]="icons.Users" class="h-6 w-6"></lucide-angular>
                    </div>
                  </div>
                </div>
              }
              @case ('recent-orders') {
                <app-recent-orders-widget [orders]="summary()?.recentOrders || []"></app-recent-orders-widget>
              }
              @default {
                <div class="p-12 rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-4 opacity-50 grayscale transition-all hover:grayscale-0">
                   <lucide-angular [img]="icons.Clock" class="h-8 w-8 text-zinc-400"></lucide-angular>
                   <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Extensión Industrial en Fase de Implementación</p>
                </div>
              }
            }
          </section>
        }

        <!-- TRENDS / ANALYZER (Optional) -->
        @if (summary()?.trends === null) {
          <div class="p-16 rounded-[4rem] bg-zinc-50 border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-900 flex flex-col items-center justify-center gap-4 text-center group">
            <div class="h-16 w-16 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <lucide-angular [img]="icons.TrendingUp" class="h-6 w-6 text-zinc-300"></lucide-angular>
            </div>
            <div class="space-y-2">
              <h4 class="text-sm font-black uppercase tracking-widest text-zinc-400">Análisis Predictivo</h4>
              <p class="text-[10px] font-bold text-zinc-400 max-w-xs leading-relaxed uppercase">Se requiere mayor volumen de datos históricos para proyectar tendencias industriales significativas.</p>
            </div>
          </div>
        }
      </div>
    </app-page-shell>
  `,
})
export class DashboardComponent {
  private dashboardService = inject(DashboardService);
  private session = inject(SessionService);

  summary = this.dashboardService.summary;
  loading = this.dashboardService.loading;

  activeConfig = computed(() => {
    const rubro = this.session.rubro();
    return DASHBOARD_CONFIG[rubro] || DEFAULT_DASHBOARD;
  });

  readonly icons = {
    ChevronRight, Activity, AlertCircle, LayoutGrid, BarChart3, Calendar, 
    Wallet, Printer, Users, AlertTriangle, ArrowRight, TrendingUp, Package, Clock
  };

  constructor() {
    // Note: No manual refresh() here. The effect handles both 
    // initial load and business context switches.
    
    effect(() => {
      const activeId = this.session.activeId();
      if (activeId) {
        // Only force if we don't have data yet. 
        // The service's refresh(false) will skip if data exists.
        // If we want a switch-business force, we should compare IDs.
        this.dashboardService.refresh(); 
      }
    }, { allowSignalWrites: true });
  }

  cn = cn;
}
