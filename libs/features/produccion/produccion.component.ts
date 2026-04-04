import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, Cog, User, Monitor, Clock, 
  Search, Filter, ChevronRight, AlertCircle, TrendingUp,
  LayoutGrid, List, CheckCircle2, Play, Pause, Square,
  AlertTriangle, Activity
} from 'lucide-angular';
import { ProductionApiService } from '../../core/api/production.api.service';
import { SessionService } from '../../core/session/session.service';
import { ProductionJob, ProductionJobStatus, ProductionJobPriority } from '../../shared/models/production-job';
import { StatusBadgeComponent } from '../../shared/ui/badges/status-badge.component';

@Component({
  selector: 'app-produccion-board',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, StatusBadgeComponent],
  templateUrl: './produccion.component.html',
  styleUrls: ['./produccion.component.css']
})
export class ProduccionBoardComponent {
  public readonly JobStatus = ProductionJobStatus;
  private api = inject(ProductionApiService);
  private session = inject(SessionService);

  // View State (Persistence)
  isCompact = signal<boolean>(localStorage.getItem('prod_board_compact') === 'true');

  // Board Data State
  jobs = signal<ProductionJob[]>([]);
  loading = signal(true);

  // Filter State
  searchTerm = signal('');
  selectedStatus = signal<string>('ALL');
  selectedPriority = signal<string>('ALL');

  // Columns for the Board
  columns = [
    { key: ProductionJobStatus.QUEUED, label: 'En Cola', icon: 'Clock', color: 'text-zinc-400' },
    { key: ProductionJobStatus.IN_PROGRESS, label: 'En Proceso', icon: 'Play', color: 'text-primary' },
    { key: ProductionJobStatus.PAUSED, label: 'Pausado', icon: 'Pause', color: 'text-amber-500' },
    { key: ProductionJobStatus.DONE, label: 'Terminado', icon: 'CheckCircle2', color: 'text-emerald-500' }
  ];

  filteredJobs = computed(() => {
    const list = this.jobs();
    const search = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();
    const priority = this.selectedPriority();

    return list.filter(j => {
      const matchSearch = !search || 
        j.orderItem?.nombreProducto?.toLowerCase().includes(search) || 
        j.order?.code?.toLowerCase().includes(search) ||
        j.order?.customer?.name?.toLowerCase().includes(search);

      const matchStatus = status === 'ALL' || j.status === status;
      const matchPriority = priority === 'ALL' || j.priority === priority;

      return matchSearch && matchStatus && matchPriority;
    });
  });

  icons = {
    Cog, User, Monitor, Clock, Search, Filter, 
    ChevronRight, AlertCircle, TrendingUp, LayoutGrid, 
    List, CheckCircle2, Play, Pause, Square, AlertTriangle, Activity
  };

  constructor() {
    effect(() => {
      const bId = this.session.activeId();
      if (bId) this.loadJobs(bId);
    });
  }

  async loadJobs(businessId: string) {
    this.loading.set(true);
    try {
      const res = await this.api.getJobs({ businessId });
      this.jobs.set(res || []);
    } catch (e) {
      console.error('[ProductionBoard] Error loading jobs:', e);
    } finally {
      this.loading.set(false);
    }
  }

  toggleViewMode() {
    const next = !this.isCompact();
    this.isCompact.set(next);
    localStorage.setItem('prod_board_compact', String(next));
  }

  getPriorityStyles(p: string): { border: string, color: string, icon: any } {
    switch (p) {
      case 'URGENT': return { border: 'border-l-rose-500', color: 'text-rose-500', icon: AlertTriangle };
      case 'HIGH': return { border: 'border-l-orange-500', color: 'text-orange-500', icon: AlertTriangle };
      case 'NORMAL': return { border: 'border-l-blue-500', color: 'text-blue-500', icon: Activity };
      default: return { border: 'border-l-zinc-300', color: 'text-zinc-400', icon: Activity };
    }
  }

  getJobsForColumn(status: string) {
    return this.filteredJobs().filter(j => j.status === status);
  }

  getPriorityColor(p: string) {
    switch (p) {
      case 'URGENT': return 'bg-rose-500';
      case 'HIGH': return 'bg-orange-500';
      case 'NORMAL': return 'bg-blue-500';
      default: return 'bg-zinc-400';
    }
  }

  async updateJobStatus(job: ProductionJob, newStatus: ProductionJobStatus) {
    try {
      const updated = await this.api.updateStatus(job.id, newStatus);
      this.jobs.update(list => list.map(j => j.id === job.id ? updated : j));
    } catch (e) {
      console.error('[ProductionBoard] Update error:', e);
    }
  }
}
