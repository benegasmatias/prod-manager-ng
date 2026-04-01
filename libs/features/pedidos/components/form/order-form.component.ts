import { Component, Input, Output, EventEmitter, inject, signal, computed, effect, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Plus, Save, Zap, Calendar, CheckCircle2, ChevronDown, RefreshCw } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';
import { SessionService } from '@core/session/session.service';
import { PedidosApiService } from '@core/api/pedidos.api.service';
import { ClientesApiService } from '@core/api/clientes.api.service';
import { Employee, Pedido, OrderStatus, Rubro } from '@shared/models';
import { ClientSelectorComponent } from '@shared/ui/clientes/client-selector.component';
import { AppDatePickerComponent } from '@shared/ui/app-date-picker/app-date-picker.component';
import { ItemDetailsFormComponent } from './items-section/item-details-form.component';
import { FilesApiService } from '@core/api/files.api.service';
import { cn } from '@shared/utils/cn';
import { OrderCalculatorService } from '../../services/order-calculator.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterModule, ClientSelectorComponent, AppDatePickerComponent, ItemDetailsFormComponent],
  template: `
    <form (submit)="handleSave($event)" class="space-y-10 pb-24 lg:pb-12 relative max-w-5xl mx-auto animate-in fade-in duration-700">
      
      <!-- Sticky Header for Mobile and Premium Feel -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
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
            <h1 class="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
              {{ forcedStatus === 'QUOTATION' ? 'Nuevo' : (orderType() === 'CUSTOMER' ? 'Nuevo' : 'Producción de') }} 
              <span [class]="cn('italic', forcedStatus === 'QUOTATION' ? 'text-blue-500' : 'text-primary')">
                {{ forcedStatus === 'QUOTATION' ? 'Presupuesto' : (orderType() === 'CUSTOMER' ? 'Pedido' : 'Stock') }}
              </span>
            </h1>
            <p class="text-[11px] font-bold text-zinc-400 leading-relaxed uppercase tracking-widest">
              {{ forcedStatus === 'QUOTATION' ? 'Genere una propuesta económica detallada para su cliente.' : 'Registre los detalles del flujo de fabricación.' }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Form Area -->
        <div class="lg:col-span-2 space-y-12">
          
          <!-- SECCIÓN CLIENTE Y CABECERA -->
          <div class="rounded-[2.5rem] border border-zinc-100 bg-white dark:bg-zinc-950 p-8 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl">
             <h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-8 flex items-center gap-2">
                <div [class]="cn('h-1.5 w-1.5 rounded-full', forcedStatus === 'QUOTATION' ? 'bg-blue-500' : 'bg-primary')"></div>
                Encabezamiento General
             </h2>
             
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                @if (!forcedType) {
                  <div class="sm:col-span-2 space-y-3">
                    <label class="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">Tipo de Operación</label>
                    <div class="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                      <button type="button" (click)="orderType.set('CUSTOMER')" [class]="cn('h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all', orderType() === 'CUSTOMER' ? 'bg-white dark:bg-zinc-800 shadow-sm text-primary' : 'text-zinc-400 hover:text-zinc-600')">Externo (Cliente)</button>
                      <button type="button" (click)="orderType.set('STOCK')" [class]="cn('h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all', orderType() === 'STOCK' ? 'bg-white dark:bg-zinc-800 shadow-sm text-primary' : 'text-zinc-400 hover:text-zinc-600')">Stock (Depósito)</button>
                    </div>
                  </div>
                }

                @if (orderType() === 'CUSTOMER') {
                  <app-client-selector
                    label="Target de Cliente"
                    [value]="clienteId"
                    (valueChange)="onClientChange($event)"
                    [error]="vErrors['clienteId']"
                    class="sm:col-span-2"
                  ></app-client-selector>
                  <app-date-picker
                    label="Promesa de Entrega"
                    [(value)]="fechaEntrega"
                    name="fechaEntrega"
                  ></app-date-picker>
                }

                <div class="space-y-3">
                   <label class="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">Responsable Operativo</label>
                   <select [(ngModel)]="responsableId" name="responsable" class="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-sm font-black outline-none focus:border-primary">
                    <option value="">Sin Asignar</option>
                    @for (emp of employees(); track emp.id) {
                      <option [value]="emp.id">{{ emp.firstName }} {{ emp.lastName }}</option>
                    }
                   </select>
                </div>

                <div class="sm:col-span-2 space-y-3">
                  <label class="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">Notas Internas</label>
                  <input [(ngModel)]="observaciones" name="notas" placeholder="Instrucciones adicionales para el taller..." class="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-sm font-black outline-none focus:border-primary">
                </div>
             </div>
          </div>

          <!-- DETALLE DE PRODUCCION (ITEMS) -->
          <div class="space-y-8">
            <div class="flex items-center justify-between px-6">
                <h2 class="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Canal de Fabricación ({{ items().length }} ítems)</h2>
                <button type="button" (click)="addItem()" class="h-10 px-6 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
                  <lucide-angular [img]="icons.Plus" class="h-4 w-4"></lucide-angular> Añadir Ítem
                </button>
            </div>

            @for (item of items(); track $index) {
               <app-item-details-form
                 [index]="$index"
                 [item]="item"
                 [config]="config()"
                 [rubro]="rubro()"
                 [orderType]="orderType()"
                 [canRemove]="items().length > 1"
                 (onRemove)="removeItem($index)"
                 (onUpdate)="recalcTotales()"
                 (onFileUpload)="trackPendingFile($event)"
                 (onFileDelete)="untrackFile($event)"
               ></app-item-details-form>
            }
          </div>
        </div>

        <!-- Sidebar Actions & Summary -->
        <div class="space-y-8">
           <div class="sticky top-24 space-y-8">
              <!-- Summary Card (Premium White Style) -->
              <div class="p-10 rounded-[3rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/40">
                 <h3 class="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-8 flex items-center gap-2">
                   <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                   Cierre de Orden
                 </h3>
                 
                 <div class="space-y-6">
                    <!-- Basic Info -->
                    <div class="flex justify-between items-center group/unidades">
                       <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-colors group-hover/unidades:text-zinc-600">Total Unidades</span>
                       <span class="text-lg font-black text-zinc-950 tabular-nums">{{ totales().unidades }}</span>
                    </div>

                    <div class="flex justify-between items-center group/prod">
                       <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-colors group-hover/prod:text-zinc-600">Subtotal Producción</span>
                       <span class="text-sm font-black text-zinc-600 tabular-nums">{{ totales().subtotal + totales().diseno + totales().instalacion | currency }}</span>
                    </div>

                    <div class="h-[1px] bg-zinc-100 my-4"></div>

                    <!-- Main Price -->
                    <div class="flex justify-between items-center">
                       <span class="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-950">
                         {{ orderType() === 'STOCK' ? 'Valor Est. Inventario' : 'Total Pedido' }}
                       </span>
                       <span class="text-2xl font-black text-zinc-950 tabular-nums">{{ totales().total | currency }}</span>
                    </div>

                    @if (orderType() !== 'STOCK') {
                      <!-- Advance / Deposit -->
                      <div class="flex justify-between items-center animate-in slide-in-from-right duration-500">
                         <span class="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">T. Adelantos</span>
                         <span class="text-lg font-black text-emerald-500 tabular-nums">- {{ totales().totalSenias | currency }}</span>
                      </div>

                      <div class="h-[1px] bg-zinc-100 my-4"></div>

                      <!-- Final Balance -->
                      <div class="flex flex-col gap-1">
                         <span class="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Saldo Pendiente</span>
                         <div class="flex items-baseline gap-2">
                            <span class="text-5xl font-black text-zinc-950 tabular-nums tracking-tighter">{{ totales().saldoPendiente | currency }}</span>
                         </div>
                      </div>
                    }

                    <div class="pt-4">
                      <button
                        type="submit"
                        [disabled]="isSaving()"
                        class="w-full h-18 rounded-[2rem] bg-zinc-950 dark:bg-zinc-800 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-zinc-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group"
                      >
                        @if (isSaving()) {
                          <lucide-angular [img]="icons.RefreshCw" class="h-5 w-5 animate-spin"></lucide-angular>
                        } @else {
                          <div class="w-2 h-2 rounded-full border-2 border-white/40 group-hover:bg-primary transition-colors"></div>
                          {{ forcedStatus === 'QUOTATION' ? 'Enviar Propuesta' : 'Guardar Pedido' }}
                          <lucide-angular [img]="icons.CheckCircle2" class="h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity"></lucide-angular>
                        }
                      </button>
                    </div>
                    
                    <p class="text-[8px] font-black text-center text-zinc-400 uppercase tracking-widest leading-relaxed pt-2">
                      Al confirmar, se notificará al área de producción para dar inicio al flujo operativo
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </form>
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

  @Input() set forcedType(val: 'CUSTOMER' | 'STOCK' | undefined) {
    if (val) {
      this.orderType.set(val);
    }
  }

  @Input() forcedStatus?: string;
  @Input() cloneId?: string;
  @Input() returnUrl: string = '/pedidos';

  // Signal State
  orderType = signal<'CUSTOMER' | 'STOCK'>('CUSTOMER');
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
      if (this.negocioId()) {
        this.loadEmployees();
      }
    });

    // Default item
    this.addItem();
  }

  ngOnDestroy() {
    this.cleanupFiles();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.pendingFiles.length > 0 && !this.isSaved) {
      event.preventDefault();
      // Most browsers require assigning to returnValue for standard alert
      event.returnValue = 'Tienes archivos subidos que no se guardarán. ¿Estás seguro de que quieres salir?';
    }
  }

  trackPendingFile(path: string) {
    if (!this.pendingFiles.includes(path)) {
      this.pendingFiles.push(path);
    }
  }

  untrackFile(path: string) {
    this.pendingFiles = this.pendingFiles.filter(p => p !== path);
  }

  async cleanupFiles() {
    if (this.isSaved || this.pendingFiles.length === 0) return;

    // We can't use await if we're in the middle of a teardown (sometimes) 
    // but for client-side navigation it's fine.
    // For reload, it's impossible to delete from Supabase async while the page closes.
    const filesToDelete = [...this.pendingFiles];
    this.pendingFiles = [];

    for (const path of filesToDelete) {
      try {
        await this.filesApi.deleteFile(path);
      } catch (e) {
        console.error('Cleanup: Error deleting orphan file', path, e);
      }
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
        this.updateClientName(this.clienteId);
      }
    } catch (e) { console.error('Error loading data', e); }
  }

  addItem() {
    const newItem = {
      cantidad: 1,
      precioUnitario: 0,
      senia: 0,
      nombreProducto: '',
      seDiseñaSTL: false,
    };
    this.items.update(prev => [...prev, newItem]);
  }

  removeItem(index: number) {
    if (this.items().length > 1) {
      this.items.update(prev => prev.filter((_, i) => i !== index));
      this.recalcTotales();
    }
  }

  recalcTotales() {
    const summary = this.calculator.calculateOrder(this.items(), this.rubro());
    this.totales.set(summary);
  }

  onClientChange(id: string) {
    this.clienteId = id;
    this.updateClientName(id);
  }

  updateClientName(id: string) {
    const client = this.clients().find(c => c.id === id);
    this.selectedClientName = client?.name || '';
  }

  goBack() {
    this.router.navigate([this.returnUrl]);
  }

  async handleSave(e: Event) {
    e.preventDefault();
    if (this.isSaving()) return;

    // Basic Validation
    if (this.orderType() === 'CUSTOMER' && !this.clienteId) {
      alert('Debe seleccionar un cliente');
      return;
    }

    this.isSaving.set(true);
    try {
      const payload: any = {
        type: this.orderType(),
        businessId: this.negocioId(),
        customerId: this.orderType() === 'CUSTOMER' ? this.clienteId : undefined,
        clientName: this.orderType() === 'CUSTOMER' ? this.selectedClientName : 'STOCK',
        dueDate: this.fechaEntrega ? new Date(this.fechaEntrega).toISOString() : undefined,
        notes: this.observaciones, // Re-map 'observaciones' to 'notes' for DTO
        priority: 4, // Default priority
        responsableGeneralId: this.responsableId || undefined,
        items: this.items().map(it => {
          // Flatten/convert to backend's expected structure
          const mapped: any = {
            name: it.nombreProducto || 'ITEM',
            qty: Math.max(1, Math.floor(Number(it.cantidad) || 1)),
            price: Number(it.precioUnitario) || 0,
            deposit: Number(it.senia) || 0,
            weightGrams: Number(it.peso_gramos) || 0,
            estimatedMinutes: Math.floor(Number(it.duracion_estimada_minutos) || 0),
            stlUrl: it.url_stl || '',
            // Map known fields from DTO if present
            medidas: it.medidas,
            material: it.material,
            tipo_trabajo: it.tipo_trabajo,
            material_estructura: it.material_estructura,
            fillMaterial: it.fillMaterial,
            revestimiento: it.revestimiento,
            terminacion: it.terminacion,
            color: it.color,
            accessories: it.accessories,
            instalacion: it.instalacion,
            direccion_obra: it.direccion_obra,
            fecha_visita: it.fecha_visita,
            hora_visita: it.hora_visita,
            observaciones_visita: it.observaciones_visita,
            description: it.description,
            // Move rubric-specific fields to metadata
            metadata: {
              ...it.metadata,
              ...(this.rubro() === 'IMPRESION_3D' ? {
                print3d: {
                  designsStl: it.seDiseñaSTL,
                  stlUrl: it.url_stl,
                  designPrice: it.precioDiseno,
                  stlFile: it.stlFile,
                  tipo_filamento: it.tipo_filamento,
                  peso_gramos: it.peso_gramos,
                  duracion_estimada_minutos: it.duracion_estimada_minutos
                }
              } : {})
            }
          };

          return mapped;
        }),
        status: this.forcedStatus || (this.rubro() === 'METALURGICA' ? 'APPROVED' : 'PENDING'),
        totalPrice: this.totales().total,
        totalSenias: this.totales().totalSenias
      };

      console.log('[OrderForm] Payload Mapping:', payload);
      await this.api.create(payload);
      this.isSaved = true;
      this.pendingFiles = []; // All good
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
