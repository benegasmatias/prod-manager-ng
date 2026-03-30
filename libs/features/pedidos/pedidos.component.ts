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
import { SkeletonComponent, SearchFilterBarComponent, OrdersTableComponent, FilterOptions, FilterValues } from '../../shared/ui';
import { PedidoSortKey, PedidoSortDir } from '../../shared/models/pedido';
import { PEDIDOS_LABELS, PEDIDOS_ICONS } from './pedidos.config';
import { getStatusLabel, getStatusStyles } from '@shared/utils';

@Component({
  selector: 'app-pedidos-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, SkeletonComponent, FormsModule, OrderStatusModalComponent, SearchFilterBarComponent, OrdersTableComponent],
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

  // Signals
  allPedidos = signal<Pedido[]>([]);
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

  // Computed Data
  filteredOrders = computed(() => {
    const orders = this.allPedidos();
    const search = this.searchTerm().toLowerCase();
    const estado = this.estadoFilter();
    const urgencia = this.urgenciaFilter();
    const tecnico = this.tecnicoFilter();
    const desde = this.dateDesde();
    const hasta = this.dateHasta();

    return orders.filter(order => {
      if (this.negocio()?.rubro === 'METALURGICA') {
        const VISIT_STATUSES = ['SITE_VISIT', 'SITE_VISIT_DONE', 'VISITA_REPROGRAMADA', 'VISITA_CANCELADA'];
        const BUDGET_STATUSES = ['QUOTATION', 'BUDGET_GENERATED', 'BUDGET_REJECTED', 'SURVEY_DESIGN'];
        if (VISIT_STATUSES.includes(order.status) || BUDGET_STATUSES.includes(order.status)) {
          if (estado === 'all') return false; // Only hide from "all" view
        }
      }

      const matchEstado = estado === 'all' || order.status === estado;
      const matchUrgencia = urgencia === 'all' || order.urgencia === urgencia;

      const matchSearch = search === '' ||
        order.code.toLowerCase().includes(search) ||
        order.clientName.toLowerCase().includes(search) ||
        (order.responsableGeneral?.firstName || '').toLowerCase().includes(search) ||
        (order.responsableGeneral?.lastName || '').toLowerCase().includes(search);

      const orderDate = order.dueDate ? new Date(order.dueDate) : null;
      const matchDesde = !desde || (orderDate && orderDate >= new Date(desde));
      const matchHasta = !hasta || (orderDate && orderDate <= new Date(hasta + 'T23:59:59'));

      const matchTechnician = tecnico === 'all' || order.responsableGeneral?.id === tecnico;

      return matchEstado && matchUrgencia && matchSearch && matchDesde && matchHasta && matchTechnician;
    });
  });

  sortedOrders = computed(() => {
    const orders = [...this.filteredOrders()];
    const key = this.sortKey();
    const dir = this.sortDir();

    return orders.sort((a, b) => {
      let valA: any = (a as any)[key];
      let valB: any = (b as any)[key];

      if (key === 'fechaEntrega' || key === 'fechaActualizacion') {
        const dateA = valA ? new Date(valA).getTime() : 0;
        const dateB = valB ? new Date(valB).getTime() : 0;
        return dir === 'asc' ? dateA - dateB : dateB - dateA;
      }

      const comparison = String(valA).localeCompare(String(valB));
      return dir === 'asc' ? comparison : -comparison;
    });
  });

  activeOrders = computed(() =>
    this.sortedOrders().filter(o => o.status !== ORDER_STATUS.DELIVERED && o.status !== ORDER_STATUS.CANCELLED)
  );

  commercialOrders = computed(() => {
    if (this.negocio()?.rubro !== 'METALURGICA') return [];
    const VISIT_STATUSES = ['SITE_VISIT', 'SITE_VISIT_DONE', 'VISITA_REPROGRAMADA', 'VISITA_CANCELADA'];
    const BUDGET_STATUSES = ['QUOTATION', 'BUDGET_GENERATED', 'BUDGET_REJECTED', 'SURVEY_DESIGN'];
    const statuses = [...VISIT_STATUSES, ...BUDGET_STATUSES];
    return this.activeOrders().filter(o => statuses.includes(o.status));
  });

  productionOrders = computed(() => {
    const active = this.activeOrders();
    if (this.negocio()?.rubro !== 'METALURGICA') return active;

    const VISIT_STATUSES = ['SITE_VISIT', 'SITE_VISIT_DONE', 'VISITA_REPROGRAMADA', 'VISITA_CANCELADA'];
    const BUDGET_STATUSES = ['QUOTATION', 'BUDGET_GENERATED', 'BUDGET_REJECTED', 'SURVEY_DESIGN'];
    const statuses = [...VISIT_STATUSES, ...BUDGET_STATUSES];

    return active.filter(o => !statuses.includes(o.status));
  });

  archivedOrders = computed(() =>
    this.sortedOrders().filter(o => o.status === ORDER_STATUS.DELIVERED || o.status === ORDER_STATUS.CANCELLED)
  );

  hasPedidos = computed(() => this.allPedidos().length > 0);

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
  }

  async loadData() {
    const bId = this.businessId();
    if (!bId || (bId === this.lastLoadedBusinessId && this.allPedidos().length > 0)) return;

    this.lastLoadedBusinessId = bId;
    this.loading.set(true);
    this.error.set(null);

    try {
      const EXCLUDED = 'IN_STOCK,SITE_VISIT,SITE_VISIT_DONE,VISITA_REPROGRAMADA,VISITA_CANCELADA,QUOTATION,BUDGET_GENERATED,BUDGET_REJECTED,SURVEY_DESIGN';
      const [productionRes, summaryRes, employeesRes] = await Promise.all([
        this.api.getListing({
          businessId: bId,
          pageSize: 100,
          excludeStatuses: EXCLUDED
        }),
        this.api.getSummary(bId),
        this.api.getEmployees(bId)
      ]);

      this.allPedidos.set([...productionRes.data]);
      this.summary.set(summaryRes);
      this.employees.set(employeesRes);
    } catch (err) {
      this.error.set('No se pudieron cargar los datos. Por favor, intente de nuevo.');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
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
