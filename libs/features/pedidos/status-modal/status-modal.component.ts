import {
  Component, computed, inject, signal, input, Output,
  EventEmitter, OnInit, effect, HostListener, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, X, Gauge, Cpu, User, Calendar, CreditCard,
  DollarSign, AlertOctagon, Layers, CheckCircle2, MessageSquare,
  RefreshCw, ChevronDown, ChevronLeft, Check, ChevronRight, Clock, Truck, XCircle
} from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui';
import { Pedido, Employee, OrderStatus, OrderItemStatus } from '@shared/models/pedido';
import { PedidosApiService } from '@core/api/pedidos.api.service';
import { MaquinasApiService } from '@core/api/maquinas.api.service';
import { MaterialesApiService } from '@core/api/materiales.api.service';
import { SessionService } from '@core/session/session.service';
import { MaquinasService } from '@core/api/maquinas.service';
import { MaterialesService } from '@core/api/materiales.service';
import { getNegocioConfig, getStatusLabel, getStatusStyles } from '@shared/utils/negocio-utils';
import { cn } from '@shared/utils/cn';
import { AppDatePickerComponent } from '@shared/ui/app-date-picker/app-date-picker.component';
import { Machine, Material } from '@shared/models';

// Sections
import { PaymentModuleComponent } from './sections/payment-module.component';
import { FailureModuleComponent } from './sections/failure-module.component';
import { MetalurgicaSectionComponent } from './sections/metalurgica-section.component';
import { Impresion3dSectionComponent } from './sections/impresion-3d-section.component';
import { MultiMaterial } from '@shared/models/material-consumption';

@Component({
  selector: 'app-order-status-modal',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    FormsModule,
    ButtonSpinnerComponent,
    PaymentModuleComponent,
    FailureModuleComponent,
    AppDatePickerComponent
  ],
  templateUrl: './status-modal.component.html',
  styleUrls: ['./status-modal.component.css']
})
export class OrderStatusModalComponent implements OnInit, AfterViewInit {
  private api = inject(PedidosApiService);
  private maquinasApi = inject(MaquinasApiService);
  private materialesApi = inject(MaterialesApiService);
  private session = inject(SessionService);
  private maquinasService = inject(MaquinasService);
  private materialesService = inject(MaterialesService);
  private cdr = inject(ChangeDetectorRef);

  order = input<Pedido | null>(null);
  isOpen = input<boolean>(false);
  employees = input<Employee[]>([]);
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  // UI State
  status = signal<string>('');
  responsableGeneralId = signal<string>('');
  notes = signal<string>('');
  // Simplified Global Stages for UI Stepper
  protected readonly GLOBAL_STAGES = [
    { key: 'PENDING', label: 'Pendiente', icon: 'Clock' },
    { key: 'IN_PROGRESS', label: 'En Proceso', icon: 'Cpu' },
    { key: 'READY', label: 'Listo', icon: 'CheckCircle2' },
    { key: 'DELIVERED', label: 'Entregado', icon: 'Truck' },
    { key: 'CANCELLED', label: 'Cancelado', icon: 'XCircle' }
  ];

  // Helper to determine active step in the simplified view
  currentGlobalStep = computed(() => {
    const s = this.status();
    if (!s) return -1;
    
    // Mapping Technical states to Global steps
    if (s === 'PENDING') return 0;
    
    if (['DESIGN', 'IN_PRODUCTION', 'PRINTING', 'REPRINT_PENDING', 'RE_WORK', 'POST_PROCESS', 'CUTTING', 'WELDING', 'ASSEMBLY', 'PAINTING', 'INSTALACION_OBRA', 'IN_PROGRESS'].includes(s)) {
      return 1;
    }
    
    if (['READY', 'READY_FOR_DELIVERY', 'DONE'].includes(s)) return 2;
    if (s === 'DELIVERED') return 3;
    if (s === 'CANCELLED') return 4;
    
    return 1; // Default to Proceso if mixed
  });

