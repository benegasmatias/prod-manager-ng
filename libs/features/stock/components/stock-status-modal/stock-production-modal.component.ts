import { Component, Output, EventEmitter, inject, signal, computed, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pedido, Employee, Machine, Material, OrderItemStatus } from '@shared/models';
import { MultiMaterial } from '@shared/models/material-consumption';
import { getNegocioConfig, getStatusLabel, getStatusStyles } from '@shared/utils';
import { cn } from '@shared/utils/cn';
import { SessionService } from '@core/session/session.service';
import { PedidosApiService } from '../../../../core/api/pedidos.api.service';
import { ConfirmService } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { FailureModuleComponent } from '../../../pedidos/status-modal/sections/failure-module.component';
import { MaquinasApiService } from '../../../../core/api/maquinas.api.service';
import { MaterialesApiService } from '../../../../core/api/materiales.api.service';

import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';
import { MaterialSelectorComponent } from '@shared/ui/material-selector/material-selector.component';
import {
  LucideAngularModule, Gauge, AlertOctagon, X, Layers, User, Calendar,
  MessageSquare, RefreshCw, ChevronDown, ChevronLeft, Cpu, Check,
  ChevronRight, Zap, Target, Package, Clock, Monitor, XCircle, Cog,
  DollarSign, Box, CheckCircle2, Plus, Minus, ExternalLink
} from 'lucide-angular';

@Component({
  selector: 'app-stock-production-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule, LucideAngularModule,
    FailureModuleComponent, ButtonSpinnerComponent, MaterialSelectorComponent
  ],
  templateUrl: './stock-production-modal.component.html',
  styleUrls: ['./stock-production-modal.component.css']
})
export class StockProductionModalComponent {
  cn = cn;
  isOpen = input(false);
  order = input.required<Pedido>();
  @Output() onClose = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<void>();

  // APIs & Services
  private api = inject(PedidosApiService);
  private maquinasApi = inject(MaquinasApiService);
  private materialesApi = inject(MaterialesApiService);
  private confirmService = inject(ConfirmService);
  private session = inject(SessionService);

  // Form State
  selectedStatus = computed(() => {
    const orderItems = this.order().items || [];
    if (orderItems.length === 0) return this.order().status;

    const allInStock = orderItems.every(i => i.status === 'IN_STOCK' || i.status === 'CANCELLED');
    const allDoneOrStock = orderItems.every(i => ['DONE', 'IN_STOCK', 'CANCELLED'].includes(i.status || ''));
    const anyActiveOrDone = orderItems.some(i => ['IN_PROGRESS', 'READY', 'PRINTING', 'DONE', 'IN_STOCK'].includes(i.status || ''));

    if (allInStock) return 'IN_STOCK';
    if (allDoneOrStock) return 'DONE';
    if (anyActiveOrDone) return 'IN_PROGRESS';
    
    return 'PENDING';
  });
  selectedOperatorId = '';
  notes = '';
  loading = signal(false);


  // Granular Management
  selectedItemId = signal<string | null>(null);
  selectedItemForFailureId = signal<string | null>(null);
  updatingItemIds = signal<Set<string>>(new Set());
  isProcessingGlobal = computed(() => this.updatingItemIds().size > 0 || this.loading());

  selectedItemForFailure = computed(() => {
    const id = this.selectedItemForFailureId();
    return this.order().items?.find(i => i.id === id) || null;
  });

  // Domains
  machines = signal<Machine[]>([]);
  materials = signal<Material[]>([]);
  employees = signal<Employee[]>([]);
  selectedMachineId = signal<string>('');
  multiMaterials = signal<MultiMaterial[]>([]);

  // Assignment State
  itemToAssignId = signal<string | null>(null);
  selectedMachineIdForItem = signal<string>('');
  filamentAssignments = signal<{ materialId: string; grams: number }[]>([{ materialId: '', grams: 0 }]);

  // Failure State
  failureReason = signal<string>('');
  failureAction = signal<'REDO' | 'DISCARD' | 'KEEP'>('REDO');
  wastedTime = signal<number>(0);
  failureMaterialWastes = signal<{ materialId: string; grams: number }[]>([{ materialId: '', grams: 0 }]);
  isSaving = signal(false);

  currentGlobalStep = computed(() => {
    const s = String(this.selectedStatus());
    if (s === 'PENDING') return 0;
    if (['IN_PROGRESS', 'PRINTING', 'IN_PRODUCTION'].includes(s)) return 1;
    if (['DONE', 'READY'].includes(s)) return 2;
    if (s === 'IN_STOCK') return 3;
    return 1;
  });

  GLOBAL_STAGES = [
    { key: 'PENDING', label: 'Pendiente', icon: 'Clock' },
    { key: 'IN_PROGRESS', label: 'En Proceso', icon: 'Cpu' },
    { key: 'DONE', label: 'Listo', icon: 'CheckCircle2' },
    { key: 'IN_STOCK', label: 'En Stock', icon: 'Package' }
  ];

