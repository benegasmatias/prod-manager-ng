import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Wallet, CheckCircle, AlertCircle, DollarSign } from 'lucide-angular';

@Component({
  selector: 'app-order-financial-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-zinc-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group h-full">
      <div class="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
        <lucide-angular [img]="icons.Wallet" class="h-32 w-32"></lucide-angular>
      </div>

      <div class="relative z-10 space-y-10">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Total Presupuestado</span>
          <p class="text-5xl font-black tabular-nums tracking-tighter">$ {{ totalPrice() | number:'1.2-2' }}</p>
        </div>

        <div class="space-y-6 pt-10 border-t border-white/5">
          <div class="flex items-center justify-between p-5 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
            <div>
              <p class="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-1">Confirmado / Pagado</p>
              <p class="text-xl font-black tabular-nums text-white">$ {{ totalPaid() | number:'1.2-2' }}</p>
            </div>
            <lucide-angular [img]="icons.CheckCircle" class="h-6 w-6 text-emerald-500/40"></lucide-angular>
          </div>

          <div class="flex items-center justify-between p-5 rounded-3xl bg-rose-500/10 backdrop-blur-sm border border-rose-500/20 hover:bg-rose-500/15 transition-colors">
            <div>
              <p class="text-[8px] font-black uppercase tracking-widest text-rose-400 mb-1">Saldo a Liquidar</p>
              <p class="text-xl font-black tabular-nums text-rose-400">$ {{ saldo() | number:'1.2-2' }}</p>
            </div>
            <lucide-angular [img]="icons.AlertCircle" class="h-6 w-6 text-rose-500/40"></lucide-angular>
          </div>

          @if (hasPendingPayment()) {
            <button (click)="pay.emit()" class="w-full h-16 rounded-3xl bg-white text-zinc-950 text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-zinc-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              <lucide-angular [img]="icons.DollarSign" class="h-5 w-5"></lucide-angular>
              Liquidar Saldo
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