  isSaving = signal(false);

  // Scroller State
  @ViewChild('stepperViewport') stepperViewport?: ElementRef<HTMLElement>;
  canScrollLeft = signal(false);
  canScrollRight = signal(false);
  private scrollInterval?: any;
  private isJumping = signal(false);

  // Modes State
  isPaymentMode = signal(false);
  isFailureMode = signal(false);

  // Payment Data
  paymentAmount = signal<number>(0);
  paymentMethod = signal<string>('CASH');

  // Failure Data
  failureReason = signal<string>('');
  failureAction = signal<'REDO' | 'DISCARD' | 'KEEP'>('REDO');
  wastedTime = signal<number>(0);
  wastedMaterial = signal<number>(0);

  // Metalurgica Specific Data
  tipoTrabajo = signal<string>('');
  itemName = signal<string>('');
  measurements = signal<string>('');
  visitAddress = signal<string>('');
  visitDate = signal<string>('');
  visitTime = signal<string>('');
  visitObservations = signal<string>('');
  totalPrice = signal<number>(0);
  senia = signal<number>(0);

  // Impresion 3D Specific Data
  selectedMachineId = signal<string>('');
  multiMaterials = signal<MultiMaterial[]>([]);
  machines = signal<Machine[]>([]);
  materials = signal<Material[]>([]);
  updatingItemIds = signal<Set<string>>(new Set());

  icons: any = {
    Gauge, AlertOctagon, DollarSign, X, Layers, CheckCircle2,
    User, Calendar, MessageSquare, RefreshCw, ChevronDown, ChevronLeft, Cpu, Check, ChevronRight,
    Clock, Truck, XCircle
  };

  getIcon(name: string): any {
    return this.icons[name] || this.icons.Check;
  }

  // Derived Values
  rubro = computed(() => this.session.activeNegocio()?.rubro || 'GENERICO');
  isMetalurgica = computed(() => this.rubro() === 'METALURGICA');

  // Payment Status context (calculated for safety)
  totalVal = computed(() => Number(this.order()?.totalPrice || 0));
  paidVal = computed(() => Number(this.order()?.totalPayments || 0));
  balanceVal = computed(() => Math.max(0, this.totalVal() - this.paidVal()));
  isFullyPaid = computed(() => this.balanceVal() < 0.01); // Safe comparison for decimals
  isReadyState = computed(() => ['READY', 'READY_FOR_DELIVERY', 'DONE'].includes(this.status()));
  isDeliveredState = computed(() => this.status() === 'DELIVERED');

  config = computed(() => getNegocioConfig(this.rubro()));
  is3D = computed(() => this.rubro() === 'IMPRESION_3D');

  stages = computed(() => {
    const all = this.config().productionStages;
    const order = this.order();
    if (!order) return all;

    const current = order.status;
    const isMetal = this.isMetalurgica();

    return all.filter(s => {
      // Always allow current status to be visible
      if (current === s.key) return true;
      if (s.key === 'FAILED') return false;

      // METALURGICA RESTRICTIONS: Commercial vs Production cycles
      if (isMetal) {
        const visitStatusList = ['SITE_VISIT', 'SITE_VISIT_DONE', 'VISITA_REPROGRAMADA', 'VISITA_CANCELADA', 'SURVEY_DESIGN'];
        const budgetStatusList = ['QUOTATION', 'BUDGET_GENERATED', 'BUDGET_REJECTED'];

        const isAtVisitPhase = visitStatusList.includes(current);
        const isAtBudgetPhase = budgetStatusList.includes(current);

        if (isAtBudgetPhase) {
          // If in budget phase, don't go back to visits. Only budget and PRODUCTION start (APPROVED).
          const allowed = [...budgetStatusList, 'APPROVED'];
          if (!allowed.includes(s.key)) return false;
        } else if (isAtVisitPhase) {
          // If in visit phase, show visits and BUDGET start (QUOTATION).
          const allowed = [...visitStatusList, 'QUOTATION'];
          if (!allowed.includes(s.key)) return false;
        } else if (current !== 'PENDING') {
          // In advanced production, hide commercial noise.
          const commercial = [...visitStatusList, ...budgetStatusList];
          if (commercial.includes(s.key)) return false;
        }
      }

      return true;
    });
  });

