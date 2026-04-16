import { Component, Input, Output, EventEmitter, inject, signal, computed, effect, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Plus, Save, Zap, Calendar, CheckCircle2, ChevronDown, RefreshCw } from 'lucide-angular';
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

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    RouterModule,
    ClientSelectorComponent,
    EmployeeSelectorComponent,
    IntelligentDatePickerComponent,
    ItemDetailsFormComponent,
    FloatingCalculatorComponent
  ],
  template: `
    <form (submit)="handleSave($event)" class="space-y-10 pb-20 relative max-w-6xl mx-auto animate-in fade-in duration-700 px-4 sm:px-6">
      
      <!-- HEADER CONTEXTUAL -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
        <div class="flex items-start gap-5">
          <button
            type="button"
            (click)="goBack()"
            class="h-12 w-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:bg-zinc-50 transition-all active:scale-95 flex items-center justify-center text-zinc-600 dark:text-zinc-400"
          >
            <lucide-angular [img]="icons.ArrowLeft" class="h-5 w-5"></lucide-angular>
          </button>
          <div class="space-y-1">
            <div class="flex items-center gap-2 mb-1">
              <div [class]="cn('h-1.5 w-1.5 rounded-full animate-pulse', forcedStatus === 'QUOTATION' ? 'bg-blue-500' : 'bg-primary')"></div>
              <span [class]="cn('text-[10px] font-black uppercase tracking-[0.2em]', forcedStatus === 'QUOTATION' ? 'text-blue-500' : 'text-primary')">
                {{ forcedStatus === 'QUOTATION' ? 'Propuesta Comercial' : 'Carga de Registro Operativo' }}
              </span>
            </div>
            <h1 class="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase leading-none">
              {{ forcedStatus === 'QUOTATION' ? 'Nuevo' : (orderType() === 'CLIENT' ? 'Nuevo' : 'Producción de') }} 
              <span [class]="cn('italic', forcedStatus === 'QUOTATION' ? 'text-blue-500' : 'text-primary')">
                {{ forcedStatus === 'QUOTATION' ? 'Presupuesto' : (orderType() === 'CLIENT' ? 'Pedido' : 'Stock') }}
              </span>
            </h1>
          </div>
        </div>
      </div>

      <!-- LAYOUT PRINCIPAL -->
      <fieldset [disabled]="isSaving()" class="grid grid-cols-1 lg:grid-cols-3 gap-8 contents">
        
        <!-- COLUMNA IZQUIERDA: FORMULARIO (Se extiende hacia abajo) -->
        <div class="lg:col-span-2 space-y-10">
          
          <!-- SECCIÓN 1: CABECERA Y CLIENTE -->
          <div class="rounded-[2.5rem] border border-zinc-100 bg-white dark:bg-zinc-950 p-8 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:shadow-zinc-200/20">
             <h2 class="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-8 flex items-center gap-2">
                Identificación de Orden
             </h2>
             
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                @if (!forcedType) {
                  <div class="sm:col-span-2 space-y-3">
                    <label class="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">Tipo de Operación</label>
                    <div class="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                      <button type="button" (click)="orderType.set('CLIENT')" [class]="cn('h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all', orderType() === 'CLIENT' ? 'bg-white dark:bg-zinc-800 shadow-sm text-primary' : 'text-zinc-400 hover:text-zinc-600')">Externo (Cliente)</button>
                      <button type="button" (click)="orderType.set('STOCK')" [class]="cn('h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all', orderType() === 'STOCK' ? 'bg-white dark:bg-zinc-800 shadow-sm text-primary' : 'text-zinc-400 hover:text-zinc-600')">Stock (Depósito)</button>
                    </div>
                  </div>
                }

                @if (orderType() === 'CLIENT') {
                  <app-client-selector
                    label="Target de Cliente"
                    [value]="clienteId"
                    (valueChange)="clienteId = $event"
                    (clientSelected)="selectedClientName = $event.name"
                    [error]="vErrors['clienteId']"
                    [disabled]="isSaving()"
                    class="sm:col-span-2"
                  ></app-client-selector>
                  
                  <app-intelligent-date-picker
                    label="Promesa de Entrega"
                    [(value)]="fechaEntrega"
                    [disabled]="isSaving()"
                    placeholder="dd/mm/aaaa"
                  ></app-intelligent-date-picker>
                }

                <app-employee-selector
                  label="Responsable Operativo"
                  [value]="responsableId"
                  (valueChange)="responsableId = $event"
                  [disabled]="isSaving()"
                ></app-employee-selector>

                <div class="sm:col-span-2 space-y-3">
                  <label class="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">Instrucciones Generales</label>
                  <input [(ngModel)]="observaciones" name="notas" placeholder="Ej: Fragilidad, detalles de embalaje, etc..." class="w-full h-12 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all">
                </div>
             </div>
          </div>

          <!-- SECCIÓN 2: ÍTEMS DE PRODUCCIÓN -->
          <div class="space-y-6">
            <div class="flex items-center justify-between px-6">
                <h2 class="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Canal de Configuración ({{ items().length }} ítems)</h2>
                <button type="button" [disabled]="isSaving()" (click)="addItem()" class="h-10 px-6 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                  <lucide-angular [img]="icons.Plus" class="h-4 w-4"></lucide-angular> Nuevo Ítem
                </button>
            </div>

            <div class="space-y-8">
              @for (item of items(); track $index) {
                <app-item-details-form
                  [index]="$index"
                  [item]="item"
                  [config]="config()"
                  [rubro]="rubro()"
                  [orderType]="orderType()"
                  [isSaving]="isSaving()"
                  [canRemove]="items().length > 1"
                  (onRemove)="removeItem($index)"
                  (onUpdate)="recalcTotales()"
                  (onFileUpload)="trackPendingFile($event)"
                  (onFileDelete)="untrackFile($event)"
                ></app-item-details-form>
              }
            </div>

            <!-- BOTÓN AÑADIDO ABAJO PARA FOMULARIOS LARGOS -->
            <div class="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 border-t border-zinc-100 dark:border-zinc-800/50">
               <div class="flex items-center gap-2">
                 <span class="text-[11px] font-black uppercase tracking-widest text-zinc-400">Total a Cobrar</span>
                 <span class="text-xl font-black text-zinc-900 dark:text-zinc-50">{{ totales().total | currency }}</span>
               </div>
               
               <button
                  type="submit"
                  [disabled]="isSaving()"
                  [class]="cn(
                    'h-16 px-10 rounded-[2rem] text-white font-black uppercase tracking-wider text-[11px] shadow-2xl transition-all flex items-center justify-center gap-2 group relative overflow-hidden active:scale-95 whitespace-nowrap',
                    forcedStatus === 'QUOTATION' ? 'bg-blue-600 shadow-blue-500/30 hover:bg-blue-700' : 'bg-zinc-950 shadow-zinc-950/20 hover:bg-black'
                  )"
                >
                  @if (isSaving()) {
                    <lucide-angular [img]="icons.RefreshCw" class="h-5 w-5 animate-spin"></lucide-angular>
                  } @else {
                    <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span class="relative z-10">{{ forcedStatus === 'QUOTATION' ? 'Emitir Cotización' : 'Confirmar Orden' }}</span>
                    <lucide-angular [img]="icons.CheckCircle2" class="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all relative z-10 shrink-0"></lucide-angular>
                  }
               </button>
            </div>
            
          </div>
        </div>

        <!-- COLUMNA DERECHA: RESUMEN (FLOTANTE STICKY) -->
        <div class="h-full relative">
           <div class="lg:sticky lg:top-10 space-y-8">
              
              <!-- Card Resumen Premium -->
              <div class="p-10 rounded-[3rem] bg-white border border-zinc-100 shadow-2xl shadow-zinc-200/40 border-t-4 border-t-primary animate-in slide-in-from-right-10 duration-700">
                 <h3 class="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-10 flex items-center gap-3">
                   <div class="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]"></div>
                   Resumen Operativo
                 </h3>
                 
                 <div class="space-y-8">
                    <div class="flex justify-between items-center px-2">
                       <span class="text-[11px] font-black uppercase tracking-widest text-zinc-400">Items Cargados</span>
                       <span class="text-xl font-black text-zinc-950 tabular-nums">{{ totales().unidades }}</span>
                    </div>

                    <div class="h-px bg-zinc-100 mx-2"></div>

                    <div class="flex flex-col gap-2 px-2">
                       <span class="text-[11px] font-black uppercase tracking-widest text-zinc-400">Total a Cobrar</span>
                       <span class="text-4xl font-black text-zinc-950 tabular-nums tracking-tighter leading-none">
                         {{ totales().total | currency }}
                       </span>
                    </div>

                    @if (orderType() !== 'STOCK') {
                      <div class="flex flex-col gap-2 px-2 pt-2 animate-in fade-in duration-500">
                         <div class="flex items-center justify-between">
                            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Adelantos</span>
                            <span class="text-sm font-black text-emerald-500">- {{ totales().totalSenias | currency }}</span>
                         </div>
                         <div class="h-[1px] bg-zinc-100 w-full opacity-50"></div>
                         <div class="flex flex-col gap-1 mt-1">
                            <span class="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Saldo en Entrega</span>
                            <span class="text-4xl font-black text-primary tabular-nums tracking-tighter">{{ totales().saldoPendiente | currency }}</span>
                         </div>
                      </div>
                    }

                    <div class="pt-6">
                      <button
                        type="submit"
                        [disabled]="isSaving()"
                        [class]="cn(
                          'w-full h-16 sm:h-20 rounded-3xl text-white font-black uppercase tracking-wider text-[11px] shadow-2xl transition-all flex items-center justify-center gap-2 group relative overflow-hidden active:scale-95 px-4',
                          forcedStatus === 'QUOTATION' ? 'bg-blue-600 shadow-blue-500/30 hover:bg-blue-700' : 'bg-zinc-950 shadow-zinc-950/20 hover:bg-black'
                        )"
                      >
                        @if (isSaving()) {
                          <lucide-angular [img]="icons.RefreshCw" class="h-6 w-6 animate-spin"></lucide-angular>
                        } @else {
                          <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span class="relative z-10 whitespace-nowrap">{{ forcedStatus === 'QUOTATION' ? 'Emitir Cotización' : 'Confirmar Orden' }}</span>
                          <lucide-angular [img]="icons.CheckCircle2" class="h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all relative z-10 shrink-0"></lucide-angular>
                        }
                      </button>
                    </div>

                    <p class="text-[9px] font-black text-center text-zinc-400 uppercase tracking-[0.15em] leading-relaxed pt-2 px-4">
                      {{ orderType() === 'STOCK' ? 'El registro impactará en el inventario actual.' : 'Se notificará al cliente y al taller tras confirmar.' }}
                    </p>
                 </div>
              </div>

           </div>
        </div>
      </fieldset>
    </form>
    
    <app-floating-calculator></app-floating-calculator>
  `
})
export class OrderFormComponent implements OnDestroy {
  private api = inject(PedidosApiService);
  private filesApi = inject(FilesApiService);
  private clientesApi = inject(ClientesApiService);
  private session = inject(SessionService);
  private router = inject(Router);
  private calculator = inject(OrderCalculatorService);

