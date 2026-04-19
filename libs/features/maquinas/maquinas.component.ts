import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaquinasService } from '@core/api/maquinas.service';
import { SessionService } from '@core/session/session.service';
import { MaterialesService } from '@core/api/materiales.service';
import { PedidosApiService } from '@core/api/pedidos.api.service';
import { Machine, Pedido, Material } from '@shared/models';
import { LucideAngularModule, Plus, ChevronDown, Cpu } from 'lucide-angular';
import { cn } from '@shared/utils/cn';
import { ConfirmService } from '@shared/ui/confirm-dialog/confirm-dialog.component';

import { MachineCardComponent } from './components/machine-card.component';
import { MachineFormDialogComponent } from './components/machine-form-dialog.component';
import { MachineAssignmentDialogComponent } from './components/machine-assignment-dialog.component';
import { MachineDetailSheetComponent } from './components/machine-detail-sheet.component';

@Component({
  selector: 'app-maquinas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,

    MachineCardComponent,
    MachineFormDialogComponent,
    MachineAssignmentDialogComponent,
    MachineDetailSheetComponent
  ],
  templateUrl: './maquinas.component.html'
})
export class MaquinasPageComponent {
  private maquinasService = inject(MaquinasService);
  private sessionService = inject(SessionService);
  private materialesService = inject(MaterialesService);
  private pedidosApi = inject(PedidosApiService);
  private confirmService = inject(ConfirmService);

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
  selectedMachineData = signal<Partial<Machine> | null>(null);

  // Assignment states
  isAssignDialogOpen = signal(false);
  pendingOrders = signal<Pedido[]>([]);
  availableMaterials = signal<Material[]>([]);
  loadingOrders = signal(false);

  // Detail states
  isDetailSheetOpen = signal(false);
  selectedMachineDetail = signal<Machine | null>(null);
  loadingDetail = signal(false);

  readonly icons = { Plus, ChevronDown, Cpu };

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
    this.selectedMachineData.set({
      name: '',
      model: '',
      nozzle: '0.4mm',
      maxFilaments: 1
    });
    this.isDialogOpen.set(true);
  }

  async editMachine(machine: Machine) {
    this.selectedMachineId.set(machine.id);
    this.selectedMachineData.set({ ...machine });
    this.isDialogOpen.set(true);
    this.isDetailSheetOpen.set(false);
  }

  async handleSave(data: Partial<Machine>) {
    if (this.selectedMachineId()) {
      // Saneamiento de DTO para UPDATE (evitar id, createdAt, businessId, etc en el BODY)
      const { 
        id, createdAt, updatedAt, businessId, status, 
        productionJobs, lastJob, isActive, active, 
        ...cleanData 
      } = data as any;

      await this.maquinasService.update(this.selectedMachineId()!, cleanData);
    } else {
      const payload: Partial<Machine> = {
        ...data,
        businessId: this.negocio()?.id,
        active: true
      };
      await this.maquinasService.create(payload);
    }
    this.isDialogOpen.set(false);
  }

  async handleDelete(machineId: string) {
    const label = this.config().labels.maquinas.slice(0, -1).toLowerCase();
    const confirmed = await this.confirmService.confirm({
      title: `Desactivar ${label}`,
      message: `¿Estás seguro de desactivar esta ${label}? Podrás reactivarla más adelante.`,
      confirmLabel: 'Desactivar',
      cancelLabel: 'Cancelar',
      type: 'warning'
    });
    if (!confirmed) return;
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

      const [ordersRes] = await Promise.all([
        this.pedidosApi.getListing({ businessId, status: 'PENDING', pageSize: 100 }),
        this.materialesService.loadMateriales()
      ]);

      this.pendingOrders.set(ordersRes.data || []);
      this.availableMaterials.set(this.materialesService.items());
    } catch (e) {
      console.error('Error loading assign options:', e);
    } finally {
      this.loadingOrders.set(false);
    }
  }

  async handleAssign(event: { orderId: string; orderItemId?: string; materialId: string }) {
    const machineId = this.selectedMachineId();
    if (!machineId) return;

    await this.maquinasService.assignOrder(
      machineId,
      event.orderId,
      event.orderItemId,
      event.materialId || undefined
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
}
