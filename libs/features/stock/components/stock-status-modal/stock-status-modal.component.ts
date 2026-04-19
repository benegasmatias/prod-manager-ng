import { Component, Input, Output, EventEmitter, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Gauge, AlertOctagon, X, Layers, User, Calendar, MessageSquare, RefreshCw, ChevronDown, ChevronLeft, Cpu, Check, ChevronRight, Zap, Target } from 'lucide-angular';
import { Pedido, Employee, Machine, Material } from '@shared/models';
import { MultiMaterial } from '@shared/models/material-consumption';
import { getNegocioConfig, getStatusLabel, getStatusStyles } from '@shared/utils';
import { cn } from '@shared/utils/cn';
import { SessionService } from '@core/session/session.service';
import { PedidosApiService } from '../../../../core/api/pedidos.api.service';
import { Impresion3dSectionComponent } from '../../../pedidos/status-modal/sections/impresion-3d-section.component';
import { MetalurgicaSectionComponent } from '../../../pedidos/status-modal/sections/metalurgica-section.component';
import { FailureModuleComponent } from '../../../pedidos/status-modal/sections/failure-module.component';
import { MaquinasApiService } from '../../../../core/api/maquinas.api.service';
import { MaterialesApiService } from '../../../../core/api/materiales.api.service';

@Component({
  selector: 'app-stock-status-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule, LucideAngularModule, 
    Impresion3dSectionComponent, MetalurgicaSectionComponent, FailureModuleComponent
  ],
  templateUrl: './stock-status-modal.component.html',
  styleUrls: ['./stock-status-modal.component.css']
})
export class StockStatusModalComponent {
  cn = cn;
  @Input() isOpen = false;
  @Input({ required: true }) order!: Pedido;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<void>();

  // Failure Handling Signals
  failureReason = signal<string>('');
  failureAction = signal<'REDO' | 'DISCARD' | 'KEEP'>('REDO');
  wastedTime = signal<number>(0);
  failureMaterialWastes = signal<{ materialId: string, grams: number }[]>([]);

  handleRemoveFailureMaterial(index: number) {
    this.failureMaterialWastes.update(list => list.filter((_, i) => i !== index));
  }

  handleFailureMaterialChange(index: number, materialId: string) {
    this.failureMaterialWastes.update(list => {
      const newList = [...list];
      newList[index] = { ...newList[index], materialId };
      return newList;
    });
  }

  handleFailureGramsChange(index: number, grams: number) {
    this.failureMaterialWastes.update(list => {
      const newList = [...list];
      newList[index] = { ...newList[index], grams };
      return newList;
    });
  }

  addFailureMaterial() {
    this.failureMaterialWastes.update(list => [...list, { materialId: '', grams: 0 }]);
  }

  private api = inject(PedidosApiService);
  private maquinasApi = inject(MaquinasApiService);
  private materialesApi = inject(MaterialesApiService);
  private session = inject(SessionService);

  // Form State
  selectedStatus = signal<string>('');
  selectedOperatorId = '';
  notes = '';
  loading = signal(false);

  // Domains
  machines = signal<Machine[]>([]);
  materials = signal<Material[]>([]);
  employees = signal<Employee[]>([]);
  selectedMachineId = signal<string>('');
  multiMaterials = signal<MultiMaterial[]>([]);

  icons = {
    Gauge, AlertOctagon, X, Layers, User, Calendar, MessageSquare, 
    RefreshCw, ChevronDown, ChevronLeft, Cpu, Check, ChevronRight, Zap, Target
  };

  rubro = computed(() => this.session.activeNegocio()?.rubro || 'GENERICO');
  is3D = computed(() => this.rubro() === 'IMPRESION_3D');
  isMetalurgica = computed(() => this.rubro() === 'METALURGICA');

  stages = computed(() => {
    const config = getNegocioConfig(this.rubro());
    const allowed = ['PENDING', 'IN_PROGRESS', 'DONE', 'IN_STOCK', 'FAILED', 'RE_WORK', 'CANCELLED'];
    return config.productionStages
      .filter(s => allowed.includes(s.key))
      .map(s => ({
        ...s,
        label: getStatusLabel(s.key, this.rubro(), 'STOCK')
      }));
  });

  primaryActionLabel = computed(() => {
    const s = this.selectedStatus();
    switch (s) {
      case 'PENDING': return 'Iniciar Manufactura';
      case 'IN_PROGRESS': return 'Confirmar Avance';
      case 'DONE': return 'Finalizar e Ingresar a Stock';
      case 'IN_STOCK': return 'Actualizar Registro';
      case 'FAILED': return 'Reportar Fallo';
      default: return 'Actualizar Inventario';
    }
  });

  constructor() {
    effect(() => {
      if (this.isOpen && this.order) {
        this.selectedStatus.set(this.order.status);
        this.selectedOperatorId = this.order.responsableId || this.order.operatorId || '';
        this.notes = this.order.notes || '';
        this.loadContext();
        
        // Initial 3D state if applicable
        if (this.is3D() && this.order.jobs?.[0]) {
           const job = this.order.jobs[0];
           this.selectedMachineId.set(job.machineId || '');
           if (job.jobMaterials) {
              this.multiMaterials.set(job.jobMaterials.map(m => ({ 
                materialId: m.materialId, 
                gramsPerUnit: m.gramsPerUnit || 0 
              })));
           }
        }
      }
    });
  }

  async loadContext() {
    const bId = this.session.activeNegocio()?.id;
    if (!bId) return;
    try {
      const [emps] = await Promise.all([this.api.getEmployees(bId)]);
      this.employees.set(emps);
      
      if (this.is3D()) {
        const [macsRes, mats] = await Promise.all([
          this.maquinasApi.getAll(bId),
          this.materialesApi.getAll(bId)
        ]);
        this.machines.set(macsRes.data);
        this.materials.set(mats);
      }
    } catch (err) { console.error('Error contexto stock modal:', err); }
  }

  close() {
    this.onClose.emit();
  }

  async save() {
    if (this.loading()) return;
    this.loading.set(true);
    try {
      const bId = this.session.activeNegocio()?.id;
      
      if (this.selectedStatus() === 'FAILED') {
        const wastes = this.failureMaterialWastes();
        await this.api.reportFailure(this.order.id, {
          businessId: bId,
          reason: this.failureReason(),
          action: this.failureAction(),
          wastedGrams: wastes.reduce((acc, curr) => acc + (curr.grams || 0), 0),
          materialWastes: wastes,
          targetStatus: 'FAILED',
          metadata: {
            wastedTime: this.wastedTime()
          }
        });
      } else {
        const payload: any = {
          status: this.selectedStatus(),
          responsableId: this.selectedOperatorId || null,
          notes: this.notes,
          businessId: bId
        };

        if (this.is3D() && this.selectedMachineId()) {
          payload.machineId = this.selectedMachineId();
          payload.multiMaterials = this.multiMaterials();
        }

        await this.api.update(this.order.id, payload);
      }

      this.onSaved.emit();
      this.close();
    } catch (error) {
      console.error('Error actualizando stock:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getStatusStyles = getStatusStyles;
  getStatusLabel = getStatusLabel;
}
