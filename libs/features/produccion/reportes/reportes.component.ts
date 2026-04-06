import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductionApiService } from '@core/api/production.api.service';
import { SessionService } from '@core/session/session.service';
import { 
  BarChart3, Users, Monitor, Clock, 
  AlertTriangle, CheckCircle2, ChevronRight,
  TrendingUp, Activity, Filter, Box,
  Briefcase, Target, Zap, Database
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-produccion-reportes',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ProduccionReportesComponent {
  private api = inject(ProductionApiService);
  private session = inject(SessionService);

  readonly icons = {
    BarChart3, Users, Monitor, Clock, 
    AlertTriangle, CheckCircle2, ChevronRight,
    TrendingUp, Activity, Filter, Box,
    Briefcase, Target, Zap, Database
  };

  days = signal(30);
  report = signal<any>(null);
  loading = signal(false);

  constructor() {
    effect(() => {
      const bId = this.session.activeId();
      if (bId) {
        this.loadReport(bId, this.days());
      }
    });
  }

  async loadReport(businessId: string, days: number) {
    this.loading.set(true);
    try {
      const data = await this.api.getProductivityReport(businessId, days);
      this.report.set(data);
    } catch (err) {
      console.error('Error loading productivity report', err);
    } finally {
      this.loading.set(false);
    }
  }

  setPeriod(d: number) {
    this.days.set(d);
  }

  formatMins(m: number): string {
    if (!m) return '0m';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return `${h}h${rem > 0 ? ` ${rem}m` : ''}`;
  }

  getPercentage(val: number, max: number): number {
    if (!max) return 0;
    return Math.min(100, Math.round((val / max) * 100));
  }

  getMax(arr: any[], key: string): number {
    if (!arr || arr.length === 0) return 0;
    return Math.max(...arr.map(i => i[key]));
  }
}
