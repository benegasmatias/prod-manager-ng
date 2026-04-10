import { Component, Input, Output, EventEmitter, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Gauge, AlertOctagon, X, Layers, User, Calendar, MessageSquare, RefreshCw, ChevronDown, ChevronLeft, Cpu, Check, ChevronRight, Zap, Target } from 'lucide-angular';
import { Pedido, Employee, Machine, Material } from '@shared/models';
import { MultiMaterial } from '@shared/models/material-consumption';
import { getNegocioConfig, getStatusLabel, getStatusStyles } from '@shared/utils';
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
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-300">
      
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm cursor-pointer"
        (click)="close()">
      </div>

      <!-- Modal Container -->
      <div class="relative w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-500">
        
        <!-- Header -->
        <div class="bg-zinc-50 dark:bg-zinc-900/50 px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <lucide-angular [img]="icons.Gauge" class="h-6 w-6"></lucide-angular>
              </div>
              <div>
                <h2 class="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">Control de Inventario</h2>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Lote #{{ order.code }}</span>
                  <span class="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase rounded-full">Proceso Interno</span>
                </div>
              </div>
            </div>
            
            <button 
              (click)="close()" 
              class="h-10 w-10 flex items-center justify-center rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-95">
              <lucide-angular [img]="icons.X" class="h-5 w-5 text-zinc-400"></lucide-angular>
            </button>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-8 lg:p-10 space-y-10">

          <!-- 1. Horizontal Stepper (Visual Only) -->
          <div class="space-y-4">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2 px-1">
              <lucide-angular [img]="icons.Target" class="h-3 w-3"></lucide-angular>
              Estado de Producción
            </label>
            <div class="flex items-center gap-2 overflow-x-auto pb-4 -mx-1 px-1 hide-scrollbar">
              @for (stage of stages(); track stage.key) {
                <button 
                  (click)="selectedStatus.set(stage.key)"
                  [class]="'flex-shrink-0 px-5 py-3 rounded-2xl border text-[11px] font-black uppercase tracking-tight transition-all active:scale-95 ' + 
                    (selectedStatus() === stage.key ? getStatusStyles(stage.key) + ' ring-4 ring-offset-2 dark:ring-offset-zinc-950 ring-current' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300')"
                >
                  {{ stage.label }}
                </button>
              }
            </div>
          </div>

          <!-- 2. Main Refactor: Section Dispatcher -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Left Side: Basic Info & Assignment -->
            <div class="space-y-8">
              
              <!-- Operator Assignment -->
              <div class="space-y-4 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                  <lucide-angular [img]="icons.User" class="h-3 w-3"></lucide-angular>
                  Asignar Operador
                </label>
                <select 
                  class="w-full h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 text-[13px] font-black focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-zinc-900 dark:text-zinc-50"
                  [(ngModel)]="selectedOperatorId">
                  <option value="">SIN ASIGNAR...</option>
                  @for (emp of employees(); track emp.id) {
                    <option [value]="emp.id">{{ emp.firstName | uppercase }} {{ emp.lastName | uppercase }}</option>
                  }
                </select>
              </div>

              <!-- General Notes -->
              <div class="space-y-4">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2 px-1">
                  <lucide-angular [img]="icons.MessageSquare" class="h-3 w-3"></lucide-angular>
                  Notas de Lote / Incidencias
                </label>
                <textarea 
                  [(ngModel)]="notes"
                  placeholder="Detalles técnicos, problemas encontrados, o notas de control de calidad..."
                  class="w-full h-32 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-zinc-600 dark:text-zinc-400 resize-none">
                </textarea>
              </div>
            </div>

            <!-- Right Side: Domain Specific Data -->
            <div class="space-y-8">
              
              <!-- Transition Logic UI -->
              @if (is3D()) {
                <app-impresion-3d-section
                  [status]="selectedStatus()"
                  [machines]="machines()"
                  [materials]="materials()"
                  [selectedMachineId]="selectedMachineId()"
                  [multiMaterials]="multiMaterials()"
                  (machineChange)="selectedMachineId.set($event)"
                  (multiMaterialsChange)="multiMaterials.set($event)">
                </app-impresion-3d-section>
              }

              @if (isMetalurgica()) {
                <app-metalurgica-section
                  [order]="order"
                  [status]="selectedStatus()"
                  [(visitObservations)]="notes">
                </app-metalurgica-section>
              }

              @if (selectedStatus() === 'FAILED') {
                <app-failure-module 
                  [order]="order"
                  [rubro]="rubro()"
                  [reason]="failureReason"
                  [action]="failureAction"
                  [wastedTime]="wastedTime"
                  [wastedMaterial]="wastedMaterial">
                </app-failure-module>
              }
            </div>

          </div>

        </div>

        <!-- Footer -->
        <div class="bg-zinc-50 dark:bg-zinc-900/50 px-8 py-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
          <p class="text-[10px] font-bold text-zinc-400 italic">Actualizar lote cambia automáticamente el reporte de producción.</p>
          
          <div class="flex items-center gap-3">
            <button 
              (click)="close()"
              class="px-6 py-3 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
              Cancelar
            </button>
            <button 
              (click)="save()"
              [disabled]="loading()"
              class="px-8 py-3 bg-primary text-white dark:text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-xl shadow-primary/20 flex items-center gap-2">
              <span *ngIf="!loading()">{{ primaryActionLabel() }}</span>
              <lucide-angular *ngIf="loading()" [img]="icons.RefreshCw" class="h-4 w-4 animate-spin"></lucide-angular>
              <lucide-angular *ngIf="!loading()" [img]="icons.Check" class="h-4 w-4"></lucide-angular>
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class StockStatusModalComponent {
  @Input() isOpen = false;
  @Input({ required: true }) order!: Pedido;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<void>();

  // Failure Handling Signals
  failureReason = signal<string>('');
  failureAction = signal<'REDO' | 'DISCARD' | 'KEEP'>('REDO');
  wastedTime = signal<number>(0);
  wastedMaterial = signal<number>(0);

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
      const payload: any = {
        status: this.selectedStatus(),
        responsableId: this.selectedOperatorId || null,
        notes: this.notes,
        businessId: this.session.activeNegocio()?.id
      };

      if (this.is3D() && this.selectedMachineId()) {
        payload.machineId = this.selectedMachineId();
        payload.multiMaterials = this.multiMaterials();
      }

      const updated = await this.api.update(this.order.id, payload);
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
