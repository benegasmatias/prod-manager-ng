import { Component, Input, Output, EventEmitter, inject, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Pedido, Employee } from '@shared/models';
import { LucideAngularModule, ArrowLeft, User, Calendar, DollarSign, Edit3, Zap, Phone, Mail, Info, Trash2 } from 'lucide-angular';
import { getStatusLabel, getStatusStyles } from '@shared/utils';
import { OrderStatusModalComponent } from '../../status-modal/status-modal.component';
import { OrderTimelineComponent } from './order-timeline.component';
import { OrderFinancialWidgetComponent } from './order-financial-widget.component';
import { OrderItemsWidgetComponent } from './order-items-widget.component';
import { OrderProgressStepperComponent } from './order-progress-stepper.component';
import { SessionService } from '@core/session/session.service';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, LucideAngularModule, 
    OrderStatusModalComponent, OrderTimelineComponent, OrderFinancialWidgetComponent,
    OrderItemsWidgetComponent, OrderProgressStepperComponent
  ],
  template: `
    <div class="space-y-12 animate-in fade-in duration-1000">
      
      <!-- EDITORIAL CONTEXTUAL HEADER -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-10 pt-4 border-b border-border/5 pb-12">
        <div class="flex items-start gap-8">
          <a routerLink="/pedidos" class="hidden md:flex h-14 w-14 rounded-2xl bg-surface-container-lowest border border-border/5 shadow-sm hover:bg-surface transition-all active:scale-95 items-center justify-center text-text-muted hover:text-text group">
            <lucide-angular [img]="icons.ArrowLeft" class="h-6 w-6 transition-transform group-hover:-translate-x-1"></lucide-angular>
          </a>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
              <span class="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Expediente de Pedido</span>
            </div>
            <h1 class="text-4xl md:text-6xl font-black tracking-tighter text-text uppercase leading-none font-display">
              Orden <span class="text-primary italic">#{{ pedido()?.code }}</span>
            </h1>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-4">
          <button (click)="onDelete.emit()" class="h-14 w-14 rounded-2xl bg-danger-container/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center justify-center group shadow-2xl shadow-danger/5" title="Eliminar Registro">
            <lucide-angular [img]="icons.Trash2" class="h-5 w-5"></lucide-angular>
          </button>

          <button (click)="onEdit.emit()" class="h-14 px-8 rounded-2xl bg-surface-container-lowest text-[10px] font-black uppercase tracking-[0.3em] hover:bg-surface transition-all flex items-center gap-4 shadow-2xl shadow-text/5 border border-border/5 active:scale-95 italic">
            <lucide-angular [img]="icons.Edit3" class="h-4 w-4"></lucide-angular>
            <span>Editar</span>
          </button>

          <button (click)="openManage('STATUS')" class="h-14 px-10 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_30px_60px_-15px_rgba(var(--primary-rgb),0.4)] hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-4 italic">
            <lucide-angular [img]="icons.Zap" class="h-4 w-4"></lucide-angular>
            <span>Gestión de Pedido</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div class="lg:col-span-3">
          <app-order-progress-stepper [status]="pedido()!.status" [age]="age()" [dueDate]="pedido()!.dueDate | date:'dd / MM / yyyy':'UTC'"></app-order-progress-stepper>
        </div>

        <div class="bg-text rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-between group shadow-[0_40px_80px_-20px_rgba(var(--text-rgb),0.3)]">
          <div class="absolute -top-10 -right-10 h-32 w-32 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div class="space-y-2 relative z-10">
            <p class="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 italic">Curador Responsable</p>
            <h4 class="text-2xl font-black leading-tight tracking-tight uppercase italic">{{ pedido()!.responsableGeneral?.firstName || 'Sin' }} {{ pedido()!.responsableGeneral?.lastName || 'Asignar' }}</h4>
          </div>
          <div class="flex items-center gap-4 relative z-10">
            <div class="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/60">
              <lucide-angular [img]="icons.Calendar" class="h-5 w-5"></lucide-angular>
            </div>
            <div>
              <p class="text-[8px] font-black uppercase tracking-[0.4em] text-white/30 leading-none mb-1 italic">Promesa Operativa</p>
              <p class="text-xs font-black uppercase tracking-widest">{{ pedido()!.dueDate | date:'EEEE, dd MMM':'UTC' }}</p>
            </div>
          </div>
        </div>
      </div>

      <app-order-financial-widget 
        [totalPrice]="Number(pedido()!.totalPrice || 0)" 
        [totalPaid]="totalPaid()" 
        [saldo]="balance()" 
        [hasPendingPayment]="hasPendingPayment()" 
        [payments]="pedido()!.payments || []"
        (pay)="openManage('PAYMENT')"
        (revert)="onRevertPayment.emit($event)">
      </app-order-financial-widget>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <app-order-items-widget [items]="pedido()!.items || []"></app-order-items-widget>
          <app-order-timeline [history]="pedido()!.statusHistory || []"></app-order-timeline>
        </div>

        <div class="space-y-8 text-center sm:text-left">
          <div class="bg-surface-container-lowest rounded-[3rem] border border-border/5 p-10 shadow-2xl shadow-text/5 space-y-10 relative overflow-hidden group">
            <div class="absolute -top-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div class="flex flex-col items-center text-center space-y-6 relative z-10">
              <div class="h-28 w-28 rounded-[3rem] bg-surface-container-low p-3 shadow-inner">
                <div class="h-full w-full rounded-[2.5rem] bg-surface-container-lowest flex items-center justify-center text-primary shadow-2xl shadow-text/5 group-hover:scale-105 transition-transform duration-700">
                  <lucide-angular [img]="icons.User" class="h-12 w-12"></lucide-angular>
                </div>
              </div>
              <div class="space-y-3 px-4">
                <h2 class="text-3xl font-black text-text tracking-tighter uppercase italic leading-none truncate w-full">{{ pedido()!.clientName || 'Consumidor Final' }}</h2>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <span class="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted/40 italic px-4 py-1 bg-surface-container-low rounded-full">ID: {{ pedido()!.clienteId}}</span>
                  <div class="flex items-center gap-2">
                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span class="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 italic whitespace-nowrap">Vínculo Activo</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-6 pt-10 border-t border-border/5 relative z-10">
              <div class="flex items-center gap-6 group/info justify-center sm:justify-start px-2">
                <div class="h-14 w-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-text-muted/20 group-hover/info:text-primary group-hover/info:bg-primary/5 transition-all duration-700 shrink-0">
                  <lucide-angular [img]="icons.Phone" class="h-5 w-5"></lucide-angular>
                </div>
                <div class="space-y-1 min-w-0">
                  <p class="text-[8px] font-black uppercase text-text-muted/40 tracking-[0.4em] leading-none italic">Línea de Contacto</p>
                  <p class="text-sm font-black text-text tracking-widest truncate">{{ pedido()!.clientPhone || 'NO REGISTRADO' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-order-status-modal [order]="pedido()!" [isOpen]="isManageModalOpen()" [employees]="employees()" (onClose)="isManageModalOpen.set(false)" (onSave)="onSaved.emit()"></app-order-status-modal>
  `
})
export class ClientDetailComponent {
  pedido = input.required<Pedido | null>();
  age = input<string | null>(null);
  totalPaid = input(0);
  balance = input(0);
  hasPendingPayment = input(false);
  employees = input<Employee[]>([]);
  
  @Output() onSaved = new EventEmitter<void>();
  @Output() onDownload = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onRevertPayment = new EventEmitter<string>();

  isManageModalOpen = signal(false);

  icons = {
    ArrowLeft, User, Calendar, DollarSign, Edit3, Zap, Phone, Mail, Info, Trash2
  };

  openManage(mode: 'STATUS' | 'PAYMENT' = 'STATUS') {
    this.isManageModalOpen.set(true);
  }

  getStatusLabel = getStatusLabel;
  getStatusStyles = getStatusStyles;
  Number = Number;

  cn(...args: any[]) {
    return args.filter(Boolean).join(' ');
  }
}
