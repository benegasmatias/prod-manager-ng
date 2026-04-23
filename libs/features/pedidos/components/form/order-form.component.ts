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
import { ButtonSpinnerComponent } from '@shared/ui';

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
    FloatingCalculatorComponent,
    ButtonSpinnerComponent
  ],
  template: `
    <form (submit)="handleSave($event)" class="space-y-16 pb-40 relative max-w-6xl mx-auto animate-in fade-in duration-1000 px-4 sm:px-8">
      
      <!-- EDITORIAL CONTEXTUAL HEADER -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-10 pt-8 border-b border-border/5 pb-12">
        <div class="flex items-start gap-8">
          <button
            type="button"
            (click)="goBack()"
            class="h-14 w-14 rounded-2xl bg-surface-container-lowest border border-border/5 shadow-sm hover:bg-surface transition-all active:scale-95 flex items-center justify-center text-text-muted hover:text-text group"
          >
            <lucide-angular [img]="icons.ArrowLeft" class="h-6 w-6 transition-transform group-hover:-translate-x-1"></lucide-angular>
          </button>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div [class]="cn('h-2 w-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]', forcedStatus === 'QUOTATION' ? 'bg-blue-500 shadow-blue-500/50' : 'bg-primary shadow-primary/50')"></div>
              <span [class]="cn('text-[9px] font-black uppercase tracking-[0.4em]', forcedStatus === 'QUOTATION' ? 'text-blue-500' : 'text-primary')">
                {{ forcedStatus === 'QUOTATION' ? 'Propuesta Comercial' : 'Carga de Registro Operativo' }}
              </span>
            </div>
            <h1 class="text-4xl md:text-6xl font-black tracking-tighter text-text uppercase leading-none font-display">
              {{ forcedStatus === 'QUOTATION' ? 'Nuevo' : (orderType() === 'CLIENT' ? 'Nuevo' : 'Producción de') }} 
              <span [class]="cn('italic', forcedStatus === 'QUOTATION' ? 'text-blue-500' : 'text-primary')">
                {{ forcedStatus === 'QUOTATION' ? 'Presupuesto' : (orderType() === 'CLIENT' ? 'Pedido' : 'Stock') }}
              </span>
            </h1>
          </div>
        </div>
      </div>

      <!-- SYSTEM ARCHITECTURE LAYOUT -->
      <fieldset [disabled]="isSaving()" class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        <!-- MAIN COLUMN: FORM ARCHITECTURE -->
        <div class="lg:col-span-8 space-y-16">
          
          <!-- SECCIÓN 1: IDENTIDAD DE LA ORDEN -->
          <div class="rounded-[3rem] border border-border/5 bg-surface-container-low p-10 md:p-14 shadow-2xl shadow-text/5 transition-all duration-700 hover:shadow-text/10">
             <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted mb-12 flex items-center gap-4">
                <span class="w-8 h-px bg-border/10"></span>
                Identificación del Sistema
             </h2>
             
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
                @if (!forcedType) {
                  <div class="sm:col-span-2 space-y-4">
                    <label class="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/60 ml-2">Propósito de Carga</label>
                    <div class="grid grid-cols-2 gap-4 p-2 rounded-[2rem] bg-surface-container-lowest border border-border/5">
                      <button type="button" (click)="orderType.set('CLIENT')" [class]="cn('h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500', orderType() === 'CLIENT' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-muted/40 hover:text-text')">Externo (Cliente)</button>
                      <button type="button" (click)="orderType.set('STOCK')" [class]="cn('h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500', orderType() === 'STOCK' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-muted/40 hover:text-text')">Interno (Stock)</button>
                    </div>
                  </div>
                }

                @if (orderType() === 'CLIENT') {
                  <app-client-selector
                    label="Entidad Cliente"
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
                    placeholder="DD/MM/AAAA"
                  ></app-intelligent-date-picker>
                }

                <app-employee-selector
                  label="Arquitecto de Producción"
                  [value]="responsableId"
                  (valueChange)="responsableId = $event"
                  [disabled]="isSaving()"
                ></app-employee-selector>

                <div class="sm:col-span-2 space-y-4">
                  <label class="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/60 ml-2">Manifiesto / Observaciones</label>
                  <input [(ngModel)]="observaciones" name="notas" placeholder="DETALLES TÉCNICOS O LOGÍSTICOS..." 
                    class="w-full h-16 px-6 rounded-2xl border border-border/5 bg-surface-container-lowest text-sm font-black outline-none focus:border-primary/20 focus:ring-[12px] focus:ring-primary/5 transition-all placeholder:opacity-20 uppercase tracking-widest">
                </div>
             </div>
          </div>

          <!-- SECCIÓN 2: LÍNEAS DE CONFIGURACIÓN -->
          <div class="space-y-10">
            <div class="flex items-end justify-between px-4">
              <div class="space-y-2">
                <h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Componentes de Producción</h3>
                <p class="text-xs text-text-muted font-medium italic opacity-60">Configuración detallada de {{ items().length }} unidades.</p>
              </div>
              <div class="flex gap-4">
                @if (items().length > 5) {
                  <button type="button" (click)="removeDuplicates()" class="text-[9px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full border border-danger/10 text-danger hover:bg-danger/5 transition-all italic underline-offset-4 hover:underline">
                    Limpiar Duplicados
                  </button>
                }
                <button type="button" (click)="addItem()" 
                    class="h-14 px-8 rounded-2xl bg-text text-surface text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-text/10 group">
                  <lucide-angular [img]="icons.Plus" class="h-4 w-4 group-hover:rotate-90 transition-transform duration-700"></lucide-angular>
                  <span>Anexar Ítem</span>
                </button>
              </div>
            </div>

            <div class="space-y-12">
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

          </div>
        </div>

        <!-- SIDEBAR: MATRIZ DE VALORES (FLOTANTE STICKY) -->
        <div class="lg:col-span-4 h-full relative overflow-visible">
           <div class="sticky top-24 space-y-10">
              
              <!-- Luxury Summary Matrix -->
              <div class="p-12 rounded-[3.5rem] bg-surface-container-low border border-border/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden group">
                 <!-- Subtle Branding Accent -->
                 <div [class]="cn('absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 transition-opacity duration-1000 group-hover:opacity-20', forcedStatus === 'QUOTATION' ? 'bg-blue-500' : 'bg-primary')"></div>

                 <h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted mb-12 flex items-center gap-4">
                   <div [class]="cn('w-2 h-2 rounded-full', forcedStatus === 'QUOTATION' ? 'bg-blue-500' : 'bg-primary')"></div>
                   Arquitectura de Costos
                 </h3>
                 
                 <div class="space-y-10">
                     <div class="flex justify-between items-center group/row">
                        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/60 italic group-hover/row:text-text transition-colors">Volumen Config</span>
                        <span class="text-xl font-black text-text tabular-nums tracking-tighter">{{ items().length }} UN.</span>
                     </div>

                     <div class="flex justify-between items-center group/row">
                        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/60 italic group-hover/row:text-text transition-colors">Masa Crítica</span>
                        <span class="text-xl font-black text-text tabular-nums tracking-tighter">{{ totales().unidades }} PIEZAS</span>
                     </div>

                    <div class="h-px bg-border/5"></div>

                    <div class="space-y-3">
                       <span class="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted/40">Inversión Bruta</span>
                       <div class="flex items-baseline gap-1">
                          <span class="text-5xl font-black text-text tabular-nums tracking-tighter leading-none">
                            {{ totales().total | currency:'':'symbol':'1.0-0' }}
                          </span>
                       </div>
                    </div>

                    @if (orderType() !== 'STOCK') {
                      <div class="space-y-6 pt-4 animate-in fade-in duration-700">
                         <div class="flex items-center justify-between px-1">
                            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40">Adelantos Registrados</span>
                            <span class="text-xs font-black text-success tabular-nums">- {{ totales().totalSenias | currency:'':'symbol':'1.0-0' }}</span>
                         </div>
                         
                         <div class="p-8 rounded-[2rem] bg-surface-container-lowest border border-primary/5 space-y-2">
                            <span class="text-[9px] font-black uppercase tracking-[0.5em] text-primary">Saldo en Entrega</span>
                            <div class="text-4xl font-black text-primary tabular-nums tracking-tighter">{{ totales().saldoPendiente | currency:'':'symbol':'1.0-0' }}</div>
                         </div>
                      </div>
                    }

                    <div class="pt-8">
                      <app-button-spinner
                        [loading]="isSaving()"
                        (onClick)="handleSave($event)"
                        [btnClass]="cn(
                          'w-full h-20 rounded-[2rem] text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all flex items-center justify-center gap-4 group relative overflow-hidden active:scale-95',
                          forcedStatus === 'QUOTATION' ? 'bg-blue-600 shadow-blue-500/30' : 'bg-primary shadow-primary/30'
                        )"
                      >
                        <span class="relative z-10 whitespace-nowrap">{{ forcedStatus === 'QUOTATION' ? 'Emitir Cotización' : (id ? 'Sincronizar' : 'Finalizar Registro') }}</span>
                        <lucide-angular [img]="icons.CheckCircle2" class="h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all relative z-10 shrink-0"></lucide-angular>
                      </app-button-spinner>
                    </div>

                    <p class="text-[8px] font-black text-center text-text-muted/40 uppercase tracking-[0.3em] leading-relaxed pt-4 px-6">
                      {{ orderType() === 'STOCK' ? 'El registro impactará el inventario en tiempo real.' : 'Notificaciones automatizadas tras la firma digital.' }}
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </fieldset>

      <!-- EDITORIAL FLOATING DOCK -->
      @if (showFloatingFooter()) {
        <div class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 animate-in slide-in-from-bottom-20 duration-1000">
           <div class="h-20 pl-12 pr-6 rounded-full bg-surface/80 backdrop-blur-3xl border border-border/5 shadow-[0_40px_100px_rgba(0,0,0,0.15)] flex items-center gap-10">
              <div class="flex flex-col">
                 <span class="text-[8px] font-black uppercase tracking-[0.4em] text-text-muted/60 leading-none mb-2 italic">Valor Acumulado</span>
                 <span class="text-2xl font-black text-text leading-none tabular-nums tracking-tighter">{{ totales().total | currency:'':'symbol':'1.0-0' }}</span>
              </div>
              
              <div class="w-px h-10 bg-border/5"></div>
              
              <app-button-spinner
                [loading]="isSaving()"
                (onClick)="handleSave($event)"
                [btnClass]="'h-12 px-10 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3 shadow-2xl shadow-primary/20'"
              >
                <lucide-angular [img]="icons.Save" class="h-4 w-4"></lucide-angular>
                <span>{{ id ? 'Guardar' : 'Finalizar' }}</span>
              </app-button-spinner>
           </div>
   
           <app-floating-calculator></app-floating-calculator>
        </div>
      }
    </form>
  `,
  styles: [`
    :host { display: block; }
  `]
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
  showFloatingFooter = signal(false);
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
    this.cleanupFiles();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showFloatingFooter.set(window.scrollY > 400);
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
          id: it.id,
          name: it.nombreProducto || 'ITEM',
          qty: Math.max(1, Math.floor(Number(it.cantidad) || 1)),
          price: Math.max(0, Number(it.precioUnitario) || 0),
          deposit: Math.max(0, Number(it.senia) || 0),
          weightGrams: Math.max(0, Number(it.peso_gramos) || 0),
          estimatedMinutes: Math.max(0, Math.floor(Number(it.duracion_estimada_minutos) || 0)),
          stlUrl: it.url_stl || '',
          referenceImages: it.referenceImages || [],
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
        status: this.forcedStatus || (this.id ? undefined : (this.rubro() === 'METALURGICA' ? 'APPROVED' : 'PENDING')),
        totalPrice: this.totales().total,
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
