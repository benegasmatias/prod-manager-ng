import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Wallet, CheckCircle, AlertCircle, DollarSign, Trash2, Calendar, CreditCard, Building2, Smartphone } from 'lucide-angular';

@Component({
  selector: 'app-order-financial-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <!-- Summary Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-700">
        <!-- Total -->
        <div class="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 space-y-4">
           <div class="flex items-center gap-4">
              <div class="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <lucide-angular [img]="icons.Wallet" class="h-5 w-5"></lucide-angular>
              </div>
              <span class="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40 italic">Presupuesto Total</span>
           </div>
           <p class="text-3xl font-black text-text tracking-tighter tabular-nums leading-none">$ {{ totalPrice() | number:'1.0-0' }}</p>
        </div>

        <!-- Pagado -->
        <div class="bg-emerald-500/5 rounded-[2.5rem] p-8 border border-emerald-500/10 space-y-4">
           <div class="flex items-center gap-4">
              <div class="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                 <lucide-angular [img]="icons.CheckCircle" class="h-5 w-5"></lucide-angular>
              </div>
              <span class="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500/40 italic">Monto Consolidado</span>
           </div>
           <p class="text-3xl font-black text-emerald-600 tracking-tighter tabular-nums leading-none">$ {{ totalPaid() | number:'1.0-0' }}</p>
        </div>

        <!-- Saldo -->
        <div [class]="cn('rounded-[2.5rem] p-8 border space-y-4 transition-all', hasPendingPayment() ? 'bg-amber-500/5 border-amber-500/10' : 'bg-zinc-500/5 border-zinc-500/10')">
           <div class="flex items-center gap-4">
              <div [class]="cn('h-10 w-10 rounded-2xl flex items-center justify-center', hasPendingPayment() ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-500/10 text-zinc-400')">
                 <lucide-angular [img]="icons.AlertCircle" class="h-5 w-5"></lucide-angular>
              </div>
              <span [class]="cn('text-[9px] font-black uppercase tracking-[0.4em] italic', hasPendingPayment() ? 'text-amber-500/40' : 'text-zinc-400/40')">Saldo Pendiente</span>
           </div>
           <div class="flex items-center justify-between">
             <p [class]="cn('text-3xl font-black tracking-tighter tabular-nums leading-none', hasPendingPayment() ? 'text-amber-600' : 'text-zinc-400')">$ {{ saldo() | number:'1.0-0' }}</p>
             @if (hasPendingPayment()) {
               <button (click)="pay.emit()" class="h-10 px-6 rounded-xl bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all italic">Cobrar</button>
             }
           </div>
        </div>
      </div>

      <!-- Payment History List -->
      @if (payments().length > 0) {
        <div class="bg-surface-container-lowest rounded-[3rem] border border-border/5 p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-1000 shadow-2xl shadow-text/5">
           <div class="flex items-center justify-between border-b border-border/5 pb-8">
              <div class="flex items-center gap-4">
                <div class="h-2 w-10 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                <h3 class="text-2xl font-black text-text tracking-tighter uppercase font-display italic">Historial de <span class="text-emerald-500">Transacciones</span></h3>
              </div>
              <span class="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted/40 italic">{{ payments().length }} Movimientos</span>
           </div>

           <div class="space-y-4">
             @for (p of payments(); track p.id) {
               <div class="flex items-center justify-between p-6 rounded-[2rem] bg-surface-container-low border border-border/5 hover:border-emerald-500/20 transition-all group/it">
                 <div class="flex items-center gap-8">
                   <div class="h-14 w-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center text-text-muted/20 group-hover/it:text-emerald-500 transition-colors shadow-xl shadow-text/5">
                     <lucide-angular [img]="getMethodIcon(p.method)" class="h-6 w-6"></lucide-angular>
                   </div>
                   <div class="space-y-1">
                     <p class="text-[8px] font-black text-text-muted/40 uppercase tracking-[0.4em] leading-none italic">Cobro Registrado</p>
                     <p class="text-xl font-black text-text tracking-tighter tabular-nums leading-none">$ {{ p.amount | number:'1.0-0' }}</p>
                   </div>
                   <div class="hidden md:flex flex-col border-l border-border/5 pl-8">
                     <span class="text-[8px] font-black text-text-muted/40 uppercase tracking-[0.4em] leading-none mb-1 italic">Cronología</span>
                     <span class="text-[10px] font-black text-text/60 uppercase tracking-[0.2em]">{{ p.paidAt | date:'dd MMM, yyyy' }}</span>
                   </div>
                 </div>

                 <button (click)="revert.emit(p.id)" 
                   class="h-14 w-14 rounded-2xl flex items-center justify-center text-error bg-error/5 hover:bg-error hover:text-white transition-all shadow-xl shadow-error/10 border border-error/10 active:scale-95 group/del">
                   <lucide-angular [img]="icons.Trash2" class="h-5 w-5 group-hover/del:rotate-12 transition-transform"></lucide-angular>
                 </button>
               </div>
             }
           </div>
        </div>
      } @else {
        <div class="p-20 rounded-[3rem] border border-dashed border-border/10 flex flex-col items-center justify-center text-center space-y-6 grayscale opacity-40">
           <div class="h-24 w-24 rounded-[2.5rem] bg-surface-container-low flex items-center justify-center text-text-muted">
             <lucide-angular [img]="icons.Wallet" class="h-10 w-10"></lucide-angular>
           </div>
           <div class="max-w-xs">
             <p class="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted mb-2 italic">Sin Actividad Financiera</p>
             <p class="text-xs font-bold text-text-muted/40 italic px-4">No se han registrado cobros asociados a este expediente de trabajo.</p>
           </div>
        </div>
      }
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
  payments = input<any[]>([]);

  pay = output<void>();
  revert = output<string>();

  icons = {
    Wallet, CheckCircle, AlertCircle, DollarSign, Trash2, Calendar
  };

  methods = [
    { key: 'CASH', icon: DollarSign },
    { key: 'TRANSFER', icon: Building2 },
    { key: 'MP', icon: Smartphone },
    { key: 'CARD', icon: CreditCard }
  ];

  getMethodIcon(key: string) {
    return this.methods.find(m => m.key === key)?.icon || DollarSign;
  }

  cn(...args: any[]) {
    return args.filter(Boolean).join(' ');
  }
}
