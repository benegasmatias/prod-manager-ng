import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Wallet, CheckCircle, AlertCircle, DollarSign } from 'lucide-angular';

@Component({
  selector: 'app-order-financial-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-primary/5 rounded-[2.5rem] p-6 border border-primary/10 flex items-center justify-between gap-6 animate-in fade-in duration-700">
       <div class="flex items-center gap-6">
          <div class="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
             <lucide-angular [img]="icons.Wallet" class="h-6 w-6"></lucide-angular>
          </div>
          <div class="space-y-1">
             <p class="text-[8px] font-black uppercase tracking-[0.4em] text-primary/40 italic leading-none">Presupuesto Consolidado</p>
             <p class="text-xl font-black text-text tracking-tighter tabular-nums leading-none">$ {{ totalPrice() | number:'1.0-0' }}</p>
          </div>
       </div>

       <div class="flex items-center gap-4">
          <div class="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/20 italic flex items-center gap-2">
             <div class="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
             Confirmado
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
