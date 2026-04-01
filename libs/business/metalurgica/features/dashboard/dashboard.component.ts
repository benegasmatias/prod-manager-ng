import { Component, input, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  LucideAngularModule, 
  LayoutDashboard, 
  Calendar, 
  Zap, 
  FileText, 
  Wallet, 
  AlertCircle, 
  ChevronRight, 
  Truck, 
  MapPin, 
  User, 
  CheckCircle2, 
  Briefcase, 
  Hammer, 
  Printer,
  TrendingUp,
  ShoppingCart,
  ArrowRight,
  AlertTriangle
} from 'lucide-angular';
import { Rubro } from '@shared/models';
import { getStatusLabel, getStatusStyles, cn } from '@shared/utils';
import { DashboardSkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { MetricCardComponent, MetricCardsGridComponent, BaseCardComponent } from '@shared/ui';

@Component({
  selector: 'app-metalurgica-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, DashboardSkeletonComponent, MetricCardComponent, MetricCardsGridComponent, BaseCardComponent],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetalurgicaDashboardComponent {
  summary = input.required<any>();
  loading = input<boolean>(false);
  rubro = input<Rubro>('METALURGICA');

  // Component icons mapping for lucide-angular
  readonly icons = {
    LayoutDashboard,
    Calendar,
    Zap,
    FileText,
    Wallet,
    AlertCircle,
    ChevronRight,
    Truck,
    MapPin,
    User,
    CheckCircle2,
    Briefcase,
    Hammer,
    Printer,
    TrendingUp,
    ShoppingCart,
    AlertTriangle,
    ArrowRight
  };

  counters = computed(() => this.summary()?.operationalCounters || {
    visitsToday: 0,
    pendingBudgets: 0,
    inProduction: 0,
    deliveriesThisWeek: 0,
    delayedOrders: 0,
    pendingPayments: 0
  });

  pipeline = computed(() => this.summary()?.pipelineSummary || []);
  events = computed(() => this.summary()?.calendarEvents || []);
  alerts = computed(() => this.summary()?.alerts || []);

  getStatusLabel(status: string) {
    return getStatusLabel(status, this.rubro());
  }

  getStatusStyles(status: string) {
    return getStatusStyles(status, this.rubro());
  }

  cn(...args: any[]) {
    return cn(...args);
  }
}
