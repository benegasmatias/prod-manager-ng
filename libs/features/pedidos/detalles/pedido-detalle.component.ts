import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { PedidosApiService } from '../../../core/api/pedidos.api.service';
import { Pedido, Employee } from '@shared/models';
import { 
  LucideAngularModule, ArrowLeft, Package, User, Calendar, Clock, 
  DollarSign, CheckCircle, Info, Tag, History, MessageSquare, 
  ChevronRight, Edit3, AlertCircle, TrendingUp, Mail, Phone, Zap
} from 'lucide-angular';
import { getStatusLabel, getStatusStyles } from '@shared/utils';
import { OrderStatusModalComponent } from '../status-modal/status-modal.component';
import { SessionService } from '@core/session/session.service';
import { OrderTimelineComponent } from './components/order-timeline.component';
import { OrderFinancialWidgetComponent } from './components/order-financial-widget.component';
import { OrderItemsWidgetComponent } from './components/order-items-widget.component';
import { OrderFilesWidgetComponent } from './components/order-files-widget.component';
import { OrderProgressStepperComponent } from './components/order-progress-stepper.component';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [
    CommonModule, RouterLink, LucideAngularModule, 
    OrderStatusModalComponent, OrderTimelineComponent, OrderFinancialWidgetComponent,
    OrderItemsWidgetComponent, OrderFilesWidgetComponent, OrderProgressStepperComponent
  ],
  templateUrl: './pedido-detalle.component.html',
  styleUrls: ['./pedido-detalle.component.css']
})
export class PedidoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PedidosApiService);
  private session = inject(SessionService);
  
  pedido = signal<Pedido | null>(null);
  loading = signal(true);
  isManageModalOpen = signal(false);
  employees = signal<Employee[]>([]);

  // Icons for Template
  icons = {
    ArrowLeft, Package, User, Calendar, Clock, DollarSign, 
    CheckCircle, Info, Tag, History, MessageSquare, ChevronRight, 
    Edit3, AlertCircle, TrendingUp, Mail, Phone, Zap
  };

  // Computeds for Operative Intelligence
  saldoPendiente = computed(() => {
    const p = this.pedido();
    if (!p) return 0;
    const total = Number(p.totalPrice || 0);
    return Math.max(0, total - this.totalPagado());
  });

  hasPendingPayment = computed(() => this.saldoPendiente() > 0);

  totalPagado = computed(() => {
    const p = this.pedido();
    if (!p) return 0;
    const senias = Number(p.totalSenias || 0);
    const paymentsSummary = Number(p.totalPayments || 0);
    const paymentsArraySum = (p.payments || []).reduce((acc: number, pay: any) => acc + Number(pay.amount || 0), 0);
    const paidField = Number(p.paid || 0);
    return senias + paymentsSummary + paymentsArraySum + paidField;
  });

  progresoProduccion = computed(() => {
    const p = this.pedido();
    if (!p) return 0;
    // Lógica básica de progreso según estado
    const stages: Record<string, number> = {
      'PENDING': 5,
      'APPROVED': 15,
      'DESIGN': 30,
      'IN_PRODUCTION': 50,
      'POST_PROCESS': 80,
      'READY_FOR_DELIVERY': 95,
      'DELIVERED': 100,
      'DONE': 100
    };
    return stages[p.status] || 10;
  });

  tiempoTranscurrido = computed(() => {
    const p = this.pedido();
    if (!p || !p.fechaCreacion) return null;
    
    const start = new Date(p.fechaCreacion).getTime();
    if (isNaN(start)) return null;

    const end = (p.status === 'DELIVERED' && p.fechaActualizacion) 
      ? new Date(p.fechaActualizacion).getTime() 
      : Date.now();
    
    if (isNaN(end)) return null;

    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Justo ahora';
    if (diffDays === 0) return 'Hoy';
    return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  });

  // Business Rules
  is3D = computed(() => this.session.activeNegocio()?.rubro === 'IMPRESION_3D');
  isMetalurgica = computed(() => this.session.activeNegocio()?.rubro === 'METALURGICA');

  Number = Number;

  async ngOnInit() {
    await this.loadData();
    this.loadEmployees();
  }

  async loadData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    try {
      this.loading.set(true);
      const res = await this.api.findOne(id);
      this.pedido.set(res);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadEmployees() {
    const bId = this.session.activeNegocio()?.id;
    if (!bId) return;
    try {
      const emps = await this.api.getEmployees(bId);
      this.employees.set(emps);
    } catch (err) { console.error('Error emps:', err); }
  }

  openManage(mode: 'STATUS' | 'PAYMENT' = 'STATUS') {
    // Aquí podríamos disparar el modal con el modo específico si lo soportara
    // Por ahora el modal tiene lógica interna para cobrar
    this.isManageModalOpen.set(true);
  }

  handleEdit() {
    const p = this.pedido();
    if (!p) return;
    this.router.navigate(['/pedidos/editar', p.id]);
  }

  downloadFile(url?: string) {
    if (!url) return;
    window.open(url, '_blank');
  }

  getStatusLabel = getStatusLabel;
  getStatusStyles = getStatusStyles;

  cn(...args: any[]) {
    return args.filter(Boolean).join(' ');
  }
}
