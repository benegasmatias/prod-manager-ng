import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, CreditCard, DollarSign, Building2, Smartphone, Cpu, Trash2 } from 'lucide-angular';
import { Pedido } from '@shared/models/pedido';
import { cn } from '@shared/utils/cn';
import { MoneyInputComponent } from '@shared/ui/money-input/money-input.component';

@Component({
  selector: 'app-payment-module',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, MoneyInputComponent],
  template: `
    <div class="space-y-6 animate-in slide-in-from-right duration-500">
      <!-- Balance Display -->
      <div class="relative overflow-hidden p-6 rounded-[1.5rem] bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 group">
        <!-- Decoration -->
        <div class="absolute top-[-10px] right-[-10px] opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000 text-white">
           <lucide-angular [img]="icons.Cpu" class="h-32 w-32"></lucide-angular>
        </div>
        
        <div class="relative z-10 flex flex-col items-center justify-center text-center space-y-1">
          <span class="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 italic">Saldo Pendiente de Cobro</span>
          <p class="text-3xl sm:text-4xl font-black tabular-nums tracking-tighter">
            $ {{ getBalance() }}
          </p>
        </div>
      </div>

      <div class="space-y-3">
        <label class="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted/40 ml-4 italic">Monto a Registrar</label>
        <div class="relative">
          <app-money-input
            [value]="amount()"
            (valueChange)="onAmountChange($event)"
            color="emerald"
            placeholder="0,00"
            className="w-full"
            inputClassName="h-14 text-2xl font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-zinc-950/40 border-none rounded-2xl shadow-xl shadow-text/5"
          ></app-money-input>
          <button (click)="amount.set(getBalance())" class="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 italic">
            Total
          </button>
        </div>
      </div>

      <div class="space-y-3">
          <label class="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted/40 ml-4 italic">Arquitectura de Pago</label>
          <div class="grid grid-cols-2 gap-3">
            @for (method of methods; track method.key) {
              <button 
                (click)="onMethodChange(method.key)"
                [class]="cn('h-16 rounded-[1.2rem] border transition-all flex items-center gap-4 px-5 relative overflow-hidden group', 
                  selectedMethod() === method.key ? 'border-emerald-500 bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-surface-container-low border-border/5 text-text-muted hover:border-emerald-500/20')">
                
                <div [class]="cn('h-10 w-10 rounded-xl flex items-center justify-center transition-all', 
                  selectedMethod() === method.key ? 'bg-white/20 text-white' : 'bg-surface-container-lowest text-text-muted/30 group-hover:bg-zinc-100')">
                  <lucide-angular [img]="method.icon" class="h-5 w-5"></lucide-angular>
                </div>
                
                <span class="text-[9px] font-black uppercase tracking-widest truncate italic">{{ method.label }}</span>
              </button>
            }
          </div>
      </div>

      <!-- Payment History -->
      @if (order.payments && order.payments.length > 0) {
        <div class="space-y-4 pt-6 mt-6 border-t border-border/5">
          <label class="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted/40 ml-4 italic">Historial de Cobros</label>
          <div class="space-y-3">
            @for (p of order.payments; track p.id) {
              <div class="flex items-center justify-between p-5 rounded-[1.5rem] bg-surface-container-low/50 border border-border/5 group/pay animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div class="flex items-center gap-5">
                  <div class="h-10 w-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-text-muted/30">
                    <lucide-angular [img]="getMethodIcon(p.method)" class="h-5 w-5"></lucide-angular>
                  </div>
                  <div class="flex flex-col">
                    <p class="text-sm font-black text-text tracking-tighter tabular-nums">$ {{ p.amount | number:'1.0-0' }}</p>
                    <p class="text-[7px] font-black uppercase tracking-[0.2em] text-text-muted/40 italic">
                      {{ p.paidAt | date:'dd MMM, HH:mm' }} • {{ p.method }}
                    </p>
                  </div>
                </div>
                
                <button (click)="removePayment.emit(p.id)" 
                   class="h-10 w-10 rounded-xl flex items-center justify-center text-error bg-error/5 hover:bg-error hover:text-white transition-all shadow-xl shadow-error/10 border border-error/10 active:scale-95 group/del">
                   <lucide-angular [img]="icons.Trash2" class="h-4 w-4 group-hover/del:rotate-12 transition-transform"></lucide-angular>
                 </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class PaymentModuleComponent {
  @Input({ required: true }) order!: Pedido;
  @Input({ required: true }) amount = signal<number>(0);
  @Input({ required: true }) selectedMethod = signal<string>('CASH');
  @Output() removePayment = new EventEmitter<string>();

  icons = { Cpu, Smartphone, Building2, CreditCard, DollarSign, Trash2 };

  methods = [
    { key: 'CASH', label: 'EFECTIVO', icon: DollarSign },
    { key: 'TRANSFER', label: 'TRANSFERENCIA', icon: Building2 },
    { key: 'MP', label: 'MERCADOPAGO', icon: Smartphone },
    { key: 'CARD', label: 'TARJETA', icon: CreditCard }
  ];

  getMethodIcon(key: string) {
    return this.methods.find(m => m.key === key)?.icon || DollarSign;
  }

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
    this.amount.set(Math.max(0, val || 0));
  }

  onMethodChange(method: string) {
    this.selectedMethod.set(method);
  }

  cn = cn;
}