  icons = {
    Gauge, AlertOctagon, X, Layers, User, Calendar, MessageSquare,
    RefreshCw, ChevronDown, ChevronLeft, Cpu, Check, ChevronRight, Zap, Target, Package,
    Clock, Monitor, XCircle, Cog, DollarSign, Box, CheckCircle2, Plus, Minus, ExternalLink
  };

  getIcon(name: string): any {
    return (this.icons as any)[name] || this.icons.Check;
  }

  rubro = computed(() => this.session.activeNegocio()?.rubro || 'GENERICO');
  is3D = computed(() => this.rubro() === 'IMPRESION_3D');
  isMetalurgica = computed(() => this.rubro() === 'METALURGICA');

  primaryActionLabel = computed(() => {
    const s = this.selectedStatus();
    if (s === 'PENDING') return 'INICIAR MANUFACTURA';
    if (s === 'IN_PROGRESS') return 'FINALIZAR LOTE';
    if (s === 'DONE' || s === 'READY') return 'INGRESAR A STOCK';
    if (s === 'IN_STOCK') return 'LOTE COMPLETADO';
    return 'GUARDAR REGISTRO';
  });

  constructor() {
    effect(() => {
      const order = this.order();
      const open = this.isOpen();
      
      if (open && order) {
        this.selectedOperatorId = order.responsableGeneralId || order.operatorId || '';
        this.notes = order.notes || '';

        // Solo cargamos si no tenemos empleados (primera vez o cambio de negocio)
        // Y solo si el estado requiere asignación (PENDIENTE o EN_PROCESO)
        const s = this.selectedStatus();
        const needsDomains = ['PENDING', 'IN_PROGRESS'].includes(s);
        
        if (this.employees().length === 0 && needsDomains) {
          this.loadContext();
        }
      }
    });
  }

  async loadContext() {
    const bId = this.session.activeId();
    if (!bId) return;
    try {
      const emps = await this.api.getEmployees(bId);
      this.employees.set(emps);

      const [macsRes, mats] = await Promise.all([
        this.maquinasApi.getAll(bId),
        this.materialesApi.getAll(bId)
      ]);
      this.machines.set(macsRes.data || (macsRes as any));
      this.materials.set(mats);
    } catch (err) { console.error('Error load manufacturing context:', err); }
  }

  // Domain Actions: Inventory Lifecycle
  async updateItemStatus(itemId: string, status: string, name: string = '') {
    const order = this.order();
    if (!order || this.updatingItemIds().has(itemId)) return;

    this.updatingItemIds.update((ids: Set<string>) => {
      const newIds = new Set(ids);
      newIds.add(itemId);
      return newIds;
    });

    try {
      // Intento normal
      await this.api.updateItemStatus(order.id, itemId, status, order.businessId);
      this.onSaved.emit();
    } catch (e: any) {
      console.error('Error updating item status:', e);
      
      this.updatingItemIds.update((ids: Set<string>) => {
        const newIds = new Set(ids);
        newIds.delete(itemId);
        return newIds;
      });

      const errorMsg = (e.error?.message || '').toLowerCase();
      const isMachineError = errorMsg.includes('trabajo activo en máquina') || errorMsg.includes('debe liberarse primero');
      
      if (isMachineError) {
         const targetItem = order.items?.find((i: any) => i.id === itemId);
         const itemJob = targetItem?.job || (targetItem as any)?.productionJob;
         let machineId = itemJob?.machine?.id || itemJob?.machineId;
         
         if (!machineId && (order as any).jobs) {
           const job = ((order as any).jobs as any[]).find((j: any) => (j.orderItemId === itemId || j.itemId === itemId));
           machineId = job?.machineId || job?.machine?.id;
         }

         const confirmed = await this.confirmService.confirm({
            title: 'Ítem en Máquina',
            message: 'El ítem tiene un trabajo activo. ¿Deseas liberar la máquina y forzar el cambio de estado ahora?',
            confirmLabel: 'Liberar y Cambiar',
            cancelLabel: 'Cancelar',
            type: 'warning'
         });

         if (confirmed) {
            this.updatingItemIds.update(ids => new Set(ids).add(itemId));
            try {
               // Liberamos y re-intentamos con force: true
               if (machineId) {
                 await this.maquinasApi.release(machineId, order.businessId);
               }
               await this.api.updateItemStatus(order.id, itemId, status, order.businessId, true);
               this.onSaved.emit();
            } catch (err2) {
               console.error('Error in release and retry:', err2);
               this.updatingItemIds.update(ids => {
                 const newIds = new Set(ids);
                 newIds.delete(itemId);
                 return newIds;
               });
               this.confirmService.confirm({
                   title: 'Error',
                   message: 'No se pudo liberar la máquina automáticamente.',
                   hideCancel: true,
                   type: 'danger'
               });
            }
         }
      } else {
         this.confirmService.confirm({
            title: 'Error',
            message: e.error?.message || 'Error al actualizar el ítem.',
            hideCancel: true,
            type: 'danger'
         });
      }
    } finally {
      this.updatingItemIds.update((ids: Set<string>) => {
        const newIds = new Set(ids);
        newIds.delete(itemId);
        return newIds;
      });
    }
  }


