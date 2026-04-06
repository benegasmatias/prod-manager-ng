import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../core/session/session.service';
import { ProductionApiService } from '../../core/api/production.api.service';
import { QuickResourcePickerComponent, PickerItem } from './components/quick-picker.component';
import { MaquinasApiService } from '../../core/api/maquinas.api.service';
import { PedidosApiService } from '../../core/api/pedidos.api.service';
import { MaterialesApiService } from '../../core/api/materiales.api.service';
import { 
  LucideAngularModule, Play, Pause, AlertCircle, CheckCircle2, 
  Monitor, User, Info, MoreHorizontal, Settings, LayoutGrid, 
  BarChart3, Activity, Box, Layers, RefreshCcw, Square, Clock,
  Search, Filter, ChevronRight, TrendingUp, List, AlertTriangle
} from 'lucide-angular';
import { ProductionJob, ProductionJobStatus, ProductionJobPriority } from '../../shared/models/production-job';
import { Machine, Employee } from '../../shared/models';
import { StatusBadgeComponent } from '../../shared/ui/badges/status-badge.component';
import { FilterByStatusPipe } from './pipes/filter-by-status.pipe';

@Component({
  selector: 'app-produccion-board',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, QuickResourcePickerComponent, StatusBadgeComponent, FormsModule, FilterByStatusPipe],
  templateUrl: './produccion.component.html',
  styleUrls: ['./produccion.component.css']
})
export class ProduccionBoardComponent {
  private api = inject(ProductionApiService);
  private maquinasApi = inject(MaquinasApiService);
  private pedidosApi = inject(PedidosApiService);
  private materialesApi = inject(MaterialesApiService);
  private session = inject(SessionService);

  // View State
  isCompact = signal(localStorage.getItem('prod_view_compact') === 'true');
  jobs = signal<ProductionJob[]>([]);
  machines = signal<Machine[]>([]);
  employees = signal<Employee[]>([]);
  materiales = signal<any[]>([]);
  loading = signal(true);

  // Filter State
  searchTerm = signal('');
  selectedStatus = signal<ProductionJobStatus | 'ALL'>('ALL');

  // Picker State
  activePickerJob = signal<ProductionJob | null>(null);
  pickerType = signal<'MACHINE' | 'OPERATOR' | 'STAGE' | 'MATERIAL' | null>(null);

  // Time tracking
  currentTime = signal(new Date());

  // Enums for template
  ProductionJobStatus = ProductionJobStatus;
  ProductionJobPriority = ProductionJobPriority;

  // ICONS
  icons = {
    Cog, User, Monitor, Clock, Search, Filter, Box, Layers,
    ChevronRight, AlertCircle, TrendingUp, LayoutGrid, 
    List, CheckCircle2, Play, Pause, Square, AlertTriangle, Activity,
    RefreshCcw, Info, MoreHorizontal, Settings, BarChart3
  };

  constructor() {
    effect(() => {
      const interval = setInterval(() => {
        this.currentTime.set(new Date());
      }, 60000); // Update every minute for timers
      return () => clearInterval(interval);
    });

    effect(() => {
      const bId = this.session.activeId();
      if (bId) {
        this.loadJobs(bId);
        this.loadResources(bId);
      }
    });
  }

  async loadResources(businessId: string) {
    try {
      const [m, e, mat] = await Promise.all([
        this.maquinasApi.getAll(businessId),
        this.pedidosApi.getEmployees(businessId),
        this.materialesApi.getAll(businessId)
      ]);
      this.machines.set(m.data || []);
      this.employees.set(e || []);
      this.materiales.set(mat || []);
    } catch (e) {
      console.error('[ProductionBoard] Error resources:', e);
    }
  }

  async loadJobs(businessId: string) {
    this.loading.set(true);
    try {
      const res = await this.api.getJobs({ businessId });
      this.jobs.set(res || []);
    } catch (e) {
      console.error('[ProductionBoard] Error jobs:', e);
    } finally {
      this.loading.set(false);
    }
  }

  // DERIVED SIGNALS
  filteredJobs = computed(() => {
    const list = this.jobs();
    const query = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();

    return list.filter(j => {
      const matchStatus = status === 'ALL' || j.status === status;
      const matchSearch = !query || 
        (j.order?.orderNumber?.toLowerCase().includes(query)) ||
        (j.orderItem?.productName?.toLowerCase().includes(query));
      return matchStatus && matchSearch;
    });
  });

  pickerTitle = computed(() => {
    const type = this.pickerType();
    if (type === 'MACHINE') return 'Puestos / Máquinas';
    if (type === 'STAGE') return 'Etapa del Trabajo';
    if (type === 'MATERIAL') return 'Reservar Material';
    return 'Operarios / Personal';
  });

