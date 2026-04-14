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
import { OrderFilesWidgetComponent } from './order-files-widget.component';
import { OrderProgressStepperComponent } from './order-progress-stepper.component';
import { SessionService } from '@core/session/session.service';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, LucideAngularModule, 
    OrderStatusModalComponent, OrderTimelineComponent, OrderFinancialWidgetComponent,
    OrderItemsWidgetComponent, OrderFilesWidgetComponent, OrderProgressStepperComponent
  ],
  template: `
    <div class="space-y-8 animate-in fade-in duration-500">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-4">
          <a routerLink="/pedidos" class="flex items-center gap-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors group">
            <lucide-angular [img]="icons.ArrowLeft" class="h-4 w-4 transition-transform group-hover:-translate-x-1"></lucide-angular>
            <span class="text-xs font-black uppercase tracking-widest">Listado de Pedidos</span>
          </a>

          <div class="flex flex-wrap items-center gap-4">
            <h1 class="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 flex items-center gap-4">
              Orden <span class="text-primary">#{{ pedido()?.code }}</span>
            </h1>
            <div class="flex gap-2">
              <span [class]="cn('px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm', getStatusStyles(pedido()?.status || ''))">
                {{ getStatusLabel(pedido()?.status || '') }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="onDelete.emit()" class="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center group" title="Eliminar Pedido">
            <lucide-angular [img]="icons.Trash2" class="h-4 w-4"></lucide-angular>
          </button>

          <button (click)="onEdit.emit()" class="h-12 px-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest hover:border-primary/20 transition-all flex items-center gap-3">
            <lucide-angular [img]="icons.Edit3" class="h-4 w-4"></lucide-angular>
            <span>Editar</span>
          </button>

          @if (hasPendingPayment()) {
          <button (click)="openManage('PAYMENT')" class="h-12 px-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-3">
            <lucide-angular [img]="icons.DollarSign" class="h-4 w-4"></lucide-angular>
            <span>Registrar Pago</span>
          </button>
          }

          <button (click)="openManage('STATUS')" class="h-12 px-8 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
            <lucide-angular [img]="icons.Zap" class="h-4 w-4"></lucide-angular>
            <span>Gestionar Producción</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3">
          <app-order-progress-stepper [status]="pedido()!.status" [age]="age()" [dueDate]="pedido()!.dueDate | date:'dd / MM / yyyy'"></app-order-progress-stepper>
        </div>

        <div class="bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between group">
          <div class="absolute -top-10 -right-10 h-32 w-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <div class="space-y-1 relative z-10">
            <p class="text-[10px] font-black uppercase tracking-widest text-white/30">Operador a Cargo</p>
            <h4 class="text-xl font-black leading-tight">{{ pedido()!.responsableGeneral?.firstName || 'Sin' }} {{ pedido()!.responsableGeneral?.lastName || 'Asignar' }}</h4>
          </div>
          <div class="flex items-center gap-3 relative z-10">
            <div class="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-white/60">
              <lucide-angular [img]="icons.Calendar" class="h-5 w-5"></lucide-angular>
            </div>
            <div>
              <p class="text-[8px] font-black uppercase tracking-widest text-white/40 leading-none">Prometido para el</p>
              <p class="text-xs font-black">{{ pedido()!.dueDate | date:'EEEE, dd MMM' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <app-order-items-widget [items]="pedido()!.items || []"></app-order-items-widget>
          <app-order-files-widget [items]="pedido()!.items || []" (downloadStatus)="onDownload.emit($event)"></app-order-files-widget>
          <app-order-timeline [history]="pedido()!.statusHistory || []"></app-order-timeline>
        </div>

        <div class="space-y-8">
          <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 shadow-sm space-y-8">
            <div class="flex flex-col items-center text-center space-y-4">
              <div class="h-24 w-24 rounded-[3rem] bg-primary/5 p-2 ring-1 ring-primary/20">
                <div class="h-full w-full rounded-[2.5rem] bg-white flex items-center justify-center text-primary shadow-lg">
                  <lucide-angular [img]="icons.User" class="h-10 w-10"></lucide-angular>
                </div>
              </div>
              <div class="space-y-1">
                <h2 class="text-2xl font-black text-zinc-900 dark:text-white">{{ pedido()!.clientName || 'Consumidor Final' }}</h2>
                <div class="flex items-center justify-center gap-2">
                  <span class="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-3 py-1 bg-zinc-50 rounded-lg">ID Cliente: {{ pedido()!.clienteId}}</span>
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span class="text-[9px] font-black uppercase tracking-widest text-emerald-600">Cliente Recurrente</span>
                </div>
              </div>
            </div>
            <div class="space-y-4 pt-8 border-t border-zinc-50 dark:border-zinc-800">
              <div class="flex items-center gap-4 text-left group">
                <div class="h-10 w-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-all">
                  <lucide-angular [img]="icons.Phone" class="h-5 w-5"></lucide-angular>
                </div>
                <div>
                  <p class="text-[8px] font-black uppercase text-zinc-400 tracking-widest leading-none">Teléfono</p>
                  <p class="text-sm font-black text-zinc-700 dark:text-zinc-300">{{ pedido()!.clientPhone || 'No registrado' }}</p>
                </div>
              </div>
            </div>
          </div>
          <app-order-financial-widget [totalPrice]="Number(pedido()!.totalPrice || 0)" [totalPaid]="totalPaid()" [saldo]="balance()" [hasPendingPayment]="hasPendingPayment()" (pay)="openManage('PAYMENT')"></app-order-financial-widget>
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
