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
import { QuickResourcePickerComponent, PickerItem } from './components/quick-picker.component';
import { MaquinasApiService } from '../../core/api/maquinas.api.service';
import { PedidosApiService } from '../../core/api/pedidos.api.service';
import { Machine, Employee } from '../../shared/models';
import { getNegocioConfig, mapCategoryToRubro } from '../../shared/utils/negocio-utils';
import { Layers } from 'lucide-angular';

@Component({
  selector: 'app-produccion-board',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, StatusBadgeComponent, QuickResourcePickerComponent],
  templateUrl: './produccion.component.html',
  styleUrls: ['./produccion.component.css']
})
export class ProduccionBoardComponent {
  public readonly JobStatus = ProductionJobStatus;
  private api = inject(ProductionApiService);
  private maquinasApi = inject(MaquinasApiService);
  private pedidosApi = inject(PedidosApiService);
  private session = inject(SessionService);

  // View State (Persistence)
  isCompact = signal<boolean>(localStorage.getItem('prod_board_compact') === 'true');

  // Board Data State
  jobs = signal<ProductionJob[]>([]);
  machines = signal<Machine[]>([]);
  employees = signal<Employee[]>([]);
  loading = signal(true);

  // Picker State
  activePickerJob = signal<ProductionJob | null>(null);
  pickerType = signal<'MACHINE' | 'OPERATOR' | 'STAGE' | null>(null);

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

  currentConfig = computed(() => this.session.config());

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

  pickerTitle = computed(() => {
    const type = this.pickerType();
    if (type === 'MACHINE') return 'Puestos / Máquinas';
    if (type === 'STAGE') return 'Etapa del Trabajo';
    return 'Operarios / Personal';
  });
  pickerIcon = computed(() => {
    const type = this.pickerType();
    if (type === 'MACHINE') return Monitor;
    if (type === 'STAGE') return Layers;
    return User;
  });
  
  pickerItems = computed<PickerItem[]>(() => {
    const type = this.pickerType();
    const config = this.currentConfig();

    if (type === 'MACHINE') {
      return this.machines().map(m => ({
        id: m.id,
        label: m.name,
        sublabel: m.model || 'Sin modelo',
        icon: Monitor
      }));
    } else if (type === 'OPERATOR') {
      return this.employees().map(e => ({
        id: e.id,
        label: `${e.firstName} ${e.lastName || ''}`,
        sublabel: e.specialties || 'Operario',
        icon: User
      }));
    } else if (type === 'STAGE' && config) {
      return config.productionStages.map(s => ({
        id: s.key,
        label: s.label,
        sublabel: 'Cambiar a esta etapa',
        icon: Layers
      }));
    }
    return [];
  });

  pickerActiveId = computed(() => {
    const job = this.activePickerJob();
    const type = this.pickerType();
    if (!job || !type) return null;
    if (type === 'MACHINE') return job.machineId || null;
    if (type === 'STAGE') return job.currentStage || null;
    return job.operatorId || null;
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
      const [jobsData, machinesData, empsData] = await Promise.all([
        this.api.getJobs({ businessId }),
        this.maquinasApi.getAll(businessId),
        this.pedidosApi.getEmployees(businessId)
      ]);
      
      this.jobs.set(jobsData || []);
      this.machines.set(machinesData.data || []);
      this.employees.set(empsData || []);
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
      // Optimistic update
      const prev = this.jobs();
      this.jobs.update(list => list.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
      
      const updated = await this.api.updateStatus(job.id, newStatus);
      this.jobs.update(list => list.map(j => j.id === job.id ? updated : j));
    } catch (e) {
      console.error('[ProductionBoard] Update error:', e);
      this.loadJobs(this.session.activeId()!); // Reset on error
    }
  }

  openPicker(job: ProductionJob, type: 'MACHINE' | 'OPERATOR' | 'STAGE') {
    this.activePickerJob.set(job);
    this.pickerType.set(type);
  }

  async handleSelection(selectedId: string | null) {
    const job = this.activePickerJob();
    const type = this.pickerType();
    if (!job || !type) return;

    try {
      const payload: any = {};
      if (type === 'MACHINE') payload.machineId = selectedId;
      else if (type === 'OPERATOR') payload.operatorId = selectedId;

      // Optimistic Update
      this.jobs.update(list => list.map(j => {
        if (j.id === job.id) {
          if (type === 'MACHINE') return { ...j, machineId: selectedId || undefined, machine: selectedId ? this.machines().find(m => m.id === selectedId) : undefined };
          if (type === 'OPERATOR') return { ...j, operatorId: selectedId || undefined, responsable: selectedId ? this.employees().find(e => e.id === selectedId) : undefined };
          if (type === 'STAGE') return { ...j, currentStage: selectedId || undefined };
        }
        return j;
      }));

      let updated;
      if (type === 'STAGE') {
        updated = await this.api.updateStage(job.id, selectedId || '');
      } else {
        updated = await this.api.assignResources(job.id, payload);
      }
      this.jobs.update(list => list.map(j => j.id === job.id ? updated : j));
    } catch (e) {
      console.error('[ProductionBoard] Assignment error:', e);
      this.loadJobs(this.session.activeId()!);
    } finally {
      this.activePickerJob.set(null);
      this.pickerType.set(null);
    }
  }
}
