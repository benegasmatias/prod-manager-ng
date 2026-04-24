import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { PedidosApiService } from '../../../core/api/pedidos.api.service';
import { Pedido, Employee } from '@shared/models';
import { 
  LucideAngularModule, ArrowLeft, Package, User, Calendar, Clock, 
  DollarSign, CheckCircle, Info, Tag, History, MessageSquare, 
  ChevronRight, Edit3, AlertCircle, TrendingUp, Mail, Phone, Zap, Trash2
} from 'lucide-angular';
import { getStatusLabel, getStatusStyles } from '@shared/utils';
import { ClientDetailComponent } from './components/client-detail.component';
import { StockDetailComponent } from '../../stock/components/stock-detail/stock-detail.component';
import { SessionService } from '@core/session/session.service';
import { ConfirmService } from '@shared/ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [
    CommonModule, RouterLink, LucideAngularModule, 
    ClientDetailComponent, StockDetailComponent
  ],
  template: `
    <div class="min-h-screen bg-background p-6 md:p-10 animate-in fade-in duration-1000">
      
      @if (loading() || isDeleting()) {
        <div class="flex flex-col items-center justify-center py-40 space-y-6">
          <div class="h-16 w-16 rounded-[2rem] border-4 border-primary/20 border-t-primary animate-spin shadow-xl"></div>
          <div class="text-center">
            <p class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">{{ isDeleting() ? 'Eliminando Pedido' : 'Levantando Expediente' }}</p>
            <p class="text-xs font-bold text-zinc-300 mt-2 italic">{{ isDeleting() ? 'Borrando registros permanentemente...' : 'Procesando metadatos y activos...' }}</p>
          </div>
        </div>
      } @else if (pedido()) {
        
        <!-- Orchestrator: CLIENT vs STOCK -->
        @if (pedido()?.type === 'STOCK') {
          <app-stock-detail 
            [pedido]="pedido()" 
            (onSaved)="loadData()"
            (onEdit)="handleEdit()"
            (onDelete)="handleDelete()">
          </app-stock-detail>
        } @else {
          <app-client-detail 
            [pedido]="pedido()" 
            [age]="tiempoTranscurrido()"
            [totalPaid]="totalPagado()"
            [balance]="saldoPendiente()"
            [hasPendingPayment]="hasPendingPayment()"
            [employees]="employees()"
            (onSaved)="loadData()"
            (onEdit)="handleEdit()"
            (onDelete)="handleDelete()">
          </app-client-detail>
        }

      } @else {
        <!-- Error State -->
        <div class="flex flex-col items-center justify-center py-40 text-center space-y-10">
          <div class="h-32 w-32 rounded-[3.5rem] bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500">
            <lucide-angular [img]="icons.AlertCircle" class="h-14 w-14"></lucide-angular>
          </div>
          <div class="max-w-md space-y-4">
            <h2 class="text-3xl font-black text-zinc-900 dark:text-zinc-50 uppercase">Orden No Encontrada</h2>
            <p class="text-zinc-400 text-sm italic leading-relaxed">La referencia que intentas consultar no existe o ha sido archivada.</p>
          </div>
          <button routerLink="/pedidos" class="h-14 px-12 rounded-3xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
            Retornar a Operaciones
          </button>
        </div>
      }
    </div>
  `,
  styleUrls: ['./pedido-detalle.component.css']
})
export class PedidoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PedidosApiService);
  private session = inject(SessionService);
  private confirm = inject(ConfirmService);
  
  pedido = signal<Pedido | null>(null);
  loading = signal(true);
  isDeleting = signal(false);
  isManageModalOpen = signal(false);
  employees = signal<Employee[]>([]);

  // Icons for Template
  icons = {
    ArrowLeft, Package, User, Calendar, Clock, DollarSign, 
    CheckCircle, Info, Tag, History, MessageSquare, ChevronRight, 
    Edit3, AlertCircle, TrendingUp, Mail, Phone, Zap, Trash2
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
      
      // Phase 6.1: Map Jobs to Items for easy display
      if (res && res.items && res.jobs) {
        res.items = res.items.map(item => ({
          ...item,
          job: res.jobs?.find(j => j.orderItemId === item.id)
        }));
      }

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

  async handleDelete() {
    const p = this.pedido();
    if (!p) return;

    const ok = await this.confirm.confirm({
      title: 'Eliminar Pedido',
      message: `¿Estás seguro de que deseas eliminar permanentemente el pedido #${p.code}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar Ahora',
      cancelLabel: 'Cancelar',
      type: 'danger'
    });

    if (ok) {
      try {
        this.isDeleting.set(true);
        await this.api.delete(p.id, p.businessId);
        this.router.navigate(['/pedidos']);
      } catch (error) {
        this.isDeleting.set(false);
        console.error('Error deleting order:', error);
        alert('No se pudo eliminar el pedido. Verifique su conexión o permisos.');
      }
    }
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