  pickerIcon = computed(() => {
    const type = this.pickerType();
    if (type === 'MACHINE') return Monitor;
    if (type === 'STAGE') return Layers;
    if (type === 'MATERIAL') return Box;
    return User;
  });

  pickerItems = computed<PickerItem[]>(() => {
    const type = this.pickerType();
    if (!type) return [];

    if (type === 'MACHINE') {
      return this.machines().map(m => ({
        id: m.id,
        label: m.name,
        sublabel: m.status === 'IDLE' ? 'Disponible' : 'Ocupada',
        icon: Monitor,
        color: m.status === 'IDLE' ? 'text-emerald-500' : 'text-amber-500'
      }));
    } else if (type === 'OPERATOR') {
      return this.employees().map(e => ({
        id: e.id,
        label: `${e.firstName} ${e.lastName}`,
        sublabel: e.role || 'Operario',
        icon: User,
        color: 'text-indigo-500'
      }));
    } else if (type === 'STAGE') {
      const config = this.session.config();
      const stages = config?.productionStages || [];
      return stages.map(s => ({
        id: s.key,
        label: s.label,
        sublabel: 'Cambiar a esta etapa',
        icon: Layers
      }));
    } else if (type === 'MATERIAL') {
      return this.materiales().map(m => ({
        id: m.id,
        label: m.name,
        sublabel: `${m.remainingWeightGrams || 0}g disponibles`,
        icon: Box,
        color: 'text-indigo-500'
      }));
    }
    return [];
  });

  activeSelectionId = computed(() => {
    const job = this.activePickerJob();
    const type = this.pickerType();
    if (!job || !type) return null;
    if (type === 'MACHINE') return job.machineId || null;
    if (type === 'STAGE') return job.currentStage || null;
    if (type === 'MATERIAL') return job.jobMaterials?.[0]?.materialId || null;
    return job.operatorId || null;
  });

  // ACTIONS
  openPicker(job: ProductionJob, type: 'MACHINE' | 'OPERATOR' | 'STAGE' | 'MATERIAL') {
    this.activePickerJob.set(job);
    this.pickerType.set(type);
  }

  getJobTotalMinutes(job: ProductionJob): number {
    let total = Number(job.actualMinutes) || 0;
    
    // Add current session if running
    if (job.status === ProductionJobStatus.IN_PROGRESS && job.lastStartedAt) {
      const start = new Date(job.lastStartedAt).getTime();
      const now = this.currentTime().getTime();
      const sessionMins = Math.floor((now - start) / 60000);
      total += Math.max(0, sessionMins);
    }
    
    return total;
  }

  formatMinutes(mins: number): string {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ''}`;
  }

  async handleSelection(selectedId: string | null) {
    const job = this.activePickerJob();
    const type = this.pickerType();
    const bId = this.session.activeId();
    if (!job || !bId || !type) return;

    try {
      if (type === 'MATERIAL') {
        if (!selectedId) return;
        await this.api.assignMaterial(bId, job.id, { materialId: selectedId, quantity: 1 });
      } else if (type === 'STAGE') {
        await this.api.updateStage(job.id, selectedId || '');
      } else {
        const payload: { operatorId?: string; machineId?: string } = {};
        if (type === 'OPERATOR' && selectedId) payload.operatorId = selectedId;
        if (type === 'MACHINE' && selectedId) payload.machineId = selectedId;
        
        await this.api.assignResources(job.id, payload);
      }
      this.loadJobs(bId);
    } catch (e) {
      console.error('[ProductionBoard] Action error:', e);
      this.loadJobs(bId);
    } finally {
      this.activePickerJob.set(null);
      this.pickerType.set(null);
    }
  }

  async toggleStatus(job: ProductionJob) {
    const bId = this.session.activeId();
    if (!bId) return;

    const nextStatus = job.status === ProductionJobStatus.IN_PROGRESS 
      ? ProductionJobStatus.PAUSED 
      : ProductionJobStatus.IN_PROGRESS;

    // Optimistic
    this.jobs.update(list => list.map(j => j.id === job.id ? { ...j, status: nextStatus } : j));

    try {
      await this.api.updateStatus(job.id, nextStatus);
    } catch (e) {
      console.error('[ProductionBoard] Status error:', e);
      this.loadJobs(bId);
    }
  }

  toggleView() {
    this.isCompact.update(v => {
      const next = !v;
      localStorage.setItem('prod_view_compact', String(next));
      return next;
    });
  }
}

// Mock imports for icons that might be missing from direct lucide
const Cog = Settings;