  async prepareAssign(itemId: string) {
    this.itemToAssignId.set(itemId);
    
    // Buscar los datos del item
    const item = this.order().items?.find(i => i.id === itemId);
    const weight = (item as any)?.weightGrams || (item as any)?.weight || 0;
    
    this.filamentAssignments.set([{ materialId: '', grams: weight }]);
    
    const available = this.machines().filter(m => m.status === 'IDLE');
    if (available.length > 0) {
      this.selectedMachineIdForItem.set(available[0].id);
    }
  }

  cancelAssign() {
    this.itemToAssignId.set(null);
    this.selectedMachineIdForItem.set('');
    this.filamentAssignments.set([{ materialId: '', grams: 0 }]);
  }

  addFilamentAssignment() {
    const machine = this.machines().find(m => m.id === this.selectedMachineIdForItem());
    const max = (machine as any)?.maxFilaments || 1;
    if (this.filamentAssignments().length < max) {
      this.filamentAssignments.update(list => [...list, { materialId: '', grams: 0 }]);
    }
  }

  removeFilamentAssignment(index: number) {
    if (this.filamentAssignments().length > 1) {
      this.filamentAssignments.update(list => list.filter((_, i) => i !== index));
    }
  }

  updateFilamentAssignment(index: number, data: Partial<{ materialId: string; grams: number }>) {
    this.filamentAssignments.update(list => {
      const newList = [...list];
      const finalGrams = data.grams !== undefined ? Math.max(0, data.grams) : newList[index].grams;
      newList[index] = { ...newList[index], ...data, grams: finalGrams };
      return newList;
    });
  }

  async startItemProduction(itemId: string, machineId: string = this.selectedMachineIdForItem()) {
    const order = this.order();
    const assignments = this.filamentAssignments();
    if (!order || !machineId || !itemId) return;

    this.loading.set(true);
    try {
      const metadata = this.is3D() ? { 
        materials: assignments.map(a => ({
          materialId: a.materialId,
          gramsPerUnit: a.grams / (order?.items.find(i => i.id === itemId)?.qty || 1)
        })),
        estimatedGrams: assignments.reduce((acc, curr) => acc + curr.grams, 0)
      } : undefined;

      await this.maquinasApi.assignOrder(
        machineId, 
        order.id, 
        itemId, 
        assignments[0]?.materialId || undefined, 
        order.businessId,
        metadata
      );
      this.onSaved.emit();
      this.cancelAssign();
    } finally {
      this.loading.set(false);
    }
  }

  // Failure Management
  addFailureMaterial() {
    this.failureMaterialWastes.update(mats => [...mats, { materialId: '', grams: 0 }]);
  }

  handleRemoveFailureMaterial(index: number) {
    this.failureMaterialWastes.update(mats => mats.filter((_, i) => i !== index));
  }

  handleFailureMaterialChange(index: number, materialId: string) {
    this.failureMaterialWastes.update(mats => {
      const newMats = [...mats];
      newMats[index] = { ...newMats[index], materialId };
      return newMats;
    });
  }

  handleFailureGramsChange(index: number, grams: number) {
    this.failureMaterialWastes.update(mats => {
      const newMats = [...mats];
      newMats[index] = { ...newMats[index], grams };
      return newMats;
    });
  }

  async saveFailure() {
    const item = this.selectedItemForFailure();
    const order = this.order();
    if (!item || !order || this.isSaving()) return;
    this.isSaving.set(true);
    try {
      const wastes = this.failureMaterialWastes();
      await this.api.reportFailure(order.id, {
        businessId: order.businessId,
        itemId: item.id,
        reason: this.failureReason(),
        action: this.failureAction(),
        wastedGrams: wastes.reduce((acc, curr) => acc + (curr.grams || 0), 0),
        materialWastes: wastes,
        targetStatus: 'FAILED',
        metadata: { wastedTime: this.wastedTime() }
      });
      this.onSaved.emit();
      this.selectedItemForFailureId.set(null);
    } finally { this.isSaving.set(false); }
  }

  close() { this.onClose.emit(); }

  async save() {
    if (this.loading()) return;
    this.loading.set(true);
    try {
      const payload: any = {
        status: this.selectedStatus(),
        responsableGeneralId: this.selectedOperatorId || null,
        notes: this.notes,

        businessId: this.order().businessId
      };
      await this.api.update(this.order().id, payload);
      this.onSaved.emit();
      this.close();
    } finally { this.loading.set(false); }
  }

  getStatusStylesHelper = getStatusStyles;
  statusLabelHelper = getStatusLabel;
}
