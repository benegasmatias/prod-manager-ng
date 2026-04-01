import {
  Component, computed, inject, signal, input, Output,
  EventEmitter, OnInit, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, X, Gauge, Cpu, User, Calendar, CreditCard,
  DollarSign, AlertOctagon, Layers, CheckCircle2, MessageSquare,
  RefreshCw, ChevronDown, ChevronLeft
} from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui';
import { Pedido, Employee, OrderStatus } from '@shared/models/pedido';
import { PedidosApiService } from '@core/api/pedidos.api.service';
import { MaquinasApiService } from '@core/api/maquinas.api.service';
import { MaterialesApiService } from '@core/api/materiales.api.service';
import { SessionService } from '@core/session/session.service';
import { getNegocioConfig, getStatusLabel, getStatusStyles } from '@shared/utils/negocio-utils';
import { cn } from '@shared/utils/cn';
import { AppDatePickerComponent } from '@shared/ui/app-date-picker/app-date-picker.component';
import { Machine, Material } from '@shared/models';

// Sections
import { PaymentModuleComponent } from './sections/payment-module.component';
import { FailureModuleComponent } from './sections/failure-module.component';
import { MetalurgicaSectionComponent } from './sections/metalurgica-section.component';
import { Impresion3dSectionComponent, MultiMaterial } from './sections/impresion-3d-section.component';

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
    MetalurgicaSectionComponent,
    Impresion3dSectionComponent,
    AppDatePickerComponent
  ],
  templateUrl: './status-modal.component.html',
  styleUrls: ['./status-modal.component.css']
})
export class OrderStatusModalComponent implements OnInit {
  private api = inject(PedidosApiService);
  private maquinasApi = inject(MaquinasApiService);
  private materialesApi = inject(MaterialesApiService);
  private session = inject(SessionService);

  order = input<Pedido | null>(null);
  isOpen = input<boolean>(false);
  employees = input<Employee[]>([]);
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  // UI State
  status = signal<string>('');
  responsableId = signal<string>('');
  notes = signal<string>('');
  isSaving = signal(false);

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

  // Icons for Template (Senior standard: [img] syntax)
  icons = {
    Gauge, AlertOctagon, DollarSign, X, Layers, CheckCircle2,
    User, Calendar, MessageSquare, RefreshCw, ChevronDown, ChevronLeft, Cpu
  };

  // Derived Values
  rubro = computed(() => this.session.activeNegocio()?.rubro || 'GENERICO');
  isMetalurgica = computed(() => this.rubro() === 'METALURGICA');

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
  }

  public resetForm() {
    const order = this.order();
    if (order) {
      this.status.set(order.status);
      this.responsableId.set(order.responsableGeneral?.id || '');
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

      if (this.is3D()) {
        this.load3DData();
      }
    }
  }

  async load3DData() {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

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
    }
  }, { allowSignalWrites: true });

  async handleSave() {
    const order = this.order();
    if (!order) return;

    this.isSaving.set(true);
    try {
      if (this.isPaymentMode()) {
        await this.api.addPayment(order.id, {
          amount: this.paymentAmount(),
          method: this.paymentMethod()
        });
      } else if (this.isFailureMode()) {
        const targetStatus = this.failureAction() === 'DISCARD' ? 'FAILED' : (this.rubro() === 'IMPRESION_3D' ? 'REPRINT_PENDING' : 'RE_WORK');
        await this.api.reportFailure(order.id, {
          reason: this.failureReason(),
          action: this.failureAction(),
          targetStatus
        });
      } else {
        const selectedEmployee = this.employees().find(e => e.id === this.responsableId());

        const updateData: any = {
          status: this.status() as OrderStatus,
          responsableGeneralId: this.responsableId() || null,
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
            firstMaterialId,
            order.negocioId,
            metadata
          );
        }

        await this.api.update(order.id, updateData);
      }

      this.onSave.emit();
      this.onClose.emit();
    } catch (e) {
      console.error('Error saving order status:', e);
    } finally {
      this.isSaving.set(false);
    }
  }

  getLabel = getStatusLabel;
  getStyles = getStatusStyles;
  cn = cn;
}
