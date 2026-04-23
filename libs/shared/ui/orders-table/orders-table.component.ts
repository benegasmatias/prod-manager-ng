import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowUp, ArrowDown, ArrowUpDown, Eye, MessageCircle, TrendingUp, ExternalLink, MoreVertical, Package, User, Clock, Calendar, CheckCircle, Info, Trash2, Settings } from 'lucide-angular';
import { Pedido } from '../../models/pedido';
import { Rubro } from '../../models/negocio';
import { getStatusLabel, getStatusStyles } from '../../utils/negocio-utils';
import { UI_LABELS } from '../../config/ui-labels.config';
import { cn } from '../../utils/cn';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-10">
      <!-- TABLE ARCHITECTURE (Desktop) -->
      <div class="hidden lg:block overflow-x-auto pb-40">
        <table class="w-full border-separate border-spacing-y-4 px-4">
          <thead>
            <tr class="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted/30">
              <th class="px-8 py-4 text-left cursor-pointer group" (click)="_onSort('code')">
                <div class="flex items-center gap-3">
                  {{ labels.TABLE.ORDER_NUMBER }}
                  <ng-container *ngTemplateOutlet="sortIcon; context: { field: 'code' }"></ng-container>
                </div>
              </th>
              <th *ngIf="!hideTypeColumn" class="px-8 py-4 text-left">{{ labels.TABLE.TYPE }}</th>
              <th *ngIf="!hideClientColumn" class="px-8 py-4 text-left">{{ clientLabel || labels.TABLE.CLIENT }}</th>
              <th class="px-8 py-4 text-left">{{ labels.TABLE.STATUS }}</th>
              <th class="px-8 py-4 text-left">{{ labels.TABLE.RESPONSIBLE }}</th>
              
              <th *ngIf="!hideDelivery" class="px-8 py-4 text-left cursor-pointer group" (click)="_onSort('dueDate')">
                <div class="flex items-center gap-3">
                  {{ labels.TABLE.DELIVERY }}
                  <ng-container *ngTemplateOutlet="sortIcon; context: { field: 'dueDate' }"></ng-container>
                </div>
              </th>
              <th *ngIf="!hideFinancials" class="px-8 py-4 text-right">{{ labels.TABLE.PAID }}</th>
              <th *ngIf="!hideFinancials" class="px-8 py-4 text-right cursor-pointer group" (click)="_onSort('saldo')">
                <div class="flex items-center justify-end gap-3">
                  {{ labels.TABLE.BALANCE }}
                  <ng-container *ngTemplateOutlet="sortIcon; context: { field: 'saldo' }"></ng-container>
                </div>
              </th>
              <th class="px-8 py-4 text-right">{{ labels.TABLE.ACTIONS }}</th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders; track order.id) {
              <tr class="group bg-surface-container-low/40 hover:bg-surface-container-low transition-all duration-700 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-text/5">
                <td class="px-8 py-8 first:rounded-l-[2.5rem] border-y border-l border-border/5 group-hover:border-primary/10">
                  <div class="flex flex-col">
                    <span class="text-[9px] font-black tabular-nums text-primary mb-1 uppercase tracking-widest">REG #{{ order.code }}</span>
                    @if (hideClientColumn) {
                      <span class="text-sm font-black text-text truncate max-w-[200px] font-display uppercase tracking-tight">
                        {{ order.items[0]?.name || order.items[0]?.nombreProducto || labels.TABLE.EMPTY_PRODUCTS }}
                      </span>
                    }
                  </div>
                </td>
                
                <td *ngIf="!hideTypeColumn" class="px-8 py-8 border-y border-border/5 group-hover:border-primary/10">
                   <div [class]="cn('inline-flex items-center px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-sm', order.type === 'STOCK' ? 'bg-primary text-white shadow-primary/20' : 'bg-surface-container-lowest text-text-muted/60 border border-border/5')">
                      {{ order.type === 'STOCK' ? labels.ORDER_TYPES.STOCK : labels.ORDER_TYPES.CLIENT }}
                   </div>
                </td>
 
                 <td *ngIf="!hideClientColumn" class="px-8 py-8 border-y border-border/5 group-hover:border-primary/10">
                   <div class="flex flex-col min-w-0">
                     <span class="text-sm font-black text-text truncate max-w-[240px] font-display uppercase tracking-tight leading-tight">
                       {{ order.clientName || order.items[0]?.name || order.items[0]?.nombreProducto || fallbackClientName || 'S/N' }}
                     </span>
                     <span class="text-[9px] font-bold text-text-muted/40 line-clamp-1 uppercase tracking-widest mt-1 italic">
                       {{ order.clientName ? (order.items[0]?.name || order.items[0]?.nombreProducto || labels.TABLE.EMPTY_PRODUCTS) : (order.items.length > 1 ? '(+' + (order.items.length - 1) + ' productos adicionales)' : 'Referencia de Stock') }}
                       {{ order.clientName && order.items.length > 1 ? '(+' + (order.items.length - 1) + ' más)' : '' }}
                     </span>
                   </div>
                 </td>
   
                <td class="px-8 py-8 border-y border-border/5 group-hover:border-primary/10">
                  <button 
                    (click)="_onStatusClick(order)"
                    [class]="cn('text-[8px] font-black uppercase tracking-[0.2em] rounded-2xl px-6 py-2.5 border border-border/5 shadow-sm transition-all hover:scale-[1.05] active:scale-[0.95]', getStatusStyles(order.status))"
                  >
                    {{ getStatusLabel(order.status) }}
                  </button>
                </td>
 
                <td class="px-8 py-8 border-y border-border/5 group-hover:border-primary/10">
                  @if (order.responsableGeneral) {
                    <div class="flex items-center gap-4">
                      <div class="h-10 w-10 rounded-2xl bg-surface-container-lowest text-primary flex items-center justify-center text-[10px] font-black shadow-xl shadow-text/5 border border-border/5">
                        {{ order.responsableGeneral.firstName[0] }}{{ order.responsableGeneral.lastName ? order.responsableGeneral.lastName[0] : '' }}
                      </div>
                      <span class="text-[10px] font-black text-text-muted uppercase tracking-widest">
                        {{ order.responsableGeneral.firstName }}
                      </span>
                    </div>
                  } @else {
                    <span class="text-[9px] font-black text-text-muted/20 uppercase tracking-[0.4em] italic">Sin Asignar</span>
                  }
                </td>
 
                <td *ngIf="!hideDelivery" class="px-8 py-8 border-y border-border/5 group-hover:border-primary/10">
                  <div class="flex flex-col">
                    <span class="text-sm font-black text-text font-display uppercase tracking-tighter">
                      {{ order.dueDate | date:'dd MMM' }}
                    </span>
                    <span class="text-[9px] font-black text-text-muted/40 uppercase tracking-[0.3em]">
                      {{ order.dueDate | date:'yyyy' }}
                    </span>
                  </div>
                </td>
 
                <td *ngIf="!hideFinancials" class="px-8 py-8 text-right border-y border-border/5 group-hover:border-primary/10">
                  <span class="text-[11px] font-black text-success tabular-nums tracking-widest">
                    {{ getTotalPaid(order) | currency:'':'symbol':'1.0-0' }}
                  </span>
                </td>
                <td *ngIf="!hideFinancials" class="px-8 py-8 text-right border-y border-border/5 group-hover:border-primary/10">
                  <span [class]="cn('text-lg font-black tracking-tighter tabular-nums font-display', getBalance(order) > 0 ? 'text-text' : 'text-success')">
                    {{ getBalance(order) | currency:'':'symbol':'1.0-0' }}
                  </span>
                </td>
 
                <td class="px-8 py-8 last:rounded-r-[2.5rem] border-y border-r border-border/5 group-hover:border-primary/10">
                  <div class="flex items-center justify-end gap-3">
                    <button (click)="viewClick.emit(order)" class="h-12 w-12 flex items-center justify-center rounded-2xl bg-surface-container-lowest text-text-muted/40 hover:text-primary transition-all shadow-xl shadow-text/5 border border-border/5 hover:scale-110 active:scale-90">
                      <lucide-angular [img]="icons.Eye" class="h-5 w-5"></lucide-angular>
                    </button>
                    <div class="relative">
                      <button (click)="_onManageClick(order)" class="h-12 w-12 flex items-center justify-center rounded-2xl bg-surface-container-lowest text-text-muted/40 hover:text-text transition-all shadow-xl shadow-text/5 border border-border/5 hover:scale-110 active:scale-90">
                        <lucide-angular [img]="icons.MoreVertical" class="h-5 w-5"></lucide-angular>
                      </button>
 
                      <!-- Dropdown Menu Editorial -->
                      @if (activeMenuOrderId() === order.id) {
                        <div class="absolute right-0 top-full mt-6 w-64 bg-surface rounded-[2.5rem] border border-border/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] z-[100] py-4 animate-in fade-in zoom-in-95 duration-500 overflow-hidden backdrop-blur-3xl">
                          <button (click)="openStatus(order)" class="w-full px-8 py-5 flex items-center gap-5 text-text hover:bg-surface-container-low text-[10px] font-black uppercase tracking-[0.3em] transition-all group/opt">
                            <lucide-angular [img]="icons.Settings" class="h-4 w-4 opacity-20 group-hover/opt:opacity-100 group-hover/opt:rotate-90 transition-all"></lucide-angular>
                            <span>Gestionar</span>
                          </button>
                          <div class="h-px bg-border/5 mx-8 my-2"></div>
                          <button (click)="openDelete(order)" class="w-full px-8 py-5 flex items-center gap-5 text-danger hover:bg-danger/5 text-[10px] font-black uppercase tracking-[0.3em] transition-all group/opt">
                            <lucide-angular [img]="icons.Trash2" class="h-4 w-4 opacity-20 group-hover/opt:opacity-100 group-hover/opt:scale-110 transition-all"></lucide-angular>
                            <span>Eliminar</span>
                          </button>
                        </div>
                        <div (click)="activeMenuOrderId.set(null)" class="fixed inset-0 z-[90]"></div>
                      }
                    </div>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
 
      <!-- CARD ARCHITECTURE (Mobile) -->
      <div class="lg:hidden space-y-6 px-4">
        @for (order of orders; track order.id) {
          <div class="bg-surface-container-low rounded-[3rem] p-8 shadow-2xl shadow-text/5 border border-border/5 active:scale-[0.98] transition-all duration-500 relative overflow-hidden" (click)="viewClick.emit(order)">
            <!-- Decoration -->
            <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
 
            <div class="flex items-start justify-between gap-6 mb-8 relative z-10">
              <div class="flex flex-col gap-3 min-w-0">
                <div class="flex items-center gap-3">
                  <span class="text-[9px] font-black text-primary bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10 tabular-nums uppercase tracking-widest">ID {{ order.code }}</span>
                  @if (!hideTypeColumn && order.type === 'STOCK') {
                    <span class="text-[8px] font-black text-white bg-text px-3 py-1.5 rounded-full uppercase tracking-[0.2em]">Depósito</span>
                  }
                </div>
                <h3 class="text-xl font-black text-text font-display tracking-tight leading-tight uppercase">
                  {{ order.clientName || order.items[0]?.name || order.items[0]?.nombreProducto || fallbackClientName || 'S/N' }}
                </h3>
                <p class="text-[9px] font-bold text-text-muted/40 line-clamp-1 italic uppercase tracking-widest">
                  {{ order.clientName ? (order.items[0]?.name || order.items[0]?.nombreProducto || labels.TABLE.EMPTY_PRODUCTS) : (order.items.length > 1 ? '(+' + (order.items.length - 1) + ' productos)' : 'Referencia Interna') }}
                </p>
              </div>
 
              <div class="h-12 w-12 bg-surface-container-lowest rounded-2xl flex items-center justify-center text-text-muted/40 shadow-xl shadow-text/5 border border-border/5">
                <lucide-angular [img]="icons.Eye" class="h-5 w-5"></lucide-angular>
              </div>
            </div>
 
            <div class="flex flex-wrap items-center gap-4 py-6 border-y border-border/5 relative z-10">
              <button 
                (click)="$event.stopPropagation(); _onStatusClick(order)"
                [class]="cn('text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl px-5 py-2.5 border border-border/5 shadow-sm transition-all', getStatusStyles(order.status))"
              >
                {{ getStatusLabel(order.status) }}
              </button>
 
              <div class="flex-1"></div>
 
              @if (order.responsableGeneral) {
                <div class="flex items-center gap-3 bg-surface-container-lowest px-4 py-2 rounded-full border border-border/5 shadow-sm">
                  <div class="h-6 w-6 rounded-lg bg-primary text-white flex items-center justify-center text-[9px] font-black uppercase">
                    {{ order.responsableGeneral.firstName[0] }}
                  </div>
                  <span class="text-[10px] font-black text-text-muted uppercase tracking-widest">
                    {{ order.responsableGeneral.firstName }}
                  </span>
                </div>
              }
            </div>
 
            <div class="flex items-center justify-between mt-8 relative z-10">
              <div class="flex flex-col gap-1">
                <span class="text-[8px] font-black text-text-muted/40 uppercase tracking-[0.4em]">Compromiso</span>
                <span class="text-sm font-black text-text font-display uppercase tracking-tight">
                  {{ order.dueDate | date:'dd MMM, yyyy' }}
                </span>
              </div>
 
              @if (!hideFinancials) {
                <div class="flex flex-col items-end gap-1">
                  <span class="text-[8px] font-black text-text-muted/40 uppercase tracking-[0.4em]">Inversión</span>
                  <span [class]="cn('text-xl font-black tabular-nums tracking-tighter font-display', getBalance(order) > 0 ? 'text-text' : 'text-success')">
                    {{ getBalance(order) | currency:'':'symbol':'1.0-0' }}
                  </span>
                </div>
              }
 
              <button 
                (click)="$event.stopPropagation(); _onManageClick(order)" 
                class="h-12 w-12 flex items-center justify-center rounded-2xl bg-surface-container-lowest text-text-muted/40 hover:text-text transition-all border border-border/5 shadow-xl shadow-text/5"
              >
                <lucide-angular [img]="icons.MoreVertical" class="h-5 w-5"></lucide-angular>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
 
 
 
    <ng-template #sortIcon let-field="field">
      @if (sortKey !== field) {
        <lucide-angular [img]="icons.ArrowUpDown" class="h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity"></lucide-angular>
      } @else {
        <lucide-angular [img]="sortDir === 'asc' ? icons.ArrowUp : icons.ArrowDown" class="h-3 w-3 text-primary"></lucide-angular>
      }
    </ng-template>
 
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class OrdersTableComponent {
  @Input() orders: Pedido[] = [];
  @Input() sortKey = 'fechaActualizacion';
  @Input() sortDir: 'asc' | 'desc' = 'desc';
  @Input() hideTypeColumn = false;
  @Input() hideUrgency = false;
  @Input() hideDelivery = false;
  @Input() hideFinancials = false;
  @Input() hideClientColumn = false;
  @Input() clientLabel = 'Cliente / Referencia';
  @Input() fallbackClientName?: string;
  @Input() rubro?: Rubro;
 
  @Output() sortChange = new EventEmitter<string>();
  @Output() statusClick = new EventEmitter<Pedido>();
  @Output() viewClick = new EventEmitter<Pedido>();
  @Output() manageClick = new EventEmitter<Pedido>();
  @Output() deleteClick = new EventEmitter<Pedido>();
 
  protected readonly labels = UI_LABELS;
 
  icons = {
    ArrowUp, ArrowDown, ArrowUpDown, Eye, MessageCircle, TrendingUp,
    ExternalLink, MoreVertical, Package, User, Clock, Calendar, CheckCircle, Info, Trash2, Settings
  };
 
  activeMenuOrderId = signal<string | null>(null);
 
  _onSort(key: string) {
    this.sortChange.emit(key);
  }
 
  _onStatusClick(order: Pedido) {
    this.statusClick.emit(order);
  }
 
  _onManageClick(order: Pedido) {
    if (this.activeMenuOrderId() === order.id) {
      this.activeMenuOrderId.set(null);
    } else {
      this.activeMenuOrderId.set(order.id);
    }
  }
 
  openStatus(order: Pedido) {
    this.activeMenuOrderId.set(null);
    this.manageClick.emit(order);
  }
 
  openDelete(order: Pedido) {
    this.activeMenuOrderId.set(null);
    this.deleteClick.emit(order);
  }
 
  protected getStatusLabel(status: string): string {
    if (!status) return 'S/E';
    return getStatusLabel(status, this.rubro);
  }
 
  protected getStatusStyles(status: string): string {
    return getStatusStyles(status, this.rubro);
  }
 
  protected getTotalPaid(order: Pedido): number {
    const senia = Number(order.totalSenias || 0);
    const paymentsSummary = Number(order.totalPayments || 0);
    const paid = Number(order.paid || 0);
    
    // Sumar array de pagos si existe
    const paymentsArraySum = (order.payments || []).reduce((acc, p) => acc + Number(p.amount || 0), 0);
    
    return senia + paymentsSummary + paid + paymentsArraySum;
  }
 
  protected getBalance(order: Pedido): number {
    // Si la API ya trae saldo, lo usamos (parseado a número)
    if (order.saldo !== undefined) return Number(order.saldo);
    
    // Si no, calculamos: Total - Pagado
    const total = Number(order.totalPrice || order.total || 0);
    return Math.max(0, total - this.getTotalPaid(order));
  }
 
  cn = cn;
}
