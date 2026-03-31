import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaquinasService } from '@core/api/maquinas.service';
import { SessionService } from '@core/session/session.service';
import { MaterialesService } from '@core/api/materiales.service';
import { PedidosApiService } from '@core/api/pedidos.api.service';
import { Machine, Pedido, Material } from '@shared/models';
import { LucideAngularModule, Plus, ChevronDown, Settings, Activity, PlayCircle, AlertTriangle, Check, MoreHorizontal, Info, Cpu, Edit2, Trash2, Calendar, Package, X } from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

@Component({
  selector: 'app-maquinas',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonSpinnerComponent],
  templateUrl: './maquinas.component.html'
})
export class MaquinasPageComponent {
  private maquinasService = inject(MaquinasService);
  private sessionService = inject(SessionService);
  private materialesService = inject(MaterialesService);
  private pedidosApi = inject(PedidosApiService);

  // States from service
  loading = this.maquinasService.loading;
  saving = this.maquinasService.saving;
  maquinas = this.maquinasService.items;
  stats = this.maquinasService.stats;
  
  // Local state
  negocio = this.sessionService.activeNegocio;
  config = this.sessionService.config;
  estadoFilter = signal<'all' | 'IDLE' | 'WORKING' | 'MAINTENANCE'>('all');

  // Dialog states
  isDialogOpen = signal(false);
  selectedMachineId = signal<string | null>(null);
  
  // Form states
  formNombre = signal('');
  formModelo = signal('');
  formNozzle = signal('0.4mm');
  formMaxFilaments = signal(1);

  // Assignment states
  isAssignDialogOpen = signal(false);
  pendingOrders = signal<Pedido[]>([]);
  availableMaterials = signal<Material[]>([]);
  selectedOrderId = signal<string>('');
  selectedMaterialId = signal<string>('');
  loadingOrders = signal(false);

  // Detail states
  isDetailSheetOpen = signal(false);
  selectedMachineDetail = signal<Machine | null>(null);
  loadingDetail = signal(false);

  readonly icons = { Plus, ChevronDown, Settings, Activity, PlayCircle, AlertTriangle, Check, MoreHorizontal, Info, Cpu, Edit2, Trash2, Calendar, Package, X };

  filteredMaquinas = computed(() => {
    const all = this.maquinas();
    const filter = this.estadoFilter();
    if (filter === 'all') return all;
    return all.filter(m => m.status === filter);
  });

  constructor() {
    effect(() => {
      this.maquinasService.loadMaquinas();
    });
  }

  cn = cn;

  openNew() {
    this.selectedMachineId.set(null);
    this.formNombre.set('');
    this.formModelo.set('');
    this.formNozzle.set('0.4mm');
    this.formMaxFilaments.set(1);
    this.isDialogOpen.set(true);
  }

  async editMachine(machine: Machine) {
    this.selectedMachineId.set(machine.id);
    this.formNombre.set(machine.name);
    this.formModelo.set(machine.model || '');
    this.formNozzle.set(machine.nozzle || '0.4mm');
    this.formMaxFilaments.set(machine.maxFilaments || 1);
    this.isDialogOpen.set(true);
    this.isDetailSheetOpen.set(false);
  }

  async handleSave() {
    if (!this.formNombre()) return;

    const payload: Partial<Machine> = {
      name: this.formNombre(),
      model: this.formModelo(),
      businessId: this.negocio()?.id,
      active: true
    };

    if (this.negocio()?.rubro === 'IMPRESION_3D') {
      payload.nozzle = this.formNozzle();
      payload.maxFilaments = this.formMaxFilaments();
    }

    if (this.selectedMachineId()) {
      await this.maquinasService.update(this.selectedMachineId()!, payload);
    } else {
      await this.maquinasService.create(payload);
    }
    this.isDialogOpen.set(false);
  }

  async handleDelete(machineId: string) {
    if (!confirm('¿Estás seguro de desactivar esta unidad?')) return;
    await this.maquinasService.remove(machineId);
    this.isDetailSheetOpen.set(false);
  }

  async openAssign(machine: Machine) {
    this.selectedMachineId.set(machine.id);
    this.isAssignDialogOpen.set(true);
    this.loadingOrders.set(true);
    
    try {
      const businessId = this.negocio()?.id;
      if (!businessId) return;

      const [ordersRes, materials] = await Promise.all([
        this.pedidosApi.getListing({ businessId, status: 'PENDING', pageSize: 100 }),
        this.materialesService.loadMateriales() // Ensure materials are loaded
      ]);
      
      this.pendingOrders.set(ordersRes.data || []);
      const currentMaterials = this.materialesService.items();
      this.availableMaterials.set(currentMaterials);
      
      if (currentMaterials.length > 0) {
        this.selectedMaterialId.set(currentMaterials[0].id);
      }
    } catch (e) {
      console.error('Error loading assign options:', e);
    } finally {
      this.loadingOrders.set(false);
    }
  }

  async handleAssign(orderId: string) {
    const machineId = this.selectedMachineId();
    if (!machineId) return;

    await this.maquinasService.assignOrder(
      machineId, 
      orderId, 
      this.selectedMaterialId() || undefined
    );
    this.isAssignDialogOpen.set(false);
  }

  async handleRelease(machine: Machine) {
    if (this.saving()) return;
    await this.maquinasService.release(machine.id);
  }

  async openDetail(machine: Machine) {
    this.loadingDetail.set(true);
    this.isDetailSheetOpen.set(true);
    try {
      const data = await this.maquinasService.getOne(machine.id);
      this.selectedMachineDetail.set(data);
    } catch (e) {
      console.error('Error loading machine detail:', e);
      this.isDetailSheetOpen.set(false);
    } finally {
      this.loadingDetail.set(false);
    }
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'WORKING': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      case 'MAINTENANCE': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
      default: return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse';
    }
  }

  getStatusText(status: string) {
    switch (status) {
      case 'WORKING': return 'Producción';
      case 'MAINTENANCE': return 'Mantenimiento';
      default: return 'Libre / Operativa';
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'WORKING': return 'text-amber-600 dark:text-amber-400';
      case 'MAINTENANCE': return 'text-rose-600 dark:text-rose-400';
      default: return 'text-emerald-600 dark:text-emerald-400';
    }
  }
}
