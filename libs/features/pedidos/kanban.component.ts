import { Component, computed, effect, inject, signal, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Plus, LayoutGrid, List, ChevronLeft, ChevronRight, Eye, EyeOff, Search } from 'lucide-angular';
import { PedidosApiService } from '../../core/api/pedidos.api.service';
import { SessionService } from '../../core/session/session.service';
import { Pedido, Employee, OrderStatus, ORDER_STATUS } from '../../shared/models/pedido';
import { getNegocioConfig, getStatusLabel, getStatusStyles, getStatusColorBase } from '../../shared/utils/negocio-utils';
import { cn } from '../../shared/utils/cn';

import { OrderStatusModalComponent } from './status-modal/status-modal.component';
import { SearchFilterBarComponent, BadgeUrgenciaComponent, FilterOptions, FilterValues } from '../../shared/ui';

@Component({
  selector: 'app-pedidos-kanban',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, OrderStatusModalComponent, SearchFilterBarComponent, BadgeUrgenciaComponent],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class PedidosKanbanComponent implements OnDestroy {
  private api = inject(PedidosApiService);
  private session = inject(SessionService);

  // Business State
  businessId = this.session.activeId;
  rubro = computed(() => this.session.activeNegocio()?.rubro || 'GENERICO');
  config = computed(() => getNegocioConfig(this.rubro()));
  columns = computed(() => this.config().productionStages.map(s => ({ ...s, key: s.key as OrderStatus })));

  // Filters computed
  currentFilterValues = computed<FilterValues>(() => ({
    search: this.searchTerm(),
    status: this.estadoFilter(),
    technician: this.tecnicoFilter(),
    urgency: this.urgenciaFilter(),
    startDate: this.dateDesde(),
    endDate: this.dateHasta()
  }));

  filterOptions = computed<FilterOptions>(() => {
    return {
      statuses: this.columns().map(s => ({ label: s.label, value: s.key })),
      technicians: this.employees(),
      urgencies: [
        { label: 'VENCIDO', value: 'VENCIDO' },
        { label: 'PRÓXIMO', value: 'PRÓXIMO' },
        { label: 'EN TIEMPO', value: 'EN TIEMPO' }
      ]
    };
  });

  filteredOrders = computed(() => {
    let orders = this.allPedidos();
    const search = this.searchTerm().toLowerCase();
    const status = this.estadoFilter();
    const tecnico = this.tecnicoFilter();
    const urgencia = this.urgenciaFilter();
    const desde = this.dateDesde();
    const hasta = this.dateHasta();

    return orders.filter(o => {
      const matchSearch = !search || 
        o.code.toLowerCase().includes(search) || 
        o.clientName.toLowerCase().includes(search);
      
      const matchStatus = status === 'all' || o.status === status;
      const matchTecnico = tecnico === 'all' || o.responsableGeneral?.id === tecnico;
      const matchUrgencia = urgencia === 'all' || o.urgencia === urgencia;
      
      const orderDate = o.dueDate ? new Date(o.dueDate) : null;
      const matchDesde = !desde || (orderDate && orderDate >= new Date(desde));
      const matchHasta = !hasta || (orderDate && orderDate <= new Date(hasta + 'T23:59:59'));

      return matchSearch && matchStatus && matchTecnico && matchUrgencia && matchDesde && matchHasta;
    });
  });

  // Data State
  allPedidos = signal<Pedido[]>([]);
  employees = signal<Employee[]>([]);
  loading = signal(true);

  // UI State
  selectedOrder = signal<Pedido | null>(null);
  isModalOpen = signal(false);
  hideEmpty = signal(false);
  collapsedStages = signal<Set<string>>(new Set());
  isDragging = signal(false);
  canScrollLeft = signal(false);
  canScrollRight = signal(false);
  visualSpeed = signal(0); // For scroll indicators

  // Filters State
  searchTerm = signal('');
  estadoFilter = signal('all');
  tecnicoFilter = signal('all');
  urgenciaFilter = signal('all');
  dateDesde = signal('');
  dateHasta = signal('');

  // Icons for Template (Senior standard: [img] syntax)
  protected readonly icons = { 
    Plus, LayoutGrid, List, ChevronLeft, ChevronRight, Eye, EyeOff, Search 
  };

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  private scrollSpeed = 0;
  private animationFrameId?: number;

  private lastLoadedBusinessId: string | null = null;

  constructor() {
    effect(() => {
      const bid = this.session.activeId();
      if (bid && bid !== this.lastLoadedBusinessId) {
        this.loadData(bid);
      }
    });

    // Handle horizontal scrolling animation
    if (typeof window !== 'undefined') {
      const performScroll = () => {
        if (this.scrollSpeed !== 0 && this.scrollContainer) {
          this.scrollContainer.nativeElement.scrollLeft += this.scrollSpeed;
          this.checkScroll();
        }
        this.animationFrameId = requestAnimationFrame(performScroll);
      };
      this.animationFrameId = requestAnimationFrame(performScroll);
    }
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  async loadData(businessId: string) {
    if (businessId === this.lastLoadedBusinessId && this.allPedidos().length > 0) return;
    this.lastLoadedBusinessId = businessId;
    
    this.loading.set(true);
    try {
      const [pedidos, emps] = await Promise.all([
        this.api.getListing({ businessId }),
        this.api.getEmployees(businessId)
      ]);
      
      // Filter orders to exclude Stock, Delivered and Cancelled for the operational kanban
      const filtered = (pedidos.data || []).filter((o: Pedido) => 
        o.type !== 'STOCK' && 
        o.clientName?.trim().toUpperCase() !== 'STOCK' &&
        o.status !== ORDER_STATUS.CANCELLED && 
        o.status !== ORDER_STATUS.DELIVERED
      );

      this.allPedidos.set(filtered);
      this.employees.set(emps || []);
    } catch (e) {
      console.error('Error loading Kanban data:', e);
    } finally {
      this.loading.set(false);
    }
  }

  openManageModal(order: Pedido, newStatus?: OrderStatus) {
    if (newStatus) {
      this.selectedOrder.set({ ...order, status: newStatus });
    } else {
      this.selectedOrder.set(order);
    }
    this.isModalOpen.set(true);
  }

  // Kanban Logic
  toggleCollapse(key: string) {
    const next = new Set(this.collapsedStages());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.collapsedStages.set(next);
  }

  collapseAll() {
    this.collapsedStages.set(new Set(this.columns().map(c => c.key)));
  }

  expandAll() {
    this.collapsedStages.set(new Set());
  }

  scrollToStage(key: string) {
    const element = document.getElementById(`lane-${key}`);
    if (element && this.scrollContainer) {
      const container = this.scrollContainer.nativeElement;
      const left = element.offsetLeft - container.offsetLeft - 24;
      container.scrollTo({ left, behavior: 'smooth' });
    }
  }

  // Scroll Handling
  checkScroll() {
    if (this.scrollContainer) {
      const { scrollLeft, scrollWidth, clientWidth } = this.scrollContainer.nativeElement;
      this.canScrollLeft.set(scrollLeft > 10);
      this.canScrollRight.set(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }

  handleMouseMove(e: MouseEvent) {
    this.handleScrollDetection(e.clientX);
  }

  handleMouseLeave() {
    this.scrollSpeed = 0;
    this.visualSpeed.set(0);
  }

  private handleScrollDetection(clientX: number) {
    if (!this.scrollContainer) return;
    const rect = this.scrollContainer.nativeElement.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const edgeSize = 180;
    
    let newSpeed = 0;
    if (x < edgeSize) {
      const factor = Math.max(0, (edgeSize - x) / edgeSize);
      newSpeed = -Math.pow(factor, 1.2) * 45;
    } else if (x > width - edgeSize) {
      const factor = Math.max(0, (x - (width - edgeSize)) / edgeSize);
      newSpeed = Math.pow(factor, 1.2) * 45;
    }

    if (this.scrollSpeed !== newSpeed) {
      this.scrollSpeed = newSpeed;
      this.visualSpeed.set(newSpeed);
    }
  }

  // Drag and Drop (Native)
  onDragStart(e: DragEvent, orderId: string) {
    if (e.dataTransfer) {
      e.dataTransfer.setData('orderId', orderId);
      e.dataTransfer.effectAllowed = 'move';
      this.isDragging.set(true);
    }
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.handleScrollDetection(e.clientX);
  }

  onDragEnd() {
    this.isDragging.set(false);
    this.scrollSpeed = 0;
    this.visualSpeed.set(0);
  }

  async onDrop(e: DragEvent, newStatus: OrderStatus) {
    e.preventDefault();
    this.onDragEnd();
    
    const orderId = e.dataTransfer?.getData('orderId');
    if (orderId) {
      const order = this.allPedidos().find(o => o.id === orderId);
      if (order && order.status !== newStatus) {
        this.openManageModal(order, newStatus);
      }
    }
  }

  // Helpers
  getOrdersForCol(key: OrderStatus) {
    return this.filteredOrders().filter(o => o.status === key);
  }

  onFilterChange({ key, value }: { key: string, value: any }) {
    switch (key) {
      case 'search': this.searchTerm.set(value); break;
      case 'status': this.estadoFilter.set(value); break;
      case 'technician': this.tecnicoFilter.set(value); break;
      case 'urgency': this.urgenciaFilter.set(value); break;
      case 'startDate': this.dateDesde.set(value); break;
      case 'endDate': this.dateHasta.set(value); break;
    }
  }

  clearFilters() {
    this.searchTerm.set('');
    this.estadoFilter.set('all');
    this.tecnicoFilter.set('all');
    this.urgenciaFilter.set('all');
    this.dateDesde.set('');
    this.dateHasta.set('');
  }

  getLabel = getStatusLabel;
  getStyles = getStatusStyles;
  getColorBase = getStatusColorBase;
  cn = cn;
}