  readonly icons = { ArrowLeft, Plus, Save, Zap, Calendar, CheckCircle2, ChevronDown, RefreshCw };

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
  clienteId = '';
  selectedClientName = '';
  fechaEntrega = '';
  responsableId = '';
  observaciones = '';
  isSaving = signal(false);
  isSaved = false;
  pendingFiles: string[] = [];
  vErrors: Record<string, string> = {};
  private lastNegocioLoaded = '';
  private orderLoadedId = '';

  // Context
  config = computed(() => this.session.config());
  employees = signal<Employee[]>([]);
  clients = signal<any[]>([]);
  negocioId = computed(() => this.session.activeNegocio()?.id || '');
  rubro = computed(() => this.session.activeNegocio()?.rubro || 'GENERICO' as Rubro);

  totales = signal({
    subtotal: 0,
    diseno: 0,
    instalacion: 0,
    total: 0,
    totalSenias: 0,
    unidades: 0,
    saldoPendiente: 0
  });

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
    if (!this.id) this.addItem();
  }

  async loadOrderForEditing() {
    if (!this.id) return;
    try {
      this.isSaving.set(true);
      const order = await this.api.findOne(this.id);
      
      this.orderType.set(order.type);
      this.clienteId = order.customerId || (order as any).clienteId;
      this.selectedClientName = order.clientName;
      this.fechaEntrega = order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '';
      this.responsableId = order.responsableGeneralId || (order as any).responsableId || (order as any).operatorId || order.responsableGeneral?.id || '';
      this.observaciones = order.notes || '';
      
      // Map Items back to form names
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
        // Spread print3d metadata if exists
        ...(it.metadata?.['print3d'] || {})
      } as any));
      
      this.items.set(mappedItems);
      this.recalcTotales();
    } catch (e) {
      console.error('Error loading order for editing', e);
    } finally {
      this.isSaving.set(false);
    }
  }

  ngOnDestroy() {
    this.cleanupFiles();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.pendingFiles.length > 0 && !this.isSaved) {
      event.preventDefault();
      event.returnValue = 'Tienes archivos subidos que no se guardarán. ¿Estás seguro de que quieres salir?';
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

  async loadEmployees() {
    if (!this.negocioId()) return;
    try {
      const [emps, cls] = await Promise.all([
        this.api.getEmployees(this.negocioId()),
        this.clientesApi.getListing(this.negocioId())
      ]);
      this.employees.set(emps);
      this.clients.set(cls);
      if (this.clienteId) {
        const client = cls.find(c => c.id === this.clienteId);
        this.selectedClientName = client?.name || '';
      }
    } catch (e) { console.error('Error loading data', e); }
  }

  addItem() {
    this.items.update(prev => [{
      cantidad: 1,
      precioUnitario: 0,
      senia: 0,
      nombreProducto: '',
      seDiseñaSTL: false,
    }, ...prev]);
  }

  removeItem(index: number) {
    if (this.items().length > 1) {
      this.items.update(prev => prev.filter((_, i) => i !== index));
      this.recalcTotales();
    }
  }

  recalcTotales() {
    this.totales.set(this.calculator.calculateOrder(this.items(), this.rubro()));
  }

  goBack() {
    this.router.navigate([this.returnUrl]);
  }

  async handleSave(e: Event) {
    e.preventDefault();
    if (this.isSaving()) return;
    if (this.orderType() === 'CLIENT' && !this.clienteId) {
      alert('Debe seleccionar un cliente');
      return;
    }
    this.isSaving.set(true);
    try {
      const payload: any = {
        type: this.orderType(),
        businessId: this.negocioId(),
        customerId: this.orderType() === 'CLIENT' ? this.clienteId : undefined,
        clientName: this.orderType() === 'CLIENT' ? this.selectedClientName : 'STOCK',
        dueDate: this.fechaEntrega ? new Date(this.fechaEntrega).toISOString() : undefined,
        notes: this.observaciones,
        priority: 4,
        responsableGeneralId: this.responsableId || undefined,
        items: this.items().map(it => ({
          name: it.nombreProducto || 'ITEM',
          qty: Math.max(1, Math.floor(Number(it.cantidad) || 1)),
          price: Number(it.precioUnitario) || 0,
          deposit: Number(it.senia) || 0,
          weightGrams: Number(it.peso_gramos) || 0,
          estimatedMinutes: Math.floor(Number(it.duracion_estimada_minutos) || 0),
          stlUrl: it.url_stl || '',
          metadata: {
            ...it.metadata,
            ...(this.rubro() === 'IMPRESION_3D' ? {
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
        })),
        status: this.forcedStatus || (this.rubro() === 'METALURGICA' ? 'APPROVED' : 'PENDING'),
        totalPrice: this.totales().total,
        totalSenias: this.totales().totalSenias
      };
      
      if (this.id) {
        delete payload.businessId;
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
