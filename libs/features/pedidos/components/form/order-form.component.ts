import { Component, Input, Output, EventEmitter, inject, signal, computed, effect, OnDestroy, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Plus, Save, Zap, Calendar, CheckCircle2, ChevronDown, RefreshCw, Calculator, ChevronUp, MoreVertical, X, PlusCircle, ArrowRight, Layers, PencilLine, Trash2 } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';
import { SessionService } from '@core/session/session.service';
import { PedidosApiService } from '@core/api/pedidos.api.service';
import { ClientesApiService } from '@core/api/clientes.api.service';
import { Employee, Client, Rubro, ItemPedido } from '@shared/models';
import { ClientSelectorComponent } from '@shared/ui/clientes/client-selector.component';
import { EmployeeSelectorComponent } from '@shared/ui/employees/employee-selector.component';
import { IntelligentDatePickerComponent } from '@shared/ui/calendar/intelligent-date-picker.component';
import { AppDatePickerComponent } from '@shared/ui/app-date-picker/app-date-picker.component';
import { ItemDetailsFormComponent } from './items-section/item-details-form.component';
import { FloatingCalculatorComponent } from './floating-calculator.component';
import { FilesApiService } from '@core/api/files.api.service';
import { cn } from '@shared/utils/cn';
import { OrderCalculatorService } from '../../services/order-calculator.service';
import { ButtonSpinnerComponent } from '@shared/ui';
import { LayoutService } from '@core/layout/layout.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  host: { 'class': 'block' },
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    RouterModule,
    ClientSelectorComponent,
    EmployeeSelectorComponent,
    IntelligentDatePickerComponent,
    ItemDetailsFormComponent,
    ButtonSpinnerComponent
  ],
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit, OnDestroy {
  private api = inject(PedidosApiService);
  private filesApi = inject(FilesApiService);
  private clientesApi = inject(ClientesApiService);
  private session = inject(SessionService);
  public layoutService = inject(LayoutService);
  private router = inject(Router);
  private calculator = inject(OrderCalculatorService);

  readonly icons = { ArrowLeft, Plus, Save, Zap, Calendar, CheckCircle2, ChevronDown, RefreshCw, Calculator, ChevronUp, MoreVertical, X, PlusCircle, ArrowRight, Layers, PencilLine, Trash2 };

  ngOnInit() {
    this.layoutService.backAction.set(() => this.goBack());
    this.layoutService.headerTitle.set(this.forcedStatus === 'QUOTATION' ? 'NUEVO PRESUPUESTO' : 'NUEVO PEDIDO');
    this.layoutService.customBottomAction.set(null);
    this.layoutService.bottomNavHidden.set(true);
  }

  @Input() set forcedType(val: 'CLIENT' | 'STOCK' | undefined) {
    if (val) this.orderType.set(val);
  }

  @Input() forcedStatus?: string;
  @Input() cloneId?: string;
  @Input() id?: string; // Edit Mode
  @Input() returnUrl: string = '/pedidos';

  // State
  orderType = signal<'CLIENT' | 'STOCK'>('CLIENT');
  items = signal<any[]>([]);
  clienteId = signal('');
  selectedClientName = '';
  fechaEntrega = signal('');
  responsableId = signal('');
  observaciones = signal('');
  priority = signal(4); // 4: Normal, 3: Alta, 2: Urgente, 1: Crítica
  isSaving = signal(false);
  vErrors: any = {};

  // Side-Sheet State
  editingItemIndex = signal<number | null>(null);

  get rubro(): Rubro {
    return this.session.rubro() || 'OTRO';
  }

  showFloatingFooter = signal(false);
  isAtBottom = signal(false);
  actionsOpen = signal(false);
  isSaved = false;
  pendingFiles: string[] = [];
  private lastNegocioLoaded = '';
  private orderLoadedId = '';

  // Context
  config = computed(() => this.session.config());
  employees = signal<Employee[]>([]);
  clients = signal<any[]>([]);
  negocioId = computed(() => this.session.activeNegocio()?.id || '');

  totales = signal({
    subtotal: 0,
    diseno: 0,
    instalacion: 0,
    total: 0,
    totalSenias: 0,
    unidades: 0,
    saldoPendiente: 0
  });

  // Computed Functional Logic
  priorityLabel = computed(() => {
    const p = this.priority();
    if (p === 1) return 'Prioridad Crítica';
    if (p === 2) return 'Prioridad Urgente';
    if (p === 3) return 'Prioridad Alta';
    return 'Prioridad Normal';
  });

  priorityColorClass = computed(() => {
    const p = this.priority();
    if (p === 1) return 'bg-red-600 shadow-red-500/40';
    if (p === 2) return 'bg-orange-500 shadow-orange-500/40';
    if (p === 3) return 'bg-[#f43f5e] shadow-[0_0_8px_rgba(244,63,94,0.4)]';
    return 'bg-blue-500 shadow-blue-500/40';
  });

  materialsLabel = computed(() => {
    const materiasSet = new Set<string>();
    this.items().forEach(it => {
      const mat = it.tipo_filamento || it.material;
      if (mat) materiasSet.add(mat);
    });

    if (materiasSet.size === 0) return 'Sin material asignado';
    return Array.from(materiasSet).join(', ');
  });

  estimatedTimeLabel = computed(() => {
    // If delivery date is set, use that to calculate remaining days
    const fecha = this.fechaEntrega();
    if (fecha) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const delivery = new Date(fecha);
      delivery.setHours(0, 0, 0, 0);

      const diffTime = delivery.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Hoy';
      if (diffDays < 0) return 'Atrasado';
      if (diffDays === 1) return 'Mañana';
      return `${diffDays} Días`;
    }

    // Fallback to production time if no delivery date set
    const totalMin = this.items().reduce((acc, it) => acc + (Number(it.duracion_estimada_minutos) || 0), 0);
    if (totalMin <= 0) return 'Por definir';

    const hours = totalMin / 60;
    const days = Math.ceil(hours / 24);

    if (days === 1) return '1 Día';
    if (days > 1) return `${days} Días`;
    return `${Math.ceil(hours)} Horas`;
  });

  estimatedTimePercent = computed(() => {
    const totalMin = this.items().reduce((acc, it) => acc + (Number(it.duracion_estimada_minutos) || 0), 0);
    if (totalMin <= 0) return 0;
    return Math.min(100, (totalMin / 10000) * 100); // Normalize somehow for visual
  });

  cyclePriority() {
    this.priority.update(current => current === 1 ? 4 : current - 1);
  }

  onClientSelected(client: Client) {
    this.selectedClientName = client.name;
    // Auto-priority if client is VIP/Priority (example logic)
    if ((client as any).tags?.includes('VIP')) {
      this.priority.set(3);
    }
  }

  async saveAsDraft() {
    this.forcedStatus = 'DRAFT';
    await this.handleSave();
  }

  constructor() {
    effect(() => {
      const bid = this.negocioId();
      if (bid && bid !== this.lastNegocioLoaded) {
        this.lastNegocioLoaded = bid;
        this.loadEmployees();
      }

      if (this.id && this.id !== this.orderLoadedId) {
        this.orderLoadedId = this.id;
        this.loadOrderForEditing();
      }
    });
    // Si no es edición, añadir un item inicial
    if (!this.id) this.addItem(false);
  }

  async loadOrderForEditing() {
    if (!this.id) return;
    try {
      this.isSaving.set(true);
      const order = await this.api.findOne(this.id);

      this.orderType.set(order.type);
      this.clienteId.set(order.customerId || (order as any).clienteId);
      this.selectedClientName = order.clientName;
      this.fechaEntrega.set(order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '');
      this.responsableId.set(order.responsableGeneralId || (order as any).responsableId || (order as any).operatorId || order.responsableGeneral?.id || '');
      this.observaciones.set(order.notes || '');
      this.priority.set(order.priority || 4);

      // Phase 7: Integrity Sanitization
      const mappedItems = order.items.map(it => ({
        id: it.id,
        nombreProducto: it.name || it.nombreProducto,
        cantidad: it.qty || it.cantidad,
        precioUnitario: it.price || it.unitPrice || it.precioUnitario,
        senia: it.deposit || it.senia || 0,
        descripcion: it.description || it.descripcion,
        url_stl: it.stlUrl,
        peso_gramos: it.weightGrams,
        duracion_estimada_minutos: it.estimatedMinutes,
        referenceImages: it.referenceImages,
        metadata: it.metadata,
        ...(it.metadata?.['print3d'] || {})
      } as any));

      const sanitizedItems: any[] = [];
      const seenItems = new Set<string>();

      mappedItems.forEach(it => {
        const fingerPrint = `${it.nombreProducto}|${it.precioUnitario}|${it.cantidad}|${it.descripcion || ''}`;
        if (!seenItems.has(fingerPrint)) {
          seenItems.add(fingerPrint);
          sanitizedItems.push(it);
        }
      });

      this.items.set(sanitizedItems);
      this.recalcTotales();
    } catch (e) {
      console.error('Error loading order for editing', e);
    } finally {
      this.isSaving.set(false);
    }
  }

  ngOnDestroy() {
    this.layoutService.backAction.set(null);
    this.layoutService.headerTitle.set(null);
    this.layoutService.bottomNavHidden.set(false);
    this.cleanupFiles();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showFloatingFooter.set(window.scrollY > 300);

    // Check if near bottom to hide the quick-scroll arrow
    const threshold = 150;
    const scrollPos = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    this.isAtBottom.set((scrollPos + windowHeight) >= (docHeight - threshold));
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.pendingFiles.length > 0 && !this.isSaved) {
      event.preventDefault();
      event.returnValue = 'Tienes archivos subidos que no se guardarán. ¿Estás seguro de que quieres salir?';
    }
  }

  @HostListener('document:keydown.escape')
  onKeydownHandler() {
    if (this.editingItemIndex() !== null) {
      this.closeSidebar();
    }
  }

  trackPendingFile(data: any) {
    const path = typeof data === 'string' ? data : data.file?.path;
    if (path && !this.pendingFiles.includes(path)) {
      this.pendingFiles.push(path);
    }
  }

  untrackFile(data: any) {
    const path = typeof data === 'string' ? data : data.path;
    this.pendingFiles = this.pendingFiles.filter(p => p !== path);
  }

  async cleanupFiles() {
    if (this.isSaved || this.pendingFiles.length === 0) return;
    const filesToDelete = [...this.pendingFiles];
    this.pendingFiles = [];
    for (const path of filesToDelete) {
      try {
        await this.filesApi.deleteFile(path);
      } catch (e) { console.error('Cleanup error', path, e); }
    }
  }

  removeDuplicates() {
    const prev = this.items();
    const unique = new Map<string, any>();
    prev.forEach(it => {
      // Key based on content to identify duplicates
      const key = `${it.nombreProducto}|${it.precioUnitario}|${it.cantidad}|${it.descripcion || ''}`;
      if (!unique.has(key)) {
        unique.set(key, it);
      }
    });
    this.items.set(Array.from(unique.values()));
  }

  async loadEmployees() {
    if (!this.negocioId()) return;
    try {
      const [emps, cls] = await Promise.all([
        this.api.getEmployees(this.negocioId()),
        this.clientesApi.getListing(this.negocioId())
      ]);
      this.employees.set(emps);
      this.clients.set(cls);
      if (this.clienteId()) {
        const client = cls.find(c => c.id === this.clienteId());
        this.selectedClientName = client?.name || '';
      }
    } catch (e) { console.error('Error loading data', e); }
  }

  addItem(autoOpen = true) {
    const newItem = {
      id: Math.random().toString(36).substring(7),
      nombreProducto: '',
      cantidad: 1,
      precioUnitario: 0,
      rubro: this.rubro,
      _isNew: true
    };
    this.items.update(it => [...it, newItem]);

    // Auto-open sidebar only if requested (usually via manual click)
    if (autoOpen) {
      setTimeout(() => {
        this.openSidebar(this.items().length - 1);
      }, 0);
    }
  }

  async removeItem(index: number, skipConfirm = false) {
    const item = this.items()[index];
    if (!item) return;

    const hasData = (item.nombreProducto && item.nombreProducto.trim() !== '') ||
      (item.precioUnitario > 0) ||
      (item.referenceImages?.length > 0) ||
      (item.url_stl && item.url_stl.trim() !== '');

    if (!skipConfirm && hasData) {
      const confirmDelete = confirm('¿Deseas eliminar este ítem? Se perderán todos los datos técnicos cargados.');
      if (!confirmDelete) return;
    }

    this.items.update(it => it.filter((_, i) => i !== index));
    this.recalcTotales();
  }

  openSidebar(index: number) {
    this.editingItemIndex.set(index);
    // Lock background scroll (optional but recommended)
    document.body.style.overflow = 'hidden';
  }

  closeSidebar() {
    // Clear the _isNew flag from the item if it was just added
    const idx = this.editingItemIndex();
    if (idx !== null) {
      this.items.update(it => {
        const newArr = [...it];
        if (newArr[idx]) {
          const { _isNew, ...rest } = newArr[idx];
          newArr[idx] = rest as any;
        }
        return newArr;
      });
    }

    this.editingItemIndex.set(null);
    document.body.style.overflow = 'auto';
    this.recalcTotales();
  }

  getItemTotal(item: any): number {
    return this.calculator.calculateItem(item, this.rubro).total;
  }

  recalcTotales() {
    this.totales.set(this.calculator.calculateOrder(this.items(), this.rubro));
    // Clear the auto-edit flag after first interaction
    this.items().forEach(it => { if (it._isNew) it._isNew = false; });
  }

  scrollToBottom() {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }

  goBack() {
    this.router.navigate([this.returnUrl]);
  }

  async handleSave(e?: Event) {
    if (e) e.preventDefault();
    if (this.isSaving()) return;
    if (this.orderType() === 'CLIENT' && !this.clienteId()) {
      alert('Debe seleccionar un cliente');
      return;
    }
    this.isSaving.set(true);
    try {
      const payload: any = {
        type: this.orderType(),
        businessId: this.negocioId(),
        customerId: this.orderType() === 'CLIENT' ? this.clienteId() : undefined,
        clientName: this.orderType() === 'CLIENT' ? this.selectedClientName : 'STOCK',
        dueDate: this.fechaEntrega() || undefined,
        notes: this.observaciones(),
        priority: this.priority(),
        responsableGeneralId: this.responsableId() || undefined,
        items: this.items().map(it => {
          const hasTechnicalData = this.rubro === 'IMPRESION_3D'
            ? (!!it.peso_gramos && !!it.duracion_estimada_minutos && (!!it.url_stl || !!it.stlFile))
            : (!!it.duracion_estimada_minutos);
          
          const hasManualPrice = (Number(it.precioUnitario) || 0) > 0;
          const isPending = !hasTechnicalData && !hasManualPrice;

          return {
            id: it.id?.includes('-') ? it.id : undefined,
            name: it.nombreProducto || 'ITEM',
            qty: Math.max(1, Math.floor(Number(it.cantidad) || 1)),
            isPendingQuote: isPending,
            price: isPending ? null : (Number(it.precioUnitario) || 0),
            deposit: Math.max(0, Number(it.senia) || 0),
            weightGrams: Number(it.peso_gramos) || 0,
            estimatedMinutes: Math.floor(Number(it.duracion_estimada_minutos) || 0),
            stlUrl: it.url_stl || '',
            referenceImages: it.referenceImages || [],
            metadata: {
              ...it.metadata,
              ...(this.rubro === 'IMPRESION_3D' ? {
                print3d: {
                  designsStl: it.seDiseñaSTL,
                  stlUrl: it.url_stl,
                  designPrice: it.precioDiseno,
                  stlFile: it.stlFile,
                  referenceImages: it.referenceImages,
                  tipo_filamento: it.tipo_filamento,
                  peso_gramos: it.peso_gramos,
                  duracion_estimada_minutos: it.duracion_estimada_minutos
                }
              } : {})
            }
          };
        }),
        status: this.forcedStatus || (this.id ? undefined : (this.rubro === 'METALURGICA' ? 'APPROVED' : 'PENDING')),
        totalPrice: this.items().some(it => {
          const hasTechnicalData = this.rubro === 'IMPRESION_3D'
            ? (!!it.peso_gramos && !!it.duracion_estimada_minutos && (!!it.url_stl || !!it.stlFile))
            : (!!it.duracion_estimada_minutos);
          const hasManualPrice = (Number(it.precioUnitario) || 0) > 0;
          return !hasTechnicalData && !hasManualPrice;
        }) ? null : this.totales().total,
        totalSenias: this.totales().totalSenias
      };

      if (this.id) {
        // Keep businessId for role validation in guards
        delete payload.customerId;
        delete payload.priority;
        await this.api.update(this.id, payload);
      } else {
        await this.api.create(payload);
      }
      this.session.refreshPlanUsage();
      this.isSaved = true;
      this.router.navigate([this.returnUrl]);
    } catch (err) {
      console.error('Error saving order', err);
      alert('Error al guardar el pedido');
    } finally {
      this.isSaving.set(false);
    }
  }

  cn = cn;
}
