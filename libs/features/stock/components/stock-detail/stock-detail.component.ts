import { Component, Input, Output, EventEmitter, inject, signal, computed, input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Pedido, Employee } from '@shared/models';
import { LucideAngularModule, ArrowLeft, Package, User, Calendar, Clock, DollarSign, CheckCircle, Info, Tag, MessageSquare, ChevronRight, Edit3, AlertCircle, TrendingUp, Zap, Layers, Box, BarChart3, ChevronLeft } from 'lucide-angular';
import { getStatusLabel, getStatusStyles } from '@shared/utils';
import { SessionService } from '@core/session/session.service';
import { OrderTimelineComponent } from '../../../pedidos/detalles/components/order-timeline.component';
import { OrderItemsWidgetComponent } from '../../../pedidos/detalles/components/order-items-widget.component';
import { StockProductionModalComponent } from '../stock-status-modal/stock-production-modal.component';
import { StockProgressFlowComponent } from './components/stock-progress-flow.component';

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    OrderTimelineComponent, 
    OrderItemsWidgetComponent, 
    StockProgressFlowComponent,
    StockProductionModalComponent
  ],
  template: `
    <div class="space-y-8 animate-in fade-in duration-500 pb-20">
      
      <!-- Premium Header: Production Identity -->
      <div class="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 text-white p-8 lg:p-12 shadow-2xl">
        <div class="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none"></div>
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/30">Activo de Inventario</span>
              <span class="text-zinc-500 font-mono text-xs italic opacity-70">Lote Ref: #{{ pedido()?.code }}</span>
            </div>
            
            <h1 class="text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
              {{ pedido()?.items?.[0]?.nombreProducto || 'Referencia de Producción' }}
              <span class="text-primary italic opacity-50 underline decoration-indigo-500/30">.stock</span>
            </h1>
            <div class="flex flex-wrap items-center gap-6 text-zinc-400">
              <div class="flex items-center gap-2">
                <lucide-angular [img]="icons.Layers" class="h-4 w-4 text-primary"></lucide-angular>
                <span class="text-sm font-bold">Cantidad: {{ totalUnits() }} u.</span>
              </div>
              <div class="flex items-center gap-2">
                <lucide-angular [img]="icons.Calendar" class="h-4 w-4"></lucide-angular>
                <span class="text-sm font-bold">Creado: {{ pedido()?.fechaCreacion | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="flex items-center gap-2" *ngIf="tiempoTranscurrido()">
                <lucide-angular [img]="icons.Clock" class="h-4 w-4"></lucide-angular>
                <span class="text-sm font-bold">Tiempo: {{ tiempoTranscurrido() }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-start lg:items-end gap-3" *ngIf="pedido()">
            <div class="flex items-center gap-2">
              <button (click)="handleEdit()" class="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all shadow-xl backdrop-blur-md border border-white/10" title="Editar Lote">
                <lucide-angular [img]="icons.Edit3" class="h-5 w-5"></lucide-angular>
              </button>
              <div [class]="'flex items-center gap-2 px-5 py-2.5 rounded-2xl border backdrop-blur-md shadow-lg ' + getStatusStyles(pedido()!.status)">
                <div class="h-2 w-2 rounded-full bg-current animate-pulse"></div>
                <span class="text-xs font-black uppercase tracking-widest">{{ getStatusLabel(pedido()!.status, session.activeNegocio()?.rubro, 'STOCK') }}</span>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button *ngIf="canSell()" (click)="handleSell()" class="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs hover:scale-105 transition-all active:scale-95 shadow-xl shadow-emerald-500/20">
                <lucide-angular [img]="icons.DollarSign" class="h-4 w-4"></lucide-angular>
                VENDER STOCK
              </button>
              <button (click)="isStatusModalOpen.set(true)" class="flex items-center gap-2 px-6 py-3 bg-white text-zinc-900 rounded-2xl font-black text-xs hover:scale-105 transition-all active:scale-95 shadow-xl border-2 border-primary/5 hover:border-primary/20">
                <lucide-angular [img]="icons.Zap" class="h-4 w-4 text-primary"></lucide-angular>
                CONTROL DE FABRICACIÓN
              </button>
            </div>
          </div>
        </div>
      </div>


      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8" *ngIf="pedido()">
        
        <!-- Left Column: Operations -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Technical Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <!-- Inventory Valuation -->
             <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm group hover:border-primary/30 transition-all">
                <div class="flex items-center gap-3 mb-4">
                  <div class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <lucide-angular [img]="icons.TrendingUp" class="h-5 w-5"></lucide-angular>
                  </div>
                  <h3 class="text-xs font-black uppercase tracking-widest text-zinc-400">Valor Estimado</h3>
                </div>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-black text-zinc-900 dark:text-zinc-50">{{ (pedido()!.totalPrice || 0) | currency }}</span>
                  <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Venta Tot.</span>
                </div>
             </div>

             <!-- Production Cost -->
             <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm group hover:border-amber-500/30 transition-all">
                <div class="flex items-center gap-3 mb-4">
                  <div class="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <lucide-angular [img]="icons.BarChart3" class="h-5 w-5"></lucide-angular>
                  </div>
                  <h3 class="text-xs font-black uppercase tracking-widest text-zinc-400">Costo Estimado</h3>
                </div>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-black text-zinc-900 dark:text-zinc-50">{{ (pedido()!.costoEstimado || 0) | currency }}</span>
                  <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Insumos + MO</span>
                </div>
             </div>
          </div>

          <!-- Items Widget -->
          <app-order-items-widget [items]="pedido()!.items"></app-order-items-widget>

          <!-- Files Widget -->

        </div>

        <!-- Right Column: Context -->
        <div class="space-y-8">
          
          <!-- Active Operator Card -->
          <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm">
            <h3 class="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
               <lucide-angular [img]="icons.User" class="h-3 w-3"></lucide-angular>
               Operador Responsable
            </h3>
            
            <div *ngIf="pedido()?.responsableGeneral" class="flex items-center gap-4">
              <div class="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-sm font-black uppercase">
                {{ pedido()?.responsableGeneral?.firstName?.[0] }}{{ pedido()?.responsableGeneral?.lastName?.[0] || '' }}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {{ pedido()?.responsableGeneral?.firstName }} {{ pedido()?.responsableGeneral?.lastName }}
                </span>
                <span class="text-[10px] font-bold text-zinc-400 uppercase">Técnico Especialista</span>
              </div>
            </div>

            <div *ngIf="!pedido()!.responsableGeneral" class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-dashed border-zinc-200 dark:border-zinc-700 text-center">
              <p class="text-[10px] font-bold text-zinc-400 uppercase italic">Sin operador asignado</p>
            </div>
          </div>

          <!-- Dedicated Stock Progress Flow -->
          <app-stock-progress-flow [status]="pedido()!.status" [ageValue]="tiempoTranscurrido()"></app-stock-progress-flow>

          <!-- Timeline Widget -->
          <app-order-timeline [history]="pedido()!.statusHistory || []"></app-order-timeline>

          <!-- Observations Card -->
          <div class="bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
               <lucide-angular [img]="icons.MessageSquare" class="h-3 w-3"></lucide-angular>
               Notas Internas
            </h3>
            <p class="text-sm font-medium text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed italic">
              {{ pedido()!.notes || 'No hay notas internas registradas en este lote de stock.' }}
            </p>
          </div>

        </div>

      </div>
    </div>

    <!-- Stock Specific Control Modal -->
    <app-stock-production-modal 
      *ngIf="pedido()"
      [isOpen]="isStatusModalOpen()" 
      [order]="pedido()!"
      (onClose)="isStatusModalOpen.set(false)"
      (onSaved)="onSaved.emit()">
    </app-stock-production-modal>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class StockDetailComponent {
  pedido = input.required<Pedido | null>();
  @Output() onSaved = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  
  public session = inject(SessionService);
  
  isStatusModalOpen = signal(false);

  icons = {
    ArrowLeft, Package, User, Calendar, Clock, DollarSign, 
    CheckCircle, Info, Tag, MessageSquare, ChevronRight, 
    Edit3, AlertCircle, TrendingUp, Zap, Layers, Box, BarChart3, ChevronLeft
  };

  totalUnits = computed(() => {
    const p = this.pedido();
    if (!p) return 0;
    if (p.totalUnits) return p.totalUnits;
    return p.items?.reduce((acc, item) => acc + (item.qty || 0), 0) || 0;
  });

  canSell = computed(() => {
    const s = this.pedido()?.status;
    return s === 'DONE' || s === 'IN_STOCK' || s === 'READY';
  });

  tiempoTranscurrido = computed(() => {
    const p = this.pedido();
    if (!p || !p.fechaCreacion) return null;
    const start = new Date(p.fechaCreacion).getTime();
    const end = (p.status === 'DONE' && p.fechaActualizacion) ? new Date(p.fechaActualizacion).getTime() : Date.now();
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  });

  getStatusLabel = getStatusLabel;
  getStatusStyles = getStatusStyles;

  handleEdit() {
    this.onEdit.emit();
  }

  handleSell() {
    // Por ahora, si se marca como vendido, el flujo ideal es moverlo a DELIVERED
    // o abrir un modal de venta. Para cumplir con el requerimiento inmediato,
    // permitiremos al usuario saber que esta es la puerta de entrada a la venta.
    this.onSaved.emit();
  }

  downloadFile(url?: string) {
    if (url) window.open(url, '_blank');
  }
}
