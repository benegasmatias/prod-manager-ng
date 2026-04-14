import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowUp, ArrowDown, ArrowUpDown, Eye, MessageCircle, TrendingUp, ExternalLink, MoreVertical, Package, User, Clock, Calendar, CheckCircle, Info, Trash2, Settings } from 'lucide-angular';
import { Pedido } from '../../models/pedido';
import { Rubro } from '../../models/negocio';
import { getStatusLabel, getStatusStyles } from '../../utils/negocio-utils';
import { UI_LABELS } from '../../config/ui-labels.config';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-4">
      <!-- TABLE VIEW (Desktop) -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full border-separate border-spacing-y-2">
          <thead>
            <tr class="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <th class="px-6 py-4 text-left cursor-pointer group" (click)="_onSort('code')">
                <div class="flex items-center gap-1">
                  {{ labels.TABLE.ORDER_NUMBER }}
                  <ng-container *ngTemplateOutlet="sortIcon; context: { field: 'code' }"></ng-container>
                </div>
              </th>
              <th *ngIf="!hideTypeColumn" class="px-6 py-4 text-left">{{ labels.TABLE.TYPE }}</th>
              <th class="px-6 py-4 text-left">{{ clientLabel || labels.TABLE.CLIENT }}</th>
              <th class="px-6 py-4 text-left">{{ labels.TABLE.STATUS }}</th>
              <th class="px-6 py-4 text-left">{{ labels.TABLE.RESPONSIBLE }}</th>
              
              <th *ngIf="!hideDelivery" class="px-6 py-4 text-left cursor-pointer group" (click)="_onSort('dueDate')">
                <div class="flex items-center gap-1">
                  {{ labels.TABLE.DELIVERY }}
                  <ng-container *ngTemplateOutlet="sortIcon; context: { field: 'dueDate' }"></ng-container>
                </div>
              </th>
              <th *ngIf="!hideFinancials" class="px-6 py-4 text-right">{{ labels.TABLE.PAID }}</th>
              <th *ngIf="!hideFinancials" class="px-6 py-4 text-right cursor-pointer group" (click)="_onSort('saldo')">
                <div class="flex items-center justify-end gap-1">
                  {{ labels.TABLE.BALANCE }}
                  <ng-container *ngTemplateOutlet="sortIcon; context: { field: 'saldo' }"></ng-container>
                </div>
              </th>
              <th class="px-6 py-4 text-right">{{ labels.TABLE.ACTIONS }}</th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders; track order.id) {
              <tr class="group bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-300">
                <td class="px-6 py-5 first:rounded-l-2xl border-y border-l border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700 transition-colors">
                  <span class="text-[10px] font-black tabular-nums text-zinc-400">#{{ order.code }}</span>
                </td>
                
                <td *ngIf="!hideTypeColumn" class="px-6 py-5 border-y border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
                   <div [class]="'inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ' + (order.type === 'STOCK' ? 'bg-purple-100 text-purple-600' : 'bg-zinc-100 text-zinc-500')">
                      {{ order.type === 'STOCK' ? labels.ORDER_TYPES.STOCK : labels.ORDER_TYPES.CLIENT }}
                   </div>
                </td>

                <td class="px-6 py-5 border-y border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[200px]">
                      {{ order.clientName || fallbackClientName || 'S/N' }}
                    </span>
                    <span class="text-[10px] text-zinc-400 line-clamp-1">
                      {{ order.items[0]?.nombreProducto || labels.TABLE.EMPTY_PRODUCTS }}
                      {{ order.items.length > 1 ? '(+' + (order.items.length - 1) + ' más)' : '' }}
                    </span>
                  </div>
                </td>

                <td class="px-6 py-5 border-y border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
                  <button 
                    (click)="_onStatusClick(order)"
                    [class]="'text-[10px] font-black uppercase tracking-tight rounded-lg px-2.5 py-1.5 border shadow-sm transition-all hover:scale-105 ' + getStatusStyles(order.status)"
                  >
                    {{ getStatusLabel(order.status) }}
                  </button>
                </td>

                <td class="px-6 py-5 border-y border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
                  @if (order.responsableGeneral) {
                    <div class="flex items-center gap-2">
                      <div class="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                        {{ order.responsableGeneral.firstName[0] }}{{ order.responsableGeneral.lastName ? order.responsableGeneral.lastName[0] : '' }}
                      </div>
                      <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {{ order.responsableGeneral.firstName }}
                      </span>
                    </div>
                  } @else {
                    <span class="text-[10px] font-bold text-zinc-400 uppercase italic">{{ labels.TABLE.UNASSIGNED }}</span>
                  }
                </td>

                <td *ngIf="!hideDelivery" class="px-6 py-5 border-y border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-zinc-900 dark:text-zinc-50 font-mono">
                      {{ order.dueDate | date:'dd MMM' }}
                    </span>
                    <span class="text-[9px] font-bold text-zinc-400 uppercase">
                      {{ order.dueDate | date:'yyyy' }}
                    </span>
                  </div>
                </td>

                <td *ngIf="!hideFinancials" class="px-6 py-5 text-right border-y border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
                  <span class="text-xs font-bold text-emerald-600 dark:text-emerald-500 tabular-nums">
                    {{ getTotalPaid(order) | currency:labels.CURRENCY.CODE:labels.CURRENCY.DISPLAY:labels.CURRENCY.DIGITS }}
                  </span>
                </td>
                <td *ngIf="!hideFinancials" class="px-6 py-5 text-right border-y border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
                  <span [class]="'text-sm font-black tracking-tighter tabular-nums ' + (getBalance(order) > 0 ? 'text-rose-500' : 'text-emerald-500')">
                    {{ getBalance(order) | currency:labels.CURRENCY.CODE:labels.CURRENCY.DISPLAY:labels.CURRENCY.DIGITS }}
                  </span>
                </td>

                <td class="px-6 py-5 last:rounded-r-2xl border-y border-r border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
                  <div class="flex items-center justify-end gap-1">
                    <button (click)="viewClick.emit(order)" class="h-8 w-8 flex items-center justify-center rounded-xl text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all active:scale-90">
                      <lucide-angular [img]="icons.Eye" class="h-4 w-4"></lucide-angular>
                    </button>
                    <div class="relative">
                      <button (click)="_onManageClick(order)" class="h-8 w-8 flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-90">
                        <lucide-angular [img]="icons.MoreVertical" class="h-4 w-4"></lucide-angular>
                      </button>

                      <!-- Dropdown Menu -->
                      @if (activeMenuOrderId() === order.id) {
                        <div class="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl z-[50] py-2 animate-in fade-in zoom-in duration-200">
                          <button (click)="openStatus(order)" class="w-full px-4 py-3 flex items-center gap-3 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-xs font-bold transition-colors">
                            <lucide-angular [img]="icons.Settings" class="h-4 w-4 opacity-50"></lucide-angular>
                            Gestionar Estados
                          </button>
                          <div class="h-px bg-zinc-100 dark:bg-zinc-800 mx-2 my-1"></div>
                          <button (click)="openDelete(order)" class="w-full px-4 py-3 flex items-center gap-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold transition-colors">
                            <lucide-angular [img]="icons.Trash2" class="h-4 w-4 opacity-70"></lucide-angular>
                            Eliminar Pedido
                          </button>
                        </div>
                        <!-- Backdrop to close -->
                        <div (click)="activeMenuOrderId.set(null)" class="fixed inset-0 z-[-1]"></div>
                      }
                    </div>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- CARD VIEW (Mobile) -->
      <div class="md:hidden space-y-2">
        @for (order of orders; track order.id) {
          <div class="bg-white dark:bg-zinc-900/40 rounded-2xl md:rounded-[2rem] border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm active:scale-[0.98] transition-all" (click)="viewClick.emit(order)">
            <div class="flex items-start justify-between gap-3 mb-2">
              <div class="flex flex-col gap-0.5 min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-[8px] font-black text-zinc-400 tabular-nums bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">#{{ order.code }}</span>
                  @if (!hideTypeColumn && order.type === 'STOCK') {
                    <span class="text-[7px] font-black text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full uppercase">Stock</span>
                  }
                </div>
                <h3 class="text-xs md:text-sm font-black text-zinc-900 dark:text-zinc-50 truncate">
                  {{ order.clientName || fallbackClientName || 'S/N' }}
                </h3>
                <p class="text-[9px] font-bold text-zinc-400 line-clamp-1 italic">
                  {{ order.items[0]?.nombreProducto || labels.TABLE.EMPTY_PRODUCTS }}
                  {{ order.items.length > 1 ? '(+' + (order.items.length - 1) + ' más)' : '' }}
                </p>
              </div>

              <lucide-angular [img]="icons.Eye" class="h-3.5 w-3.5 text-zinc-300"></lucide-angular>
            </div>

            <div class="flex flex-wrap items-center gap-2 py-2 border-y border-zinc-100/50 dark:border-zinc-800/50">
              <button 
                (click)="$event.stopPropagation(); _onStatusClick(order)"
                [class]="'text-[9px] font-black uppercase tracking-tight rounded-lg px-3 py-1.5 border shadow-sm transition-all ' + getStatusStyles(order.status)"
              >
                {{ getStatusLabel(order.status) }}
              </button>

              <div class="flex-1"></div>

              @if (order.responsableGeneral) {
                <div class="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/40 px-1.5 py-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-700/50">
                  <div class="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[7px] font-black text-primary uppercase">
                    {{ order.responsableGeneral.firstName[0] }}{{ order.responsableGeneral.lastName ? order.responsableGeneral.lastName[0] : '' }}
                  </div>
                  <span class="text-[9px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter truncate max-w-[60px]">
                    {{ order.responsableGeneral.firstName }}
                  </span>
                </div>
              }
            </div>

            <div class="flex items-center justify-between mt-2">
              <div class="flex flex-col">
                <span class="text-[7px] font-black text-zinc-400 uppercase tracking-widest">Entrega</span>
                <span class="text-[9px] font-black text-zinc-900 dark:text-zinc-50">
                  {{ order.dueDate | date:'dd MMM, yyyy' }}
                </span>
              </div>

              @if (!hideFinancials) {
                <div class="flex flex-col items-end">
                  <span class="text-[7px] font-black text-zinc-400 uppercase tracking-widest">Saldo</span>
                  <span [class]="'text-[10px] font-black tabular-nums ' + (getBalance(order) > 0 ? 'text-rose-500' : 'text-emerald-500')">
                    {{ getBalance(order) | currency:labels.CURRENCY.CODE:labels.CURRENCY.DISPLAY:labels.CURRENCY.DIGITS }}
                  </span>
                </div>
              }

              <button 
                (click)="$event.stopPropagation(); _onManageClick(order)" 
                class="h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <lucide-angular [img]="icons.MoreVertical" class="h-3.5 w-3.5"></lucide-angular>
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
}
