import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, CreditCard } from 'lucide-angular';
import { Pedido } from '@shared/models/pedido';
import { cn } from '@shared/utils/cn';
import { MoneyInputComponent } from '@shared/ui/money-input/money-input.component';

@Component({
  selector: 'app-payment-module',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, MoneyInputComponent],
  template: `
    <div class="space-y-6 animate-in slide-in-from-right duration-500">
      <div class="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 flex justify-between items-center">
        <div>
          <span class="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Saldo Pendiente</span>
          <p class="text-3xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{{ getBalance() | currency }}</p>
        </div>
        <lucide-angular [img]="CreditCard" class="h-10 w-10 text-emerald-200 dark:text-emerald-900"></lucide-angular>
      </div>

      <app-money-input
        label="Monto a Cobrar"
        [value]="amount()"
        (valueChange)="onAmountChange($event)"
        color="emerald"
        placeholder="0,00"
        className="w-full"
        inputClassName="h-16 text-2xl"
      ></app-money-input>

      <div class="space-y-4">
          <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Método de Pago</label>
          <div class="grid grid-cols-2 gap-3">
            @for (method of methods; track method.key) {
              <button 
                (click)="onMethodChange(method.key)"
                [class]="cn('h-14 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center leading-none', 
                  selectedMethod() === method.key ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-200')">
                <span>{{ method.label }}</span>
              </button>
            }
          </div>
      </div>
    </div>
  `
})
export class PaymentModuleComponent {
  @Input({ required: true }) order!: Pedido;
  @Input({ required: true }) amount = signal<number>(0);
  @Input({ required: true }) selectedMethod = signal<string>('CASH');
  public CreditCard = CreditCard;

  methods = [
    { key: 'CASH', label: 'EFECTIVO' },
    { key: 'TRANSFER', label: 'TRANSFERENCIA' },
    { key: 'DEBIT', label: 'DÉBITO' },
    { key: 'CREDIT', label: 'CRÉDITO' }
  ];

  getBalance() {
    if ((this.order as any).saldo !== undefined) return Number((this.order as any).saldo);
    
    // Si no, calculamos: Total - Pagado
    const total = Number(this.order.totalPrice || this.order.total || 0);
    return Math.max(0, total - this.getTotalPaid());
  }

  private getTotalPaid() {
    const senias = Number((this.order as any).totalSenias || (this.order as any).senia || 0);
    const payments = this.order.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    return senias + payments;
  }

  onAmountChange(val: number) {
    this.amount.set(val);
  }

  onMethodChange(method: string) {
    this.selectedMethod.set(method);
  }

  cn = cn;
}
