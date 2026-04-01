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
      <div class="space-y-12 pb-20">
        
        <!-- DYNAMIC SECTIONS ENGINE -->
        @for (section of activeConfig().sections; track section.widgetId) {
          <section [class]="cn('space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700', section.fullWidth ? 'col-span-full' : '')">
            
            @if (section.title && section.widgetId !== 'hero-summary') {
              <div class="flex items-center justify-between px-2">
                 <h3 class="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 flex items-center gap-2">
                   <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                  <div class="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 flex items-center justify-between group overflow-hidden relative">
                    <div class="space-y-1 z-10">
                      <span class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Máquinas Produciendo</span>
                      <p class="text-2xl font-black">{{ summary()?.activeMachines || 0 }} UNIDADES</p>
                    </div>
                    <lucide-angular [img]="icons.Printer" class="h-8 w-8 text-zinc-200 group-hover:text-primary transition-colors"></lucide-angular>
                  </div>
                  <div class="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 flex items-center justify-between group overflow-hidden relative">
                    <div class="space-y-1 z-10">
                      <span class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Captación Mensual</span>
                      <p class="text-2xl font-black text-emerald-600">+{{ summary()?.newCustomers || 0 }} CLIENTES</p>
                    </div>
                    <lucide-angular [img]="icons.Users" class="h-8 w-8 text-zinc-200 group-hover:text-emerald-500 transition-colors"></lucide-angular>
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
    // Initial fetch (Service handles caching internally)
    this.dashboardService.refresh();
    
    // Auto-refresh ONLY if business identity changes
    effect(() => {
      const activeId = this.session.activeId();
      if (activeId) {
        this.dashboardService.refresh(true); // Forced on business switch
      }
    }, { allowSignalWrites: true });
  }

  cn = cn;
}
