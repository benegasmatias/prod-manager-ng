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
          <p class="text-3xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{{ order.saldo | currency }}</p>
        </div>
        <lucide-icon name="credit-card" size="40" class="text-emerald-200 dark:text-emerald-900"></lucide-icon>
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

  methods = [
    { key: 'CASH', label: 'EFECTIVO' },
    { key: 'TRANSFER', label: 'TRANSFERENCIA' },
    { key: 'DEBIT', label: 'DÉBITO' },
    { key: 'CREDIT', label: 'CRÉDITO' }
  ];

  onAmountChange(val: number) {
    this.amount.set(val);
  }

  onMethodChange(method: string) {
    this.selectedMethod.set(method);
  }

  cn = cn;
}
