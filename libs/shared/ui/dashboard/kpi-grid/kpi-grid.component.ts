import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  Zap, 
  Clock, 
  AlertTriangle, 
  Layers, 
  LayoutGrid, 
  BarChart3, 
  Calendar,
  Printer
} from 'lucide-angular';
import { DashboardMetric } from '@shared/models/dashboard.config';
import { MetricCardComponent } from '@shared/ui/metric-card/metric-card.component';

@Component({
  selector: 'app-kpi-grid',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, MetricCardComponent],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8">
      @for (m of metrics(); track m.id) {
        <app-metric-card
          [title]="m.label"
          [value]="getValue(m.dataKey)"
          [subtitle]="m.unit"
          [icon]="getIcon(m.icon)"
          [accentColor]="m.color || 'primary'"
          [loading]="loading()"
          class="animate-in fade-in slide-in-from-bottom-4 duration-500"
        ></app-metric-card>
      }
    </div>
  `
})
export class KpiGridComponent {
  metrics = input.required<DashboardMetric[]>();
  summary = input.required<any>();
  loading = input<boolean>(false);

  readonly icons: any = { Zap, Clock, AlertTriangle, Layers, LayoutGrid, BarChart3, Calendar, Printer };

  getValue(key: string): string | number {
    if (!this.summary()) return '0';
    return (this.summary() as any)[key] ?? '0';
  }

  getIcon(iconName: string): any {
    return this.icons[iconName] || this.icons.Zap;
  }
}