  isPriceReadOnly = computed(() => {
    const order = this.order();
    if (!order) return false;
    const commercialPhases = ['QUOTATION', 'BUDGET_GENERATED', 'BUDGET_REJECTED', 'SITE_VISIT', 'SITE_VISIT_DONE', 'SURVEY_DESIGN', 'DRAFT'];
    return !commercialPhases.includes(order.status);
  });

  ngOnInit() {
    this.resetForm();
    
    // Auto-reset when order input changes (e.g. after item update)
    effect(() => {
      const o = this.order();
      if (o) {
        this.resetForm();
        // Clear any pending loading states when new data arrives
        this.updatingItemIds.set(new Set());
      }
    });
  }

  ngAfterViewInit() {
    this.checkStepperOverflow();
  }

  scrollStepper(direction: 'left' | 'right') {
    this.stopContinuousScroll(); // Clear interval to avoid conflict with smooth scroll
    
    const el = this.stepperViewport?.nativeElement;
    if (!el) return;

    const amount = Math.max(el.clientWidth * 0.7, 240);
    const left = direction === 'left' ? -amount : amount;
    
    console.log('[Stepper Jump]', {
      direction,
      amount,
      clientWidth: el.clientWidth,
      scrollLeft_before: el.scrollLeft,
      scrollWidth: el.scrollWidth
    });

    el.scrollBy({ left, behavior: 'smooth' });

    // Update overflow and reset flag after jump completes
    this.isJumping.set(true);
    setTimeout(() => {
      this.isJumping.set(false);
      this.checkStepperOverflow();
      // Resume scroll if user is still hovering? 
      // Actually, if we stopped it, developer should decide if it auto-resumes.
      // For now, let's keep it clean. Stop on click is safer.
    }, 600);
  }

  startContinuousScroll(direction: 'left' | 'right') {
    if (this.scrollInterval || this.isJumping()) return;
    this.scrollInterval = setInterval(() => {
      const el = this.stepperViewport?.nativeElement;
      if (!el) return;
      el.scrollBy({ left: direction === 'left' ? -5 : 5, behavior: 'auto' });
      this.checkStepperOverflow();
    }, 16);
  }

  stopContinuousScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = undefined;
    }
  }

  checkStepperOverflow() {
    const el = this.stepperViewport?.nativeElement;
    if (!el) return;
    this.canScrollLeft.set(el.scrollLeft > 10);
    this.canScrollRight.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }

  private autoCenterActiveStep() {
    setTimeout(() => {
      const el = this.stepperViewport?.nativeElement;
      if (!el) return;

      const activeBtn = el.querySelector('.bg-primary') as HTMLElement;
      if (activeBtn) {
        const scrollOffset = activeBtn.offsetLeft - (el.clientWidth / 2) + (activeBtn.clientWidth / 2);
        el.scrollTo({ left: scrollOffset, behavior: 'smooth' });
      }
      this.checkStepperOverflow();
    }, 100);
  }

  public resetForm() {
    const order = this.order();
    if (order) {
      this.status.set(order.status);
      this.responsableGeneralId.set(order.responsableGeneral?.id || '');
      this.notes.set(order.notes || '');
      this.isPaymentMode.set(false);
      this.isFailureMode.set(false);
      const total = Number(order.totalPrice || order.total || 0);
      const senia = Number((order as any).totalSenias || (order as any).senia || 0);
      const payments = order.payments?.reduce((s, p) => s + Number(p.amount), 0) || 0;
      const balance = (order as any).saldo !== undefined ? Number((order as any).saldo) : Math.max(0, total - (senia + payments));

      this.paymentAmount.set(balance);
      this.failureReason.set('');

      // Metalurgica technical data sync
      this.totalPrice.set(Number(order.totalPrice || order.total || 0));
      this.senia.set(Number((order as any).totalSenias || (order as any).senia || 0));

      this.visitAddress.set((order?.metadata as any)?.['direccion_obra'] || (order as any)['direccion_obra'] || '');
      this.visitDate.set((order as any)['fecha_visita'] || '');
      this.visitTime.set((order as any)['hora_visita'] || '');
      this.visitObservations.set((order as any)['observaciones_visita'] || '');

      const firstItem = (order.items && order.items.length > 0) ? order.items[0] : null;
      if (firstItem) {
        this.itemName.set(firstItem.nombreProducto || '');
        this.measurements.set((firstItem as any).medidas || '');
        this.tipoTrabajo.set((firstItem as any).tipo_trabajo || '');
      }
    }
  }

  // Lazy load 3D assets only when user enters a production phase
  _onProductionPhase = effect(() => {
    const currentStatus = this.status();
    if (this.is3D() && ['IN_PROGRESS', 'IN_PRODUCTION'].includes(currentStatus)) {
      this.load3DData();
    }
  });

  async load3DData() {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    // Cache guard: prevent redundant API fetches when clicking multiple orders
    if (this.machines().length > 0) return;

    try {
      const resp = await this.maquinasApi.getAll(businessId);
      const mats = await this.materialesApi.getAll(businessId);
      this.machines.set(resp.data || []);
      this.materials.set(mats || []);
    } catch (error) {
      console.error('Error loading 3D data:', error);
    }
  }

  // Reactive sync when input order changes
  _onOrderChange = effect(() => {
    if (this.order() && this.isOpen()) {
      this.resetForm();
      this.autoCenterActiveStep();
    }
  }, { allowSignalWrites: true });

  // Body Scroll Lock & Setup
  _scrollLock = effect(() => {
    if (this.isOpen()) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  });

  @HostListener('document:keydown.escape')
  onKeydownHandler() {
    if (this.isOpen() && !this.isSaving()) {
      this.onClose.emit();
    }
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  async handleSave() {
    const order = this.order();
    if (!order) return;

    this.isSaving.set(true);
    try {
      if (this.isPaymentMode()) {
        await this.api.addPayment(order.id, {
          businessId: order.businessId,
          amount: this.paymentAmount(),
          method: this.paymentMethod()
        });
      } else if (this.isFailureMode()) {
        const targetStatus = this.failureAction() === 'DISCARD' ? 'FAILED' : (this.rubro() === 'IMPRESION_3D' ? 'REPRINT_PENDING' : 'RE_WORK');
        await this.api.reportFailure(order.id, {
          businessId: order.businessId,
          reason: this.failureReason(),
          action: this.failureAction(),
          targetStatus
        });
      } else {
        const selectedEmployee = this.employees().find(e => e.id === this.responsableGeneralId());

        const updateData: any = {
          businessId: order.businessId,
          status: this.status() as OrderStatus,
          responsableGeneralId: this.responsableGeneralId() || null,
          notes: this.notes(),
          totalPrice: Number(this.totalPrice()) || 0,
        };

        if (this.isMetalurgica()) {
          updateData['direccion_obra'] = this.visitAddress() || null;
          updateData['fecha_visita'] = this.visitDate() || null;
          updateData['hora_visita'] = this.visitTime() || null;
          updateData['observaciones_visita'] = this.visitObservations() || null;

          // Sincronización del primer ítem (Metalúrgica suele tener 1 ítem principal)
          if (order.items && order.items.length > 0) {
            updateData.items = order.items.map((it, idx) => {
              const itemAny = it as any;
              if (idx === 0) {
                return {
                  ...it,
                  name: this.itemName() || itemAny.name || it.nombreProducto,
                  price: Number(this.totalPrice()) || itemAny.price || it.precioUnitario,
                  medidas: this.measurements(),
                  tipo_trabajo: this.tipoTrabajo(),
                };
              }
              return it;
            }).map((it: any) => {
              // Limpiar todos los campos que no pertenezcan al DTO CreateOrderItemDto
              const {
                nombreProducto, precioUnitario, cantidad, senia, seDiseñaSTL, status,
                ...cleanIt
              } = it;

              return {
                ...cleanIt,
                name: it.name || nombreProducto,
                price: Number(it.price || precioUnitario) || 0,
                qty: Number(it.qty || cantidad) || 1
              };
            });
          }
        }

        if (this.status() === 'IN_PROGRESS' && this.is3D() && this.selectedMachineId()) {
          const validMaterials = this.multiMaterials().filter(m => m.materialId && m.gramsPerUnit > 0);
          const metadata = validMaterials.length > 0 ? { materials: validMaterials } : undefined;
          const firstMaterialId = validMaterials[0]?.materialId || undefined;

          await this.maquinasApi.assignOrder(
            this.selectedMachineId(),
            order.id,
            undefined, // orderItemId: auto-select on backend
            firstMaterialId,
            order.businessId,
            metadata
          );
        }

        await this.api.update(order.id, updateData);
      }

      // Sync global state
      if (this.is3D()) {
        await this.maquinasService.loadMaquinas(true);
        await this.materialesService.loadMateriales(true);
      }

      this.onSave.emit();
      this.onClose.emit();
    } catch (err) {
      console.error('Error in handleSave:', err);
      alert('Error al procesar la operación.');
    } finally {
      this.isSaving.set(false);
    }
  }

  async deliverOrder() {
    const order = this.order();
    if (!order) return;

    // Financial warning
    if (!this.isFullyPaid()) {
      const confirmDebt = confirm(`Atención: El pedido tiene un saldo pendiente de $${this.balanceVal()}. ¿Deseas entregarlo de todas formas?`);
      if (!confirmDebt) return;
    } else {
      const confirmDelivery = confirm('¿Confirmar la entrega del pedido? Esta acción lo moverá al historial.');
      if (!confirmDelivery) return;
    }

    this.isSaving.set(true);
    try {
      await this.api.update(order.id, { 
        status: 'DELIVERED',
        businessId: order.businessId 
      });
      this.onSave.emit();
      this.onClose.emit();
    } catch (err) {
      console.error('Error delivering order:', err);
      alert('No se pudo marcar el pedido como entregado.');
    } finally {
      this.isSaving.set(false);
    }
  }

  async updateItemStatus(itemId: string, status: string, name: string) {
    const order = this.order();
    if (!order || this.updatingItemIds().has(itemId)) return;

    if (status === 'CANCELLED') {
      const confirmed = confirm(`¿Estás seguro de cancelar el ítem "${name}"?`);
      if (!confirmed) return;
    }

    this.updatingItemIds.update(ids => {
      const newIds = new Set(ids);
      newIds.add(itemId);
      return newIds;
    });

    try {
      const updatedItem = await this.api.updateItemStatus(order.id, itemId, status, order.businessId);
      
      // Emitimo onSave para que el parent refresque la lista (y por ende el input 'order' de este modal)
      // Lo marcamos en el parent, y cuando vuelva el nuevo input 'order' se reseteará el form y se limpiará el loading
      this.onSave.emit();
    } catch (e: any) {
      console.error('Error updating item status:', e);
      alert(e.error?.message || 'Error al actualizar el ítem. Verifica si tiene trabajos activos.');
      // Si falla, sí limpiamos el loading de este ítem
      this.updatingItemIds.update(ids => {
        const newIds = new Set(ids);
        newIds.delete(itemId);
        return newIds;
      });
    }
  }

  getLabel = getStatusLabel;
  getStyles = getStatusStyles;
  cn = cn;
}
