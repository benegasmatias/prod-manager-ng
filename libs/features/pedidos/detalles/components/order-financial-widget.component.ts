import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Wallet, CheckCircle, AlertCircle, DollarSign } from 'lucide-angular';

@Component({
  selector: 'app-order-financial-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-text rounded-[3rem] p-10 text-white shadow-[0_40px_80px_-20px_rgba(var(--text-rgb),0.3)] relative overflow-hidden group h-full">
      <div class="absolute -top-10 -right-10 p-8 opacity-5 rotate-12 group-hover:rotate-0 transition-all duration-1000 group-hover:scale-150">
        <lucide-angular [img]="icons.Wallet" class="h-40 w-40"></lucide-angular>
      </div>

      <div class="relative z-10 space-y-12">
        <div class="space-y-3">
          <span class="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 italic">Presupuesto Consolidado</span>
          <p class="text-6xl font-black tabular-nums tracking-tighter leading-none">$ {{ totalPrice() | number:'1.0-0' }}</p>
        </div>

        <div class="space-y-6 pt-12 border-t border-white/5">
          <div class="flex items-center justify-between p-6 rounded-[2.5rem] bg-white/5 backdrop-blur-3xl hover:bg-white/10 transition-all duration-700 group/row">
            <div>
              <p class="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-2 italic">Flujo Confirmado</p>
              <p class="text-2xl font-black tabular-nums text-white tracking-tighter">$ {{ totalPaid() | number:'1.0-0' }}</p>
            </div>
            <lucide-angular [img]="icons.CheckCircle" class="h-6 w-6 text-emerald-500/20 group-hover/row:scale-110 transition-transform"></lucide-angular>
          </div>

          <div class="flex items-center justify-between p-6 rounded-[2.5rem] bg-danger-container/10 backdrop-blur-3xl hover:bg-danger-container/20 transition-all duration-700 group/row">
            <div>
              <p class="text-[8px] font-black uppercase tracking-[0.4em] text-danger mb-2 italic">Saldo a Liquidar</p>
              <p class="text-2xl font-black tabular-nums text-danger tracking-tighter">$ {{ saldo() | number:'1.0-0' }}</p>
            </div>
            <lucide-angular [img]="icons.AlertCircle" class="h-6 w-6 text-danger/20 group-hover/row:scale-110 transition-transform"></lucide-angular>
          </div>

          @if (hasPendingPayment()) {
            <button (click)="pay.emit()" class="w-full h-20 rounded-[2.5rem] bg-white text-text text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 italic">
              <lucide-angular [img]="icons.DollarSign" class="h-5 w-5"></lucide-angular>
              Registrar Cobro
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class OrderFinancialWidgetComponent {
  totalPrice = input.required<number>();
  totalPaid = input.required<number>();
  saldo = input.required<number>();
  hasPendingPayment = input.required<boolean>();

  pay = output<void>();

  icons = {
    Wallet, CheckCircle, AlertCircle, DollarSign
  };
}
