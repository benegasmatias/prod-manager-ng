import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, TrendingUp, AlertTriangle, Clock, 
  Activity, Monitor, User, CheckCircle2, Pause, AlertCircle,
  Square, Layers, Search, Filter, Box
} from 'lucide-angular';
import { ProductionApiService } from '../../../core/api/production.api.service';
import { SessionService } from '../../../core/session/session.service';
import { ProductionJob, ProductionJobStatus, ProductionJobPriority } from '../../../shared/models/production-job';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../../core/layout/layout.service';

@Component({
  selector: 'app-produccion-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class ProduccionDashboardComponent {
  private api = inject(ProductionApiService);
  private session = inject(SessionService);
  private layout = inject(LayoutService);

  jobs = signal<ProductionJob[]>([]);
  loading = signal(true);

  // COMPUTED KPIs
  stats = computed(() => {
    const list = this.jobs();
    const queued = list.filter(j => j.status === ProductionJobStatus.QUEUED).length;
    const progress = list.filter(j => j.status === ProductionJobStatus.IN_PROGRESS).length;
    const paused = list.filter(j => j.status === ProductionJobStatus.PAUSED).length;
    const failed = list.filter(j => j.status === ProductionJobStatus.FAILED).length;
    const totalMins = list.reduce((acc, j) => acc + (j.actualMinutes || 0), 0);

    return {
      total: list.length,
      queued,
      progress,
      paused,
      failed,
      totalMins,
      urgent: list.filter(j => j.priority === ProductionJobPriority.URGENT).length,
      unassigned: list.filter(j => !j.operatorId || !j.machineId).length,
      unassignedOperator: list.filter(j => !j.operatorId).length,
      unassignedMachine: list.filter(j => !j.machineId).length
    };
  });

  // Alertas dinámicas
  alerts = computed(() => {
    const list = this.jobs();
    const alerts = [];

    // Prioridad Máxima: Fallidos
    const failed = list.filter(j => j.status === ProductionJobStatus.FAILED);
    if (failed.length > 0) {
      alerts.push({ 
        type: 'ERROR', 
        title: `${failed.length} Trabajos Fallidos`, 
        desc: 'Requieren revisión técnica o reinicio.',
        icon: AlertCircle,
        color: 'rose'
      });
    }

    // Alta: Urgentes sin asignar
    const urgentUnassigned = list.filter(j => j.priority === ProductionJobPriority.URGENT && (!j.operatorId || !j.machineId));
    if (urgentUnassigned.length > 0) {
      alerts.push({ 
        type: 'WARNING', 
        title: `${urgentUnassigned.length} Urgencias sin Recurso`, 
        desc: 'Trabajos críticos pendientes de asignación.',
        icon: AlertTriangle,
        color: 'orange'
      });
    }

    // Nueva Alerta: Bloqueo por Materiales (Stage 6.7)
    const missingMaterials = list.filter(j => j.status === ProductionJobStatus.QUEUED && (!j.jobMaterials || j.jobMaterials.length === 0));
    if (missingMaterials.length > 0) {
      alerts.push({ 
        type: 'WARNING', 
        title: `${missingMaterials.length} Bloqueos por Material`, 
        desc: 'Trabajos en cola sin insumos reservados.',
        icon: Box,
        color: 'indigo'
      });
    }

    // Media: Pausados
    const paused = list.filter(j => j.status === ProductionJobStatus.PAUSED);
    if (paused.length > 3) {
      alerts.push({ 
        type: 'INFO', 
        title: 'Acumulación de Pausas', 
        desc: 'Varios trabajos detenidos simultáneamente.',
        icon: Pause,
        color: 'amber'
      });
    }

    return alerts;
  });

  // Distribución por etapa
  stageDistribution = computed(() => {
    const list = this.jobs();
    const map: Record<string, number> = {};
    list.forEach(j => {
      const s = j.currentStage || 'SIN DEFINIR';
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  });

  icons = {
    TrendingUp, AlertTriangle, Clock, Activity, Monitor, User, 
    CheckCircle2, Pause, AlertCircle, Square, Layers, Search, Filter, Box
  };

  formatMinutes(mins: number): string {
    if (!mins) return '0m';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ''}`;
  }

  constructor() {
    effect(() => {
      // Clear FAB on dashboard to default to "Add Order" or clear previous page's FAB
      this.layout.fabAction.set(null);
    });

    effect(() => {
      const bId = this.session.activeId();
      if (bId) {
        this.loadData(bId);
        this.setupRefresh(bId);
      }
    });
  }

  private refreshInterval: any;

  setupRefresh(bId: string) {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => {
      this.loadData(bId);
    }, 30000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  async loadData(businessId: string) {
    this.loading.set(true);
    try {
      const res = await this.api.getJobs({ businessId });
      this.jobs.set(res || []);
    } catch (e) {
      console.error('[ProductionDashboard] Load error:', e);
    } finally {
      this.loading.set(false);
    }
  }

  getPercentage(val: number) {
    const total = this.jobs().length;
    if (total === 0) return 0;
    return Math.round((val / total) * 100);
  }
}
