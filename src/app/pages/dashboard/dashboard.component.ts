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
import { MetricCardComponent } from '@shared/ui/metric-card/metric-card.component';

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
    RecentOrdersWidgetComponent,
    MetricCardComponent
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
      <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-x-12 gap-y-12 md:gap-y-20 pb-20">
        
        <!-- DYNAMIC SECTIONS ENGINE -->
        @for (section of activeConfig().sections; track section.widgetId) {
          <section [class]="cn('space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000', section.fullWidth ? 'lg:col-span-2' : '')">
            
            @if (section.title && section.widgetId !== 'hero-summary' && section.widgetId !== 'primary-metrics') {
              <div class="flex items-center justify-between px-6 mb-2">
                 <h3 class="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted/40 flex items-center gap-4 italic">
                   <div class="w-8 h-px bg-border/10"></div>
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
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  <app-metric-card
                    title="Máquinas Produciendo"
                    [value]="summary()?.activeMachines || 0"
                    subtitle="UNIDADES ACTIVAS"
                    [icon]="icons.Printer"
                    accentColor="primary"
                    [loading]="loading()"
                  ></app-metric-card>

                  <app-metric-card
                    title="Captación Mensual"
                    [value]="summary()?.newCustomers || 0"
                    subtitle="CLIENTES NUEVOS"
                    [icon]="icons.Users"
                    accentColor="emerald"
                    [loading]="loading()"
                    trendText="+12% VS MES ANTERIOR"
                    trendDirection="up"
                  ></app-metric-card>
                </div>
              }
              @case ('recent-orders') {
                <app-recent-orders-widget [orders]="summary()?.recentOrders || []"></app-recent-orders-widget>
              }
              @default {
                <div class="p-10 md:p-16 rounded-[2.5rem] bg-surface-container-low border-none flex flex-col items-center justify-center text-center space-y-6 grayscale opacity-40 transition-all hover:opacity-100 hover:grayscale-0">
                   <lucide-angular [img]="icons.Clock" class="h-8 w-8 text-text-muted/40"></lucide-angular>
                   <p class="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted/40 italic">Extensión Industrial en Fase de Implementación</p>
                </div>
              }
            }
          </section>
        }

        <!-- TRENDS / ANALYZER (Optional) -->
        @if (summary()?.trends === null) {
          <div class="p-20 rounded-[4rem] bg-surface-container-low flex flex-col items-center justify-center gap-6 text-center group relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div class="h-20 w-20 rounded-[2rem] bg-surface-container-lowest border border-border/5 flex items-center justify-center shadow-2xl shadow-text/5 group-hover:scale-110 transition-transform duration-700 relative z-10">
              <lucide-angular [img]="icons.TrendingUp" class="h-8 w-8 text-text-muted/20 group-hover:text-primary transition-colors"></lucide-angular>
            </div>
            <div class="space-y-4 relative z-10">
              <h4 class="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted/40 italic">Análisis Predictivo</h4>
              <p class="text-xs font-bold text-text-muted/30 max-w-sm leading-relaxed uppercase tracking-widest italic">Se requiere mayor volumen de datos históricos para proyectar tendencias industriales significativas.</p>
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
    const caps = this.session.activeCapabilities();
    const baseConfig = DASHBOARD_CONFIG[rubro] || DEFAULT_DASHBOARD;

    return {
      ...baseConfig,
      metrics: baseConfig.metrics.filter(m => !m.requiredCapability || caps.includes(m.requiredCapability)),
      sections: baseConfig.sections.filter(s => !s.requiredCapability || caps.includes(s.requiredCapability)),
      quickActions: baseConfig.quickActions.filter(a => !a.requiredCapability || caps.includes(a.requiredCapability))
    };
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
