import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PedidosApiService } from '../../core/api/pedidos.api.service';
import { AuthService } from '../../core/auth/auth.service';
import { SessionService } from '../../core/session/session.service';
import { Pedido, OrderStatus, PedidoSummary, Employee, ORDER_STATUS } from '../../shared/models';
import { LucideAngularModule } from 'lucide-angular';
import { OrderStatusModalComponent } from './status-modal/status-modal.component';
import { SkeletonComponent, SearchFilterBarComponent, OrdersTableComponent, PaginatorComponent, FilterOptions, FilterValues } from '../../shared/ui';
import { PedidoSortKey, PedidoSortDir } from '../../shared/models/pedido';
import { PEDIDOS_LABELS, PEDIDOS_ICONS } from './pedidos.config';
import { getStatusLabel, getStatusStyles } from '@shared/utils';

@Component({
  selector: 'app-pedidos-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, SkeletonComponent, FormsModule, OrderStatusModalComponent, SearchFilterBarComponent, OrdersTableComponent, PaginatorComponent],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosPageComponent implements OnInit {
  private api = inject(PedidosApiService);
  private session = inject(SessionService);
  private auth = inject(AuthService);

  // Labels and Icons for Template
  protected readonly labels = PEDIDOS_LABELS;
  protected readonly icons = PEDIDOS_ICONS;
  loading = signal(false);
  error = signal<string | null>(null);
  summary = signal<PedidoSummary>({ totalVolume: 0, pendingBalance: 0, activeCount: 0 });
  employees = signal<Employee[]>([]);

  // Context Signals
  businessId = computed(() => this.session.activeNegocio()?.id || '');
  negocio = computed(() => this.session.activeNegocio());

  // Filters State
  searchTerm = signal('');
  estadoFilter = signal('all');
  urgenciaFilter = signal('all');
  tecnicoFilter = signal('all');
  dateDesde = signal('');
  dateHasta = signal('');

  // UI State
  selectedOrder = signal<Pedido | null>(null);
  isModalOpen = signal(false);

  // Pagination State
  pageSize = 15;
  
  productionOrdersData = signal<Pedido[]>([]);
  productionPage = signal(1);
  productionTotal = signal(0);

  commercialOrdersData = signal<Pedido[]>([]);
  commercialPage = signal(1);
  commercialTotal = signal(0);

  archivedOrdersData = signal<Pedido[]>([]);
  archivedPage = signal(1);
  archivedTotal = signal(0);

  // Sort State
  sortKey = signal<PedidoSortKey>('fechaActualizacion');
  sortDir = signal<PedidoSortDir>('desc');

  // Filters computed for the bar
  currentFilterValues = computed<FilterValues>(() => ({
    search: this.searchTerm(),
    status: this.estadoFilter(),
    urgency: this.urgenciaFilter(),
    technician: this.tecnicoFilter(),
    startDate: this.dateDesde(),
    endDate: this.dateHasta()
  }));

  filterOptions = computed<FilterOptions>(() => {
    const config = this.session.config();
    return {
      statuses: config?.productionStages.map((s: any) => ({ label: s.label, value: s.key })),
      technicians: this.employees(),
      urgencies: [
        { label: 'VENCIDO', value: 'VENCIDO' },
        { label: 'PRÓXIMO', value: 'PRÓXIMO' },
        { label: 'EN TIEMPO', value: 'EN TIEMPO' },
        { label: 'LISTO', value: 'LISTO' }
      ]
    };
  });

  // Sorted Computeds for UI
  sortedProduction = computed(() => this.sortOrders([...this.productionOrdersData()]));
  sortedCommercial = computed(() => this.sortOrders([...this.commercialOrdersData()]));
  sortedArchived = computed(() => this.sortOrders([...this.archivedOrdersData()]));

  hasPedidos = computed(() => this.productionTotal() > 0 || this.commercialTotal() > 0 || this.archivedTotal() > 0);

  private lastLoadedBusinessId: string | null = null;

  constructor() {
    // Refresh when businessId changes
    effect(() => {
      const bid = this.businessId();
      if (bid && bid !== this.lastLoadedBusinessId) {
        this.loadData();
      }
    });
  }

  ngOnInit() { }

  onSort(key: string) {
    const sortKey = key as PedidoSortKey;
    if (this.sortKey() === sortKey) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(sortKey);
      this.sortDir.set('asc');
    }
    // No need to loadData as sorting is client-side for the current page
  }

  private sortOrders(orders: Pedido[]): Pedido[] {
    const key = this.sortKey();
    const dir = this.sortDir();

    return orders.sort((a, b) => {
      let valA: any = (a as any)[key];
      let valB: any = (b as any)[key];

      if (key === 'dueDate' || key === 'createdAt' || key === 'updatedAt' || key === 'fechaActualizacion' || key === 'fechaEntrega') {
        const dateA = valA ? new Date(valA).getTime() : 0;
        const dateB = valB ? new Date(valB).getTime() : 0;
        return dir === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (key === 'code') {
        return dir === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      }

      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
          return dir === 'asc' ? numA - numB : numB - numA;
      }

      const comparison = String(valA || '').localeCompare(String(valB || ''));
      return dir === 'asc' ? comparison : -comparison;
    });
  }

  onFilterChange({ key, value }: { key: string, value: any }) {
    switch (key) {
      case 'search': this.searchTerm.set(value); break;
      case 'status': this.estadoFilter.set(value); break;
      case 'urgency': this.urgenciaFilter.set(value); break;
      case 'technician': this.tecnicoFilter.set(value); break;
      case 'startDate': this.dateDesde.set(value); break;
      case 'endDate': this.dateHasta.set(value); break;
    }
    // Optimization: avoid reloading everything if only some local filters changed?
    // For now, reload all to ensure consistency
    this.loadData();
  }

  async loadData() {
    const bId = this.businessId();
    if (!bId) return;

    this.loading.set(true);
    this.error.set(null);

    const commonParams = {
      businessId: bId,
      search: this.searchTerm() || undefined,
      startDate: this.dateDesde() || undefined,
      endDate: this.dateHasta() || undefined,
      responsableId: this.tecnicoFilter() === 'all' ? undefined : this.tecnicoFilter(),
    };

    try {
      const EXCLUDED_PRODUCTION = 'IN_STOCK,DELIVERED,CANCELLED,SITE_VISIT,SITE_VISIT_DONE,VISITA_REPROGRAMADA,VISITA_CANCELADA,QUOTATION,BUDGET_GENERATED,BUDGET_REJECTED,SURVEY_DESIGN';
      const COMMERCIAL_STATUSES = 'SITE_VISIT,SITE_VISIT_DONE,VISITA_REPROGRAMADA,VISITA_CANCELADA,QUOTATION,BUDGET_GENERATED,BUDGET_REJECTED,SURVEY_DESIGN';
      const HISTORY_STATUSES = 'DELIVERED,CANCELLED';

      const [prodRes, commRes, histRes, summaryRes, empsRes] = await Promise.all([
        this.api.getListing({ ...commonParams, page: this.productionPage(), pageSize: this.pageSize, excludeStatuses: EXCLUDED_PRODUCTION }),
        this.api.getListing({ ...commonParams, page: this.commercialPage(), pageSize: this.pageSize, statuses: COMMERCIAL_STATUSES }),
        this.api.getListing({ ...commonParams, page: this.archivedPage(), pageSize: this.pageSize, statuses: HISTORY_STATUSES }),
        this.api.getSummary(bId),
        this.api.getEmployees(bId)
      ]);

      this.productionOrdersData.set(prodRes.data);
      this.productionTotal.set(prodRes.total || 0);

      this.commercialOrdersData.set(commRes.data);
      this.commercialTotal.set(commRes.total || 0);

      this.archivedOrdersData.set(histRes.data);
      this.archivedTotal.set(histRes.total || 0);

      this.summary.set(summaryRes);
      this.employees.set(empsRes);
      this.lastLoadedBusinessId = bId;
    } catch (err) {
      this.error.set('No se pudieron cargar los datos.');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  onProductionPageChange(page: number) {
    this.productionPage.set(page);
    this.loadData();
  }

  onCommercialPageChange(page: number) {
    this.commercialPage.set(page);
    this.loadData();
  }

  onArchivedPageChange(page: number) {
    this.archivedPage.set(page);
    this.loadData();
  }

  openManageModal(order: Pedido) {
    this.selectedOrder.set(order);
    this.isModalOpen.set(true);
  }

  handleSort(key: string) {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  clearFilters() {
    this.searchTerm.set('');
    this.estadoFilter.set('all');
    this.urgenciaFilter.set('all');
    this.tecnicoFilter.set('all');
    this.dateDesde.set('');
    this.dateHasta.set('');
  }

  getStatusStyles(status: OrderStatus): string {
    return getStatusStyles(status, this.negocio()?.rubro);
  }

  getStatusLabel(status: OrderStatus): string {
    return getStatusLabel(status, this.negocio()?.rubro);
  }
}
