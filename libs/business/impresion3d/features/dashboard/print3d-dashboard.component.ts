import { Component, inject, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  LucideAngularModule, 
  Printer, 
  Clock, 
  Activity, 
  AlertCircle, 
  ChevronRight, 
  Package, 
  TrendingUp, 
  Layers, 
  Timer, 
  Gauge, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Play, 
  Pause, 
  Hammer, 
  FileCheck,
  ArrowRight
} from 'lucide-angular';
import { MetricCardComponent, MetricCardsGridComponent, BaseCardComponent, MetricCardVariant } from '@shared/ui';
import { DashboardService } from '@core/api/dashboard.service';
import { SessionService } from '@core/session/session.service';
import { DASHBOARD_CONFIG } from '@shared/constants/dashboard-config';

@Component({
  selector: 'app-print3d-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LucideAngularModule, 
    MetricCardComponent, 
    MetricCardsGridComponent, 
    BaseCardComponent
  ],
  templateUrl: './print3d-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Print3dDashboardComponent {
  private dashboardService = inject(DashboardService);
  private sessionService = inject(SessionService);

  // Core Data as Signals
  summary = this.dashboardService.summary;
  loading = this.dashboardService.loading;

  // Localized Config
  config = computed(() => {
    const rubro = this.sessionService.rubro();
    return DASHBOARD_CONFIG[rubro] || DASHBOARD_CONFIG['GENERICO'];
  });

  readonly icons = {
    Printer, Clock, Activity, AlertCircle, ChevronRight, Package, 
    TrendingUp, Layers, Timer, Gauge, AlertTriangle, CheckCircle2, Zap, Play, Pause, Hammer, FileCheck, ArrowRight
  };

  /**
   * Domain logic to map raw metrics to UI-ready KPI objects.
   * Eliminates hardcoded names and uses configuration mapping.
   */
  kpis = computed(() => {
    const raw = this.summary()?.kpis || [];
    const mapping = this.config().kpiTitles || {};
    const iconMap: any = {
      'activePrinters': this.icons.Printer,
      'productionHours': this.icons.Clock,
      'activeJobs': this.icons.Activity,
      'failureRate': this.icons.AlertCircle
    };

    return raw.map(kpi => ({
      ...kpi,
      title: mapping[kpi.title] || kpi.title,
      icon: iconMap[kpi.title] || this.icons.Activity,
      variant: kpi.variant as MetricCardVariant
    }));
  });

  printers = computed(() => this.summary()?.printers || []);
  queue = computed(() => this.summary()?.productionQueue || []);
  materials = computed(() => this.summary()?.materials || []);
  alerts = computed(() => this.summary()?.alerts || []);

  constructor() {
    // Initial fetch
    this.dashboardService.refresh();
    
    // Auto-refresh when business changes
    effect(() => {
      this.dashboardService.refresh();
    }, { allowSignalWrites: true });
  }

  /**
   * Uses config-driven status labels to avoid UI hardcoding.
   */
  getStatusLabel(status: string) {
    return (this.config().statusLabels || {})[status] || status;
  }

  getStatusColor(status: string) {
    const map: any = {
      'PRINTING': 'bg-primary/10 text-primary border-primary/20',
      'READY': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'ERROR': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      'MAINTENANCE': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'OFFLINE': 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
      'CLEANING': 'bg-sky-500/10 text-sky-500 border-sky-500/20'
    };
    return map[status] || map['OFFLINE'];
  }

  getPriorityColor(priority: string) {
    const map: any = {
      'HIGH': 'text-rose-500 bg-rose-500/10',
      'MEDIUM': 'text-amber-500 bg-amber-500/10',
      'LOW': 'text-zinc-500 bg-zinc-500/10'
    };
    return map[priority] || map['LOW'];
  }
}
