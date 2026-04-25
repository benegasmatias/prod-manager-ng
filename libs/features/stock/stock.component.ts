import { Component, inject, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Plus, Search, ChevronDown, Package2, TrendingUp, Wallet, Cpu, Layers } from 'lucide-angular';
import { StockService } from '../../core/api/stock.service';
import { SessionService } from '../../core/session/session.service';
import { Pedido } from '../../shared/models';
import { OrdersTableComponent } from '../../shared/ui';
import { PageShellComponent } from '../../shared/ui/layout/page-shell.component';
import { StockSaleDialogComponent } from '../../shared/ui/stock/stock-sale-dialog/stock-sale-dialog.component';
import { StockProductionModalComponent } from './components/stock-status-modal/stock-production-modal.component';
import { LayoutService } from '../../core/layout/layout.service';
import { OnDestroy } from '@angular/core';

@Component({
  selector: 'app-stock-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, LucideAngularModule, 
    OrdersTableComponent, StockSaleDialogComponent, StockProductionModalComponent,
    PageShellComponent
  ],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockPageComponent implements OnInit, OnDestroy {
  public stockService = inject(StockService);
  public session = inject(SessionService);
  private router = inject(Router);
  public layout = inject(LayoutService);


  icons = { Plus, Search, ChevronDown, Package2, TrendingUp, Wallet, Cpu, Layers };

  // Expose signals from service
  loading = this.stockService.loading;
  activeOrders = this.stockService.activeOrders;
  inStockOrders = this.stockService.inStockOrders;
  stockStats = this.stockService.stockStats;
  businessId = computed(() => this.session.activeNegocio()?.id);
  config = computed(() => this.session.config());

  // Local UI State
  searchTerm = signal('');
  estadoFilter = signal('all');
  sortKey = signal('fechaActualizacion');
  sortDir = signal<'asc' | 'desc'>('desc');

  // Modal State
  selectedOrder = signal<Pedido | null>(null);
  isSellModalOpen = signal(false);
  isSelling = signal(false);

  // Status Modal State
  selectedOrderForStatus = signal<Pedido | null>(null);
  isStatusModalOpen = signal(false);

  // Computeds for filtering and sorting
  filteredActive = computed(() => this.filterAndSort(this.activeOrders()));
  filteredInStock = computed(() => this.filterAndSort(this.inStockOrders()));

  private filterAndSort(orders: Pedido[]): Pedido[] {
    const term = this.searchTerm().toLowerCase();
    const estado = this.estadoFilter();

    let filtered = orders.filter(order => {
      const matchEstado = estado === 'all' || order.status === estado || order.status === estado;

      if (!term) return matchEstado;

      const num = String(order.code || '').toLowerCase();
      const fn = String(order.responsableGeneral?.firstName || '').toLowerCase();
      const ln = String(order.responsableGeneral?.lastName || '').toLowerCase();
      const products = order.items?.map(i => String(i.nombreProducto).toLowerCase()).join(' ') || '';

      return matchEstado && (num.includes(term) || fn.includes(term) || ln.includes(term) || products.includes(term));
    });

    return filtered.sort((a, b) => {
      let valA: any = (a as any)[this.sortKey()];
      let valB: any = (b as any)[this.sortKey()];

      if (this.sortKey() === 'fechaActualizacion' || this.sortKey() === 'updatedAt' || this.sortKey() === 'createdAt') {
        const dateA = valA ? new Date(valA).getTime() : 0;
        const dateB = valB ? new Date(valB).getTime() : 0;
        return this.sortDir() === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (this.sortKey() === 'code' || this.sortKey() === 'numero') {
        return this.sortDir() === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      }

      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return this.sortDir() === 'asc' ? numA - numB : numB - numA;
      }

      return 0;
    });
  }

  constructor() {
    effect(() => {
      if (this.businessId()) {
        this.stockService.loadStock();
      }
    });
  }

  ngOnInit() {
    this.layout.customBottomAction.set({
      label: 'Generar Reposición',
      icon: this.icons.Plus,
      action: () => this.router.navigate(['/stock/nuevo'])
    });
  }

  ngOnDestroy() {
    this.layout.customBottomAction.set(null);
  }


  handleSort(key: string) {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  openSellModal(order: Pedido) {
    this.selectedOrder.set(order);
    this.isSellModalOpen.set(true);
  }

  openStatusModal(order: Pedido) {
    this.selectedOrderForStatus.set(order);
    this.isStatusModalOpen.set(true);
  }

  goToDetail(order: Pedido) {
    this.router.navigate(['/pedidos', order.id]);
  }

  async handleStatusSaved() {
    await this.stockService.loadStock(true);
    const currentId = this.selectedOrderForStatus()?.id;
    if (currentId) {
      // Intentamos encontrar la versión actualizada de la orden abierta en el modal
      const updated = [...this.activeOrders(), ...this.inStockOrders()].find(o => o.id === currentId);
      if (updated) {
        this.selectedOrderForStatus.set(updated);
      }
    }
  }

  async handleSellConfirm(data: { price: number; clientName: string; date: string; notes: string }) {
    const order = this.selectedOrder();
    if (!order) return;

    this.isSelling.set(true);
    try {
      await this.stockService.sellStock(order.id, data);
      this.isSellModalOpen.set(false);
      this.selectedOrder.set(null);
    } catch (e) {
      console.error('Error al vender:', e);
      // Aqui podrías agregar un Toast
    } finally {
      this.isSelling.set(false);
    }
  }
}
