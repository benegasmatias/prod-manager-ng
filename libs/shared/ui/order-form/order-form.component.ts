import { Component, Input, Output, EventEmitter, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Plus, Save, Zap, Calendar, CheckCircle2, ChevronDown } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';
import { SessionService } from '@core/session/session.service';
import { PedidosApiService } from '@core/api/pedidos.api.service';
import { Employee, Pedido, OrderStatus, Rubro } from '@shared/models';
import { ClientSelectorComponent } from '@shared/ui/clientes/client-selector.component';
import { ItemDetailsFormComponent } from './items-section/item-details-form.component';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterModule, ClientSelectorComponent, ItemDetailsFormComponent],
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
            <lucide-icon name="arrow-left" size="20"></lucide-icon>
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
                    [(value)]="clienteId"
                    [error]="vErrors['clienteId']"
                    class="sm:col-span-2"
                  ></app-client-selector>

                  <div class="space-y-3">
                    <label class="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">Promesa de Entrega</label>
                    <input type="date" [(ngModel)]="fechaEntrega" name="fechaEntrega" class="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-sm font-black focus:border-primary transition-all outline-none">
                  </div>
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
                  <lucide-icon name="plus" size="14"></lucide-icon> Añadir Ítem
                </button>
            </div>

            @for (item of items(); track $index) {
               <app-item-details-form
                 [index]="$index"
                 [item]="item"
                 [config]="config()"
                 [rubro]="rubro()"
                 [canRemove]="items().length > 1"
                 (onRemove)="removeItem($index)"
                 (onUpdate)="recalcTotales()"
               ></app-item-details-form>
            }
          </div>
        </div>

        <!-- Sidebar Actions & Summary -->
        <div class="space-y-8">
           <div class="sticky top-24 space-y-8">
              <!-- Summary Card -->
              <div [class]="cn('p-8 rounded-[2.5rem] shadow-2xl transition-all', forcedStatus === 'QUOTATION' ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-zinc-950 dark:bg-zinc-900 text-white shadow-black/20')">
                 <h3 class="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6">Finanzas de la Orden</h3>
                 
                 <div class="space-y-6">
                    <div class="flex justify-between items-baseline">
                       <span class="text-[11px] font-black uppercase tracking-widest opacity-50">Subtotal Neto</span>
                       <span class="text-xl font-black tabular-nums transition-all">{{ totales().subtotal | currency }}</span>
                    </div>

                    @if (totales().diseno > 0) {
                      <div class="flex justify-between items-baseline">
                         <span class="text-[11px] font-black uppercase tracking-widest opacity-50">Costos de Ingeniería</span>
                         <span class="text-sm font-bold tabular-nums">+ {{ totales().diseno | currency }}</span>
                      </div>
                    }

                    <div class="h-[1px] bg-white/10 my-4"></div>

                    <div class="flex flex-col gap-1">
                       <span class="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Total Final</span>
                       <div class="flex items-baseline gap-2">
                          <span class="text-4xl font-black tabular-nums tracking-tighter">{{ totales().total | currency }}</span>
                       </div>
                    </div>

                    <button
                      type="submit"
                      [disabled]="isSaving()"
                      [class]="cn('w-full h-16 rounded-[2rem] bg-white text-zinc-950 font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group px-4', forcedStatus === 'QUOTATION' ? 'text-indigo-600' : 'text-zinc-950')"
                    >
                      @if (isSaving()) {
                        <lucide-icon name="loader-2" size="20" class="animate-spin"></lucide-icon>
                      } @else {
                        <lucide-icon name="save" size="20" class="group-hover:translate-x-1 transition-transform"></lucide-icon>
                        {{ forcedStatus === 'QUOTATION' ? 'Enviar Propuesta' : 'Sincronizar Pedido' }}
                      }
                    </button>
                    
                    <p class="text-[9px] font-bold text-center opacity-40 uppercase tracking-widest px-4 italic">
                      Al confirmar, se notificará al área de producción para dar inicio al flujo operativo.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </form>
  `
})
export class OrderFormComponent {
  private api = inject(PedidosApiService);
  private session = inject(SessionService);
  private router = inject(Router);

  @Input() forcedType?: 'CUSTOMER' | 'STOCK';
  @Input() forcedStatus?: string;
  @Input() cloneId?: string;

  // Signal State
  orderType = signal<'CUSTOMER' | 'STOCK'>('CUSTOMER');
  items = signal<any[]>([]);
  clienteId = '';
  fechaEntrega = '';
  responsableId = '';
  observaciones = '';
  isSaving = signal(false);
  vErrors: Record<string, string> = {};

  // Context
  config = computed(() => this.session.config());
  employees = signal<Employee[]>([]);
  negocioId = computed(() => this.session.activeNegocio()?.id || '');
  rubro = computed(() => this.session.activeNegocio()?.rubro || 'GENERICO' as Rubro);

  totales = signal({
    subtotal: 0,
    diseno: 0,
    instalacion: 0,
    total: 0
  });

  constructor() {
    effect(() => {
      if (this.negocioId()) {
        this.loadEmployees();
      }
    });

    if (this.forcedType) {
      this.orderType.set(this.forcedType);
    }
    
    // Default item
    this.addItem();
  }

  async loadEmployees() {
    if (!this.negocioId()) return;
    try {
      this.employees.set(await this.api.getEmployees(this.negocioId()));
    } catch (e) { console.error('Error loading employees', e); }
  }

  addItem() {
    const newItem = {
      cantidad: 1,
      precioUnitario: 0,
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
    const current = this.items().reduce((acc, item) => {
      const sub = (item.cantidad || 0) * (item.precioUnitario || 0);
      const dis = item.seDiseñaSTL ? (Number(item.precioDiseno) || 0) : 0;
      const inst = item.instalacion ? (Number(item.costo_instalacion) || 0) : 0;
      
      return {
        subtotal: acc.subtotal + sub,
        diseno: acc.diseno + dis,
        instalacion: acc.instalacion + inst,
        total: acc.total + sub + dis + inst
      };
    }, { subtotal: 0, diseno: 0, instalacion: 0, total: 0 });

    this.totales.set(current);
  }

  goBack() {
    this.router.navigate(['/pedidos']);
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
        dueDate: this.fechaEntrega ? new Date(this.fechaEntrega).toISOString() : undefined,
        observaciones: this.observaciones,
        responsableGeneralId: this.responsableId,
        items: this.items().map(it => ({
          ...it,
          status: this.forcedStatus || (this.rubro() === 'METALURGICA' ? 'APPROVED' : 'PENDING')
        })),
        status: this.forcedStatus || (this.rubro() === 'METALURGICA' ? 'APPROVED' : 'PENDING'),
        total: this.totales().total
      };

      await this.api.create(payload);
      this.router.navigate(['/pedidos']);
    } catch (err) {
      console.error('Error saving order', err);
      alert('Error al guardar el pedido');
    } finally {
      this.isSaving.set(false);
    }
  }

  cn = cn;
}
