import { Component, inject, signal, OnInit, computed, effect, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PageShellComponent } from '@shared/ui';
import { PedidosApiService } from '../../core/api/pedidos.api.service';
import { AuthService } from '../../core/auth/auth.service';
import { SessionService } from '../../core/session/session.service';
import { Pedido, OrderStatus, PedidoSummary, Employee, ORDER_STATUS } from '../../shared/models';
import { LucideAngularModule } from 'lucide-angular';
import { OrderStatusModalComponent } from './status-modal/status-modal.component';
import { SkeletonComponent, SearchFilterBarComponent, OrdersTableComponent, PaginatorComponent, PageSizeSelectorComponent, FilterOptions, FilterValues, LoadingSpinnerComponent } from '../../shared/ui';
import { PedidoSortKey, PedidoSortDir } from '../../shared/models/pedido';
import { PEDIDOS_LABELS, PEDIDOS_ICONS } from './pedidos.config';
import { getStatusLabel, getStatusStyles } from '@shared/utils';
import { cn } from '@shared/utils/cn';
import { ConfirmService } from '@shared/ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-pedidos-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    FormsModule,
    OrderStatusModalComponent,
    SearchFilterBarComponent,
    OrdersTableComponent,
    PaginatorComponent,
    LoadingSpinnerComponent,
    PageSizeSelectorComponent,
    PageShellComponent
  ],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(PedidosApiService);
  public session = inject(SessionService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private confirm = inject(ConfirmService);
  cn = cn;

  // Labels and Icons for Template
  protected readonly labels = PEDIDOS_LABELS;
  protected readonly icons = PEDIDOS_ICONS;
  loading = signal(false);
  loadingProduction = signal(false);
  loadingCommercial = signal(false);
  loadingArchived = signal(false);
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

  // Plan Usage
  planUsage = this.session.planUsage;
  canAddOrder = computed(() => this.planUsage()?.canCreate.orders ?? true);

  // UI State
  selectedOrder = signal<Pedido | null>(null);
  isModalOpen = signal(false);

  // Pagination State
  pageSize = 5;

  productionOrdersData = signal<Pedido[]>([]);
  productionPage = signal(1);
  productionTotal = signal(0);

  commercialOrdersData = signal<Pedido[]>([]);
  commercialPage = signal(1);
  commercialTotal = signal(0);

  archivedOrdersData = signal<Pedido[]>([]);
  archivedPage = signal(1);
  archivedTotal = signal(0);
  archivedLoaded = signal(false);

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

  @ViewChild('historyTrigger') historyTrigger?: ElementRef;
  private observer?: IntersectionObserver;

  constructor() {
    // Refresh when businessId changes
    effect(() => {
      const bid = this.businessId();
      if (bid && bid !== this.lastLoadedBusinessId) {
        this.loadData({ initial: true });
      }
    });
  }

  ngAfterViewInit() {
    this.setupObserver();
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
  }

  private setupObserver() {
    this.observer = new IntersectionObserver(([entry]) => {
      // REGLA: No cargar historial si las tablas principales todavía están cargando (falsa intersección por skeletons)
      const mainLoading = this.loadingProduction() || this.loadingCommercial();

      if (entry.isIntersecting && !mainLoading && !this.loadingArchived() && !this.archivedLoaded()) {
        this.loadArchived();
      }
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px' // Forzar a que entre al menos 100px en pantalla
    });

    if (this.historyTrigger) {
      this.observer.observe(this.historyTrigger.nativeElement);
    }
  }

  ngOnInit() {
    // Handle search from QueryParams (deep linking)
    const initialSearch = this.route.snapshot.queryParamMap.get('search');
    if (initialSearch) {
      this.searchTerm.set(initialSearch);
      this.loadData({ initial: true });
    }
  }

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

    this.productionPage.set(1);
    this.commercialPage.set(1);
    this.archivedPage.set(1);
    this.archivedLoaded.set(false); // REGLA: Resetear carga para forzar lazy loading en scroll

    this.loadData();
  }

  async loadData(options: { initial?: boolean } = {}) {
    // Global data is always needed
    this.loadGlobalData();
    this.session.refreshPlanUsage();

    // 1. Always load production (Table 1)
    this.loadProduction();

    // 2. Only load commercial if it's the right rubro 
    // or if we are filtering and want to see if there's anything there
    const isMetalurgica = this.session.activeNegocio()?.rubro === 'METALURGICA';
    if (isMetalurgica) {
      this.loadCommercial();
    } else {
      // Clear it for other rubros to avoid the "ghost" section
      this.commercialOrdersData.set([]);
      this.commercialTotal.set(0);
      this.loadingCommercial.set(false);
    }

    // 3. History (Table 2) is lazy-loaded on scroll by the template
    // REGLA OBLIGATORIA: El historial NUNCA se carga automáticamente en loadData principal
    // Se resetea para que el IntersectionObserver lo dispare al scrollear
    if (options.initial) {
      this.archivedOrdersData.set([]);
      this.archivedTotal.set(0);
      this.archivedLoaded.set(false);
      this.loadingArchived.set(false);
    }
  }

  private getCommonParams() {
    return {
      businessId: this.businessId(),
      search: this.searchTerm() || undefined,
      startDate: this.dateDesde() || undefined,
      endDate: this.dateHasta() || undefined,
      responsableId: this.tecnicoFilter() === 'all' ? undefined : this.tecnicoFilter(),
      type: 'CLIENT' // Excluir pedidos de Stock
    };
  }

  async loadGlobalData() {
    const bId = this.businessId();
    if (!bId) return;
    try {
      const empsRes = await this.api.getEmployees(bId);
      this.employees.set(empsRes);
      this.lastLoadedBusinessId = bId;
    } catch (err) { console.error('Error global data:', err); }
  }

  async loadProduction() {
    const bId = this.businessId();
    if (!bId) return;
    this.loadingProduction.set(true);
    try {
      const EXCLUDED_PRODUCTION = 'IN_STOCK,DELIVERED,CANCELLED,SITE_VISIT,SITE_VISIT_DONE,VISITA_REPROGRAMADA,VISITA_CANCELADA,QUOTATION,BUDGET_GENERATED,BUDGET_REJECTED,SURVEY_DESIGN';
      const res = await this.api.getListing({
        ...this.getCommonParams(),
        page: this.productionPage(),
        pageSize: this.pageSize,
        excludeStatuses: EXCLUDED_PRODUCTION
      });
      this.productionOrdersData.set(res.data);
      this.productionTotal.set(res.total || 0);
      this.syncSelectedOrder(res.data);
    } catch (err) { console.error('Error production:', err); }
    finally { this.loadingProduction.set(false); }
  }

  async loadCommercial() {
    const bId = this.businessId();
    if (!bId) return;
    this.loadingCommercial.set(true);
    try {
      const COMMERCIAL_STATUSES = 'SITE_VISIT,SITE_VISIT_DONE,VISITA_REPROGRAMADA,VISITA_CANCELADA,QUOTATION,BUDGET_GENERATED,BUDGET_REJECTED,SURVEY_DESIGN';
      const res = await this.api.getListing({
        ...this.getCommonParams(),
        page: this.commercialPage(),
        pageSize: this.pageSize,
        statuses: COMMERCIAL_STATUSES
      });
      this.commercialOrdersData.set(res.data);
      this.commercialTotal.set(res.total || 0);
      this.syncSelectedOrder(res.data);
    } catch (err) { console.error('Error commercial:', err); }
    finally { this.loadingCommercial.set(false); }
  }

  async loadArchived() {
    const bId = this.businessId();
    if (!bId) return;
    this.loadingArchived.set(true);
    try {
      const HISTORY_STATUSES = 'DELIVERED,CANCELLED';
      const res = await this.api.getListing({
        ...this.getCommonParams(),
        page: this.archivedPage(),
        pageSize: this.pageSize,
        statuses: HISTORY_STATUSES
      });
      this.archivedOrdersData.set(res.data);
      this.archivedTotal.set(res.total || 0);
      this.archivedLoaded.set(true);
      this.syncSelectedOrder(res.data);
    } catch (err) { console.error('Error archived:', err); }
    finally { this.loadingArchived.set(false); }
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.productionPage.set(1);
    this.commercialPage.set(1);
    this.archivedPage.set(1);
    this.loadData();
  }

  onProductionPageChange(page: number) {
    this.productionPage.set(page);
    this.loadProduction();
  }

  onCommercialPageChange(page: number) {
    this.commercialPage.set(page);
    this.loadCommercial();
  }

  onArchivedPageChange(page: number) {
    this.archivedPage.set(page);
    this.loadArchived();
  }

  private syncSelectedOrder(newData: Pedido[]) {
    const current = this.selectedOrder();
    if (!current) return;

    const updated = newData.find(o => o.id === current.id);
    if (updated) {
      this.selectedOrder.set(updated);
    }
  }

  goToDetail(order: Pedido) {
    this.router.navigate(['/pedidos', order.id]);
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

  async handleDelete(order: Pedido) {
    const ok = await this.confirm.confirm({
      title: 'Eliminar Pedido',
      message: `¿Estás seguro de que deseas eliminar permanentemente el pedido #${order.code}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar Ahora',
      cancelLabel: 'Cancelar',
      type: 'danger'
    });

    if (ok) {
      this.loading.set(true);
      try {
        await this.api.delete(order.id, order.businessId);
        await this.loadData();
      } catch (err) {
        console.error('Error deleting order:', err);
        alert('No se pudo eliminar el pedido.');
      } finally {
        this.loading.set(false);
      }
    }
  }
}
