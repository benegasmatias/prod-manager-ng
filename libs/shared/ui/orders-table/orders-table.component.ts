import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowUp, ArrowDown, ArrowUpDown, Eye, MessageCircle, TrendingUp, ExternalLink, MoreVertical, Package, User, Clock, Calendar, CheckCircle, Info, Trash2, Settings, Plus, Search } from 'lucide-angular';
import { Pedido } from '../../models/pedido';
import { Rubro } from '../../models/negocio';
import { getStatusLabel, getStatusStyles } from '../../utils/negocio-utils';
import { UI_LABELS } from '../../config/ui-labels.config';
import { cn } from '../../utils/cn';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './orders-table.component.html',
  styleUrl: './orders-table.component.css'
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
  @Input() isCompact = false;
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
    ExternalLink, MoreVertical, Package, User, Clock, Calendar, CheckCircle, Info, Trash2, Settings, Plus, Search
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
