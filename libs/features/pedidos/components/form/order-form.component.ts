import { Component, Input, Output, EventEmitter, inject, signal, computed, effect, OnDestroy, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Plus, Save, Zap, Calendar, CheckCircle2, ChevronDown, RefreshCw, Calculator, ChevronUp, MoreVertical, X, PlusCircle, ArrowRight, Layers, PencilLine, Trash2 } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';
import { SessionService } from '@core/session/session.service';
import { PedidosApiService } from '@core/api/pedidos.api.service';
import { ClientesApiService } from '@core/api/clientes.api.service';
import { Employee, Client, Rubro, ItemPedido } from '@shared/models';
import { ClientSelectorComponent } from '@shared/ui/clientes/client-selector.component';
import { EmployeeSelectorComponent } from '@shared/ui/employees/employee-selector.component';
import { IntelligentDatePickerComponent } from '@shared/ui/calendar/intelligent-date-picker.component';
import { AppDatePickerComponent } from '@shared/ui/app-date-picker/app-date-picker.component';
import { ItemDetailsFormComponent } from './items-section/item-details-form.component';
import { FloatingCalculatorComponent } from './floating-calculator.component';
import { FilesApiService } from '@core/api/files.api.service';
import { cn } from '@shared/utils/cn';
import { OrderCalculatorService } from '../../services/order-calculator.service';
import { ButtonSpinnerComponent } from '@shared/ui';
import { LayoutService } from '@core/layout/layout.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  host: { 'class': 'block' },
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    RouterModule,
    ClientSelectorComponent,
    EmployeeSelectorComponent,
    IntelligentDatePickerComponent,
    ItemDetailsFormComponent,
    ButtonSpinnerComponent
  ],
  template: `
    <form (submit)="handleSave($event)" class="bg-[#fbfcff] min-h-screen relative pb-40 font-sans max-w-2xl mx-auto">
      
      <!-- Side-Sheet Sidebar Overlay -->
      @if (editingItemIndex() !== null) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] animate-in fade-in duration-500" (click)="closeSidebar()">
          <div class="fixed right-0 top-0 h-screen w-full max-w-[520px] bg-white shadow-2xl flex flex-col z-[110]" (click)="$event.stopPropagation()">
            
            <!-- Sidebar Header (Fixed) -->
            <div class="px-10 pt-19 pb-8 flex items-center justify-between border-b border-slate-50 shrink-0">
              <div class="flex items-center gap-6">
                <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-[#8b5cf6] text-white flex items-center justify-center shadow-lg shadow-primary/20">
                  <lucide-angular [img]="icons.Layers" class="h-6 w-6"></lucide-angular>
                </div>
                <div>
                  <h2 class="text-xl font-black text-[#193357] leading-tight">Detalle del Ítem</h2>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Posición #{{ (editingItemIndex() || 0) + 1 }}</p>
                </div>
              </div>
              
              <button type="button" (click)="closeSidebar()" class="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-primary transition-all">
                <lucide-angular [img]="icons.X" class="h-5 w-5"></lucide-angular>
              </button>
            </div>

            <!-- Sidebar Body (Scrollable) -->
            <div class="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
              @if (editingItemIndex() !== null && items()[editingItemIndex()!]) {
                <div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <app-item-details-form
                    [index]="editingItemIndex()!"
                    [item]="items()[editingItemIndex()!]"
                    [config]="config()"
                    [rubro]="rubro"
                    [orderType]="orderType()"
                    [isSaving]="isSaving()"
                    [canRemove]="items().length > 1"
                    [forceEdit]="true"
                    (onRemove)="removeItem(editingItemIndex()!); closeSidebar()"
                    (onUpdate)="recalcTotales()"
                    (onFileUpload)="trackPendingFile($event)"
                    (onFileDelete)="untrackFile($event)"
                  ></app-item-details-form>
                </div>
              }
            </div>

            <!-- Sidebar Footer (Fixed) -->
            <div class="p-8 border-t border-slate-100 bg-white shrink-0">
               <button type="button" (click)="closeSidebar()" class="w-full h-14 rounded-full bg-gradient-to-br from-[#742fe5] to-[#8342f4] text-white font-bold text-sm uppercase tracking-[0.2em] shadow-lg hover:opacity-90 transition-all">
                  Confirmar y Guardar
               </button>
            </div>
          </div>
        </div>
      }

      <!-- Top Actions -->

      <div class="flex items-center justify-between px-10 py-10 sticky top-0 bg-[#fbfcff]/90 backdrop-blur-xl z-50">
        <button type="button" (click)="goBack()" class="h-14 w-14 flex items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 text-primary shadow-sm hover:bg-purple-50 transition-all">
          <lucide-angular [img]="icons.ArrowLeft" class="h-7 w-7"></lucide-angular>
        </button>
        
        <div class="flex flex-col items-center gap-2">
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 leading-none">Terminal de Operaciones</span>
          <h1 class="text-[22px] font-black text-[#193357] tracking-tight leading-none">Nuevo Pedido</h1>
        </div>

        <div class="h-14 w-14"></div> <!-- Balanced side -->
      </div>

      <div class="px-6 space-y-10 pb-20">
        
        <!-- Bloque Superior (Tipo, Cliente, Prioridad, Fecha) -->
        <div class="bg-white rounded-[4rem] p-10 space-y-10 shadow-2xl shadow-purple-500/5 relative group border border-white/50">
          <div class="absolute inset-0 overflow-hidden rounded-[4rem] pointer-events-none">
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]"></div>
          </div>

          <!-- Selector de Tipo de Pedido (Cliente vs Stock) -->
          <div class="flex items-center justify-center">
            <div class="bg-white p-1 rounded-2xl flex gap-1 shadow-sm border border-slate-100">
               <button 
                 type="button"
                 (click)="orderType.set('CLIENT')"
                 [class]="cn('px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all', orderType() === 'CLIENT' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:bg-slate-50')"
               >Cliente</button>
               <button 
                 type="button"
                 (click)="orderType.set('STOCK')"
                 [class]="cn('px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all', orderType() === 'STOCK' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:bg-slate-50')"
               >Stock / Reposición</button>
            </div>
          </div>
          
          <!-- Selección de Cliente (Solo si es CLIENT) -->
          @if (orderType() === 'CLIENT') {
            <div class="space-y-3">
            <label class="text-[10px] font-bold text-[#64748b] tracking-[0.1em] ml-1 uppercase">Selección de Cliente</label>
            
            <div class="bg-white rounded-[2rem] p-1 flex items-center justify-between shadow-sm cursor-pointer border border-[#e2e8f0]/50 relative">
               <div class="w-full relative client-selector-override">
                 <app-client-selector
                   [value]="clienteId()"
                   (valueChange)="clienteId.set($event)"
                   (clientSelected)="onClientSelected($event)"
                   [error]="vErrors['clienteId']"
                   [disabled]="isSaving()"
                   placeholder="Seleccionar..."
                 ></app-client-selector>
               </div>
            </div>
          </div>
          }
          
          <div [class]="cn('grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-4')">
            <div class="space-y-3">
               <label class="text-[10px] font-bold text-[#64748b] tracking-[0.1em] ml-1 uppercase">Prioridad</label>
               <div (click)="cyclePriority()" class="bg-white rounded-[2rem] px-6 h-14 flex items-center justify-between shadow-sm border border-[#e2e8f0]/50 cursor-pointer select-none active:scale-95 transition-all">
                 <span class="text-sm font-black text-[#193357] uppercase tracking-tight">{{ priorityLabel() }}</span>
                 <div [class]="cn('w-2.5 h-2.5 rounded-full shadow-lg transition-all duration-500', priorityColorClass())"></div>
               </div>
            </div>
            
            <div class="space-y-3">
               <label class="text-[10px] font-bold text-[#64748b] tracking-[0.1em] ml-1 uppercase">Fecha de Entrega</label>
               <app-intelligent-date-picker
                 [value]="fechaEntrega()"
                 (valueChange)="fechaEntrega.set($event)"
                 [disabled]="isSaving()"
                 placeholder="Seleccionar fecha..."
               ></app-intelligent-date-picker>
            </div>
          </div>

          <div class="space-y-3">
            <label class="text-[10px] font-bold text-[#64748b] tracking-[0.1em] ml-1 uppercase">Responsable de Producción</label>
            <div class="bg-white rounded-full px-1 h-14 flex items-center shadow-sm border border-[#e2e8f0]/50 relative">
                <div class="w-full relative client-selector-override">
                  <app-employee-selector
                    [value]="responsableId()"
                    (valueChange)="responsableId.set($event)"
                    [disabled]="isSaving()"
                  ></app-employee-selector>
                </div>
            </div>
          </div>
        </div>
        
        <!-- Ítems del Pedido -->
        <div class="space-y-5">
          <div class="flex items-center justify-between px-2">
            <h2 class="text-xl font-black text-[#1e293b] tracking-tight">Ítems del Pedido</h2>
            <span class="px-4 py-1.5 rounded-full bg-[#f0eaff] text-[#6c3ce9] text-[11px] font-bold">{{ items().length }} ítems agregados</span>
          </div>
          
          <div class="space-y-4">
            @for (item of items(); track $index) {
              <div 
                (click)="openSidebar($index)" 
                class="bg-white rounded-[2rem] p-5 shadow-sm border border-[#e2e8f0]/40 flex items-center justify-between hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group animate-in zoom-in-95 duration-300"
              >
                 <div class="flex items-center gap-4">
                    <div class="h-14 w-14 rounded-2xl bg-[#f4f6fe] flex items-center justify-center text-primary group-hover:bg-purple-50 transition-colors">
                      <lucide-angular [img]="icons.Layers" class="h-6 w-6"></lucide-angular>
                    </div>
                    <div class="flex flex-col">
                      <h3 class="font-bold text-[#1e293b] leading-tight truncate max-w-[200px]">
                        {{ item.nombreProducto || 'Trabajo #' + ($index + 1) }}
                      </h3>
                      <div class="flex gap-2 mt-1">
                        <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                          {{ item.rubro === 'IMPRESION_3D' ? (item.peso_gramos || 0) + 'g' : 'Personalizado' }}
                        </span>
                        <span class="text-[9px] font-bold text-zinc-400 opacity-30">•</span>
                        <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                          {{ item.duracion_estimada_minutos ? (item.duracion_estimada_minutos + ' min') : 'Sin tiempo' }}
                        </span>
                      </div>
                    </div>
                 </div>
                  <div class="flex items-center gap-4">
                    <div class="flex flex-col items-end mr-4">
                      <span class="text-sm font-black text-primary">{{ getItemTotal(item) | currency }}</span>
                      <span class="text-[8px] font-black text-zinc-400 uppercase tracking-[0.1em]">Subtotal</span>
                    </div>

                    @if (items().length > 1) {
                      <button 
                        type="button" 
                        (click)="removeItem($index); $event.stopPropagation()" 
                        class="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-100 transition-all active:scale-95 shadow-sm shadow-rose-500/10"
                      >
                        <lucide-angular [img]="icons.Trash2" class="h-4.5 w-4.5"></lucide-angular>
                      </button>
                    }

                    <div class="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-300 group-hover:text-primary group-hover:bg-purple-50 transition-all">
                      <lucide-angular [img]="icons.ArrowRight" class="h-5 w-5 group-hover:translate-x-0.5 transition-transform"></lucide-angular>
                    </div>
                  </div>
              </div>
            }
            
            <button type="button" (click)="addItem()" class="w-full h-[4.5rem] rounded-[2rem] border-2 border-dashed border-[#d8b4fe]/60 flex items-center justify-center gap-3 text-[#7c3aed] font-bold bg-white/50 hover:bg-purple-50/50 transition-colors shadow-sm">
              <lucide-angular [img]="icons.PlusCircle" class="h-5 w-5"></lucide-angular>
              <span class="text-[15px]">Agregar Ítem al Pedido</span>
            </button>
          </div>
        </div>

        <!-- Observaciones -->
        <div class="space-y-3">
          <label class="text-[10px] font-bold text-[#64748b] tracking-[0.1em] ml-1 uppercase">Manifiesto / Notas del Pedido</label>
          <textarea 
            [ngModel]="observaciones()" 
            (ngModelChange)="observaciones.set($event)"
            name="observaciones"
            rows="3"
            placeholder="Detalles técnicos, logísticos o aclaraciones particulares..."
            class="w-full p-6 rounded-[2rem] border border-[#e2e8f0]/60 bg-white/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all resize-none shadow-sm placeholder:text-slate-400"
          ></textarea>
        </div>
        
        <!-- Tiempo y Material (Cards Inferiores) -->
        <div class="grid grid-cols-2 gap-4 pb-12">
          <div class="bg-[#eef2ff] rounded-[2rem] p-6 flex flex-col justify-between shadow-sm min-h-[140px]">
            <span class="text-[8px] font-bold text-[#4f46e5] uppercase tracking-widest leading-relaxed">Tiempo de entrega estimado</span>
            <div class="space-y-2 mt-auto">
              <span class="text-3xl font-black text-[#6c3ce9] tracking-tighter">{{ estimatedTimeLabel() }}</span>
              <div class="h-1.5 w-full bg-[#4f46e5]/10 rounded-full">
                <div class="h-full bg-[#6c3ce9] rounded-full" [style.width.%]="estimatedTimePercent()"></div>
              </div>
            </div>
          </div>
          
          <div class="bg-[#e0e7ff] rounded-[2rem] p-6 flex flex-col justify-between shadow-sm min-h-[140px]">
             <span class="text-[8px] font-bold text-[#3730a3]/80 uppercase tracking-widest leading-relaxed">Materiales</span>
             <span class="text-xl font-bold text-[#3730a3] leading-tight mt-auto tracking-tight truncate-multiline">{{ materialsLabel() }}</span>
          </div>
        </div>

      </div> <!-- End Main Container -->

      <!-- Centered Bottom Bar -->
      <div class="fixed bottom-0 sm:bottom-16 bg-white/95 backdrop-blur-2xl border-t border-slate-100 p-5 md:p-6 z-[50] shadow-[0_-10px_50px_rgba(0,0,0,0.03)]" 
           [style.left.px]="layoutService.sidebarWidth()"
           [style.width]="'calc(100% - ' + layoutService.sidebarWidth() + 'px)'">
        <div class="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
          
          <div class="flex flex-col items-center md:items-start">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">Presupuesto Estimado</span>
            <span class="text-3xl font-black text-[#193357] leading-none">{{ totales().total | currency:'':'symbol':'1.0-0' }}</span>
          </div>
          
          <div class="flex items-center gap-4 md:gap-8 lg:gap-10">
            <button type="button" (click)="saveAsDraft()" [disabled]="isSaving()" class="flex items-center gap-2 md:gap-3 text-slate-500 hover:text-primary transition-all group disabled:opacity-50">
               <lucide-angular [img]="icons.Save" class="h-5 w-5 md:h-6 md:w-6 group-hover:scale-110 transition-transform"></lucide-angular>
               <span class="text-[9px] md:text-[11px] font-black uppercase tracking-[0.15em] md:tracking-widest text-left leading-tight">Guardar<br/>Borrador</span>
            </button>
            
            <button type="submit" [disabled]="isSaving()" class="h-12 md:h-15 px-6 md:px-10 rounded-full bg-gradient-to-br from-[#742fe5] to-[#8342f4] text-white font-black text-[11px] md:text-[14px] uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-2xl shadow-[#742fe5]/30 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50 whitespace-nowrap">
               @if (isSaving()) {
                 <app-button-spinner></app-button-spinner>
               }
               <span>{{ id ? 'Actualizar' : 'Finalizar Pedido' }}</span>
               @if (!isSaving()) {
                 <lucide-angular [img]="icons.ArrowRight" class="h-4 w-4 md:h-5 md:w-5"></lucide-angular>
               }
            </button>
          </div>
        </div>
      </div>
    </form>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .client-selector-override div[class*="bg-zinc-50/50"] { background-color: transparent !important; }
    ::ng-deep .client-selector-override .border-zinc-200 { border-color: transparent !important; }
    ::ng-deep .client-selector-override .h-12 { height: 3.5rem !important; }
    
    .truncate-multiline {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class OrderFormComponent implements OnInit, OnDestroy {
  private api = inject(PedidosApiService);
  private filesApi = inject(FilesApiService);
  private clientesApi = inject(ClientesApiService);
  private session = inject(SessionService);
  public layoutService = inject(LayoutService);
  private router = inject(Router);
  private calculator = inject(OrderCalculatorService);

  readonly icons = { ArrowLeft, Plus, Save, Zap, Calendar, CheckCircle2, ChevronDown, RefreshCw, Calculator, ChevronUp, MoreVertical, X, PlusCircle, ArrowRight, Layers, PencilLine, Trash2 };

  ngOnInit() {
    this.layoutService.backAction.set(() => this.goBack());
    this.layoutService.headerTitle.set(this.forcedStatus === 'QUOTATION' ? 'NUEVO PRESUPUESTO' : 'NUEVO PEDIDO');
    this.layoutService.customBottomAction.set(null);
    this.layoutService.bottomNavHidden.set(true);
  }

  @Input() set forcedType(val: 'CLIENT' | 'STOCK' | undefined) {
    if (val) this.orderType.set(val);
  }

  @Input() forcedStatus?: string;
  @Input() cloneId?: string;
  @Input() id?: string; // Edit Mode
  @Input() returnUrl: string = '/pedidos';

  // State
  orderType = signal<'CLIENT' | 'STOCK'>('CLIENT');
  items = signal<any[]>([]);
  clienteId = signal('');
  selectedClientName = '';
  fechaEntrega = signal('');
  responsableId = signal('');
  observaciones = signal('');
  priority = signal(4); // 4: Normal, 3: Alta, 2: Urgente, 1: Crítica
  isSaving = signal(false);
  vErrors: any = {};

  // Side-Sheet State
  editingItemIndex = signal<number | null>(null);

  get rubro(): Rubro {
    return this.session.rubro() || 'OTRO';
  }

  showFloatingFooter = signal(false);
  isAtBottom = signal(false);
  actionsOpen = signal(false);
  isSaved = false;
  pendingFiles: string[] = [];
  private lastNegocioLoaded = '';
  private orderLoadedId = '';

  // Context
  config = computed(() => this.session.config());
  employees = signal<Employee[]>([]);
  clients = signal<any[]>([]);
  negocioId = computed(() => this.session.activeNegocio()?.id || '');

  totales = signal({
    subtotal: 0,
    diseno: 0,
    instalacion: 0,
    total: 0,
    totalSenias: 0,
    unidades: 0,
    saldoPendiente: 0
  });

  // Computed Functional Logic
  priorityLabel = computed(() => {
    const p = this.priority();
    if (p === 1) return 'Prioridad Crítica';
    if (p === 2) return 'Prioridad Urgente';
    if (p === 3) return 'Prioridad Alta';
    return 'Prioridad Normal';
  });

  priorityColorClass = computed(() => {
    const p = this.priority();
    if (p === 1) return 'bg-red-600 shadow-red-500/40';
    if (p === 2) return 'bg-orange-500 shadow-orange-500/40';
    if (p === 3) return 'bg-[#f43f5e] shadow-[0_0_8px_rgba(244,63,94,0.4)]';
    return 'bg-blue-500 shadow-blue-500/40';
  });

  materialsLabel = computed(() => {
    const materiasSet = new Set<string>();
    this.items().forEach(it => {
      const mat = it.tipo_filamento || it.material;
      if (mat) materiasSet.add(mat);
    });

    if (materiasSet.size === 0) return 'Sin material asignado';
    return Array.from(materiasSet).join(', ');
  });

  estimatedTimeLabel = computed(() => {
    // If delivery date is set, use that to calculate remaining days
    const fecha = this.fechaEntrega();
    if (fecha) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const delivery = new Date(fecha);
      delivery.setHours(0, 0, 0, 0);

      const diffTime = delivery.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Hoy';
      if (diffDays < 0) return 'Atrasado';
      if (diffDays === 1) return 'Mañana';
      return `${diffDays} Días`;
    }

    // Fallback to production time if no delivery date set
    const totalMin = this.items().reduce((acc, it) => acc + (Number(it.duracion_estimada_minutos) || 0), 0);
    if (totalMin <= 0) return 'Por definir';

    const hours = totalMin / 60;
    const days = Math.ceil(hours / 24);

    if (days === 1) return '1 Día';
    if (days > 1) return `${days} Días`;
    return `${Math.ceil(hours)} Horas`;
  });

  estimatedTimePercent = computed(() => {
    const totalMin = this.items().reduce((acc, it) => acc + (Number(it.duracion_estimada_minutos) || 0), 0);
    if (totalMin <= 0) return 0;
    return Math.min(100, (totalMin / 10000) * 100); // Normalize somehow for visual
  });

  cyclePriority() {
    this.priority.update(current => current === 1 ? 4 : current - 1);
  }

  onClientSelected(client: Client) {
    this.selectedClientName = client.name;
    // Auto-priority if client is VIP/Priority (example logic)
    if ((client as any).tags?.includes('VIP')) {
      this.priority.set(3);
    }
  }

  async saveAsDraft() {
    this.forcedStatus = 'DRAFT';
    await this.handleSave();
  }

  constructor() {
    effect(() => {
      const bid = this.negocioId();
      if (bid && bid !== this.lastNegocioLoaded) {
        this.lastNegocioLoaded = bid;
        this.loadEmployees();
      }

      if (this.id && this.id !== this.orderLoadedId) {
        this.orderLoadedId = this.id;
        this.loadOrderForEditing();
      }
    });
    // Si no es edición, añadir un item inicial
    if (!this.id) this.addItem(false);
  }

  async loadOrderForEditing() {
    if (!this.id) return;
    try {
      this.isSaving.set(true);
      const order = await this.api.findOne(this.id);

      this.orderType.set(order.type);
      this.clienteId.set(order.customerId || (order as any).clienteId);
      this.selectedClientName = order.clientName;
      this.fechaEntrega.set(order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '');
      this.responsableId.set(order.responsableGeneralId || (order as any).responsableId || (order as any).operatorId || order.responsableGeneral?.id || '');
      this.observaciones.set(order.notes || '');
      this.priority.set(order.priority || 4);

      // Phase 7: Integrity Sanitization
      const mappedItems = order.items.map(it => ({
        id: it.id,
        nombreProducto: it.name || it.nombreProducto,
        cantidad: it.qty || it.cantidad,
        precioUnitario: it.price || it.unitPrice || it.precioUnitario,
        senia: it.deposit || it.senia || 0,
        descripcion: it.description || it.descripcion,
        url_stl: it.stlUrl,
        peso_gramos: it.weightGrams,
        duracion_estimada_minutos: it.estimatedMinutes,
        referenceImages: it.referenceImages,
        metadata: it.metadata,
        ...(it.metadata?.['print3d'] || {})
      } as any));

      const sanitizedItems: any[] = [];
      const seenItems = new Set<string>();

      mappedItems.forEach(it => {
        const fingerPrint = `${it.nombreProducto}|${it.precioUnitario}|${it.cantidad}|${it.descripcion || ''}`;
        if (!seenItems.has(fingerPrint)) {
          seenItems.add(fingerPrint);
          sanitizedItems.push(it);
        }
      });

      this.items.set(sanitizedItems);
      this.recalcTotales();
    } catch (e) {
      console.error('Error loading order for editing', e);
    } finally {
      this.isSaving.set(false);
    }
  }

  ngOnDestroy() {
    this.layoutService.backAction.set(null);
    this.layoutService.headerTitle.set(null);
    this.layoutService.bottomNavHidden.set(false);
    this.cleanupFiles();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showFloatingFooter.set(window.scrollY > 300);

    // Check if near bottom to hide the quick-scroll arrow
    const threshold = 150;
    const scrollPos = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    this.isAtBottom.set((scrollPos + windowHeight) >= (docHeight - threshold));
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.pendingFiles.length > 0 && !this.isSaved) {
      event.preventDefault();
      event.returnValue = 'Tienes archivos subidos que no se guardarán. ¿Estás seguro de que quieres salir?';
    }
  }

  @HostListener('document:keydown.escape')
  onKeydownHandler() {
    if (this.editingItemIndex() !== null) {
      this.closeSidebar();
    }
  }

  trackPendingFile(data: any) {
    const path = typeof data === 'string' ? data : data.file?.path;
    if (path && !this.pendingFiles.includes(path)) {
      this.pendingFiles.push(path);
    }
  }

  untrackFile(data: any) {
    const path = typeof data === 'string' ? data : data.path;
    this.pendingFiles = this.pendingFiles.filter(p => p !== path);
  }

  async cleanupFiles() {
    if (this.isSaved || this.pendingFiles.length === 0) return;
    const filesToDelete = [...this.pendingFiles];
    this.pendingFiles = [];
    for (const path of filesToDelete) {
      try {
        await this.filesApi.deleteFile(path);
      } catch (e) { console.error('Cleanup error', path, e); }
    }
  }

  removeDuplicates() {
    const prev = this.items();
    const unique = new Map<string, any>();
    prev.forEach(it => {
      // Key based on content to identify duplicates
      const key = `${it.nombreProducto}|${it.precioUnitario}|${it.cantidad}|${it.descripcion || ''}`;
      if (!unique.has(key)) {
        unique.set(key, it);
      }
    });
    this.items.set(Array.from(unique.values()));
  }

  async loadEmployees() {
    if (!this.negocioId()) return;
    try {
      const [emps, cls] = await Promise.all([
        this.api.getEmployees(this.negocioId()),
        this.clientesApi.getListing(this.negocioId())
      ]);
      this.employees.set(emps);
      this.clients.set(cls);
      if (this.clienteId()) {
        const client = cls.find(c => c.id === this.clienteId());
        this.selectedClientName = client?.name || '';
      }
    } catch (e) { console.error('Error loading data', e); }
  }

  addItem(autoOpen = true) {
    const newItem = {
      id: Math.random().toString(36).substring(7),
      nombreProducto: '',
      cantidad: 1,
      precioUnitario: 0,
      rubro: this.rubro,
      _isNew: true
    };
    this.items.update(it => [...it, newItem]);

    // Auto-open sidebar only if requested (usually via manual click)
    if (autoOpen) {
      setTimeout(() => {
        this.openSidebar(this.items().length - 1);
      }, 0);
    }
  }

  async removeItem(index: number, skipConfirm = false) {
    const item = this.items()[index];
    if (!item) return;

    const hasData = (item.nombreProducto && item.nombreProducto.trim() !== '') ||
      (item.precioUnitario > 0) ||
      (item.referenceImages?.length > 0) ||
      (item.url_stl && item.url_stl.trim() !== '');

    if (!skipConfirm && hasData) {
      const confirmDelete = confirm('¿Deseas eliminar este ítem? Se perderán todos los datos técnicos cargados.');
      if (!confirmDelete) return;
    }

    this.items.update(it => it.filter((_, i) => i !== index));
    this.recalcTotales();
  }

  openSidebar(index: number) {
    this.editingItemIndex.set(index);
    // Lock background scroll (optional but recommended)
    document.body.style.overflow = 'hidden';
  }

  closeSidebar() {
    // Clear the _isNew flag from the item if it was just added
    const idx = this.editingItemIndex();
    if (idx !== null) {
      this.items.update(it => {
        const newArr = [...it];
        if (newArr[idx]) {
          const { _isNew, ...rest } = newArr[idx];
          newArr[idx] = rest as any;
        }
        return newArr;
      });
    }

    this.editingItemIndex.set(null);
    document.body.style.overflow = 'auto';
    this.recalcTotales();
  }

  getItemTotal(item: any): number {
    return this.calculator.calculateItem(item, this.rubro).total;
  }

  recalcTotales() {
    this.totales.set(this.calculator.calculateOrder(this.items(), this.rubro));
    // Clear the auto-edit flag after first interaction
    this.items().forEach(it => { if (it._isNew) it._isNew = false; });
  }

  scrollToBottom() {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }

  goBack() {
    this.router.navigate([this.returnUrl]);
  }

  async handleSave(e?: Event) {
    if (e) e.preventDefault();
    if (this.isSaving()) return;
    if (this.orderType() === 'CLIENT' && !this.clienteId()) {
      alert('Debe seleccionar un cliente');
      return;
    }
    this.isSaving.set(true);
    try {
      const payload: any = {
        type: this.orderType(),
        businessId: this.negocioId(),
        customerId: this.orderType() === 'CLIENT' ? this.clienteId() : undefined,
        clientName: this.orderType() === 'CLIENT' ? this.selectedClientName : 'STOCK',
        dueDate: this.fechaEntrega() ? new Date(this.fechaEntrega()).toISOString() : undefined,
        notes: this.observaciones(),
        priority: this.priority(),
        responsableGeneralId: this.responsableId() || undefined,
        items: this.items().map(it => {
          const isPending = this.rubro === 'IMPRESION_3D'
            ? (!it.peso_gramos || !it.duracion_estimada_minutos || (!it.url_stl && !it.stlFile))
            : (!it.duracion_estimada_minutos);

          return {
            id: it.id?.includes('-') ? it.id : undefined,
            name: it.nombreProducto || 'ITEM',
            qty: Math.max(1, Math.floor(Number(it.cantidad) || 1)),
            isPendingQuote: isPending,
            price: isPending ? null : (Number(it.precioUnitario) || 0),
            deposit: Math.max(0, Number(it.senia) || 0),
            weightGrams: isPending ? null : (Number(it.peso_gramos) || 0),
            estimatedMinutes: isPending ? null : (Math.floor(Number(it.duracion_estimada_minutos) || 0)),
            stlUrl: it.url_stl || '',
            referenceImages: it.referenceImages || [],
            metadata: {
              ...it.metadata,
              ...(this.rubro === 'IMPRESION_3D' ? {
                print3d: {
                  designsStl: it.seDiseñaSTL,
                  stlUrl: it.url_stl,
                  designPrice: it.precioDiseno,
                  stlFile: it.stlFile,
                  referenceImages: it.referenceImages,
                  tipo_filamento: it.tipo_filamento,
                  peso_gramos: it.peso_gramos,
                  duracion_estimada_minutos: it.duracion_estimada_minutos
                }
              } : {})
            }
          };
        }),
        status: this.forcedStatus || (this.id ? undefined : (this.rubro === 'METALURGICA' ? 'APPROVED' : 'PENDING')),
        totalPrice: this.items().some(it => {
          const isPending = this.rubro === 'IMPRESION_3D'
            ? (!it.peso_gramos || !it.duracion_estimada_minutos || (!it.url_stl && !it.stlFile))
            : (!it.duracion_estimada_minutos);
          return isPending;
        }) ? null : this.totales().total,
        totalSenias: this.totales().totalSenias
      };

      if (this.id) {
        // Keep businessId for role validation in guards
        delete payload.customerId;
        delete payload.priority;
        await this.api.update(this.id, payload);
      } else {
        await this.api.create(payload);
      }
      this.isSaved = true;
      this.router.navigate([this.returnUrl]);
    } catch (err) {
      console.error('Error saving order', err);
      alert('Error al guardar el pedido');
    } finally {
      this.isSaving.set(false);
    }
  }

  cn = cn;
}
