import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LayoutGrid, Activity, Wallet, AlertCircle } from 'lucide-angular';
import { DashboardSummary } from '@shared/models/dashboard';

@Component({
  selector: 'app-hero-summary',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-10 rounded-[3.5rem] bg-zinc-950 border border-zinc-800 shadow-2xl relative overflow-hidden group transition-all duration-700 hover:shadow-primary/5">
       <!-- Dynamic Glow Effects -->
       <div class="absolute -top-40 -left-40 h-[25rem] w-[25rem] bg-primary/10 rounded-full blur-[10rem] transition-all group-hover:scale-150 duration-700"></div>
       <div class="absolute -bottom-40 -right-40 h-[25rem] w-[25rem] bg-primary/5 rounded-full blur-[15rem]"></div>
       
       @for (stat of stats(); track stat.label) {
         <div class="relative z-10 flex flex-col gap-2 p-6 transition-all duration-500 border-b border-zinc-800 lg:border-b-0 lg:border-r last:border-none border-zinc-800/50">
           <div class="flex items-center gap-2 opacity-50">
             <lucide-angular [img]="stat.icon" class="h-4 w-4"></lucide-angular>
             <span class="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 group-hover:text-zinc-200 transition-colors">{{ stat.label }}</span>
           </div>
           
           <div class="flex items-baseline gap-3">
             <h3 class="text-4xl font-black tracking-tighter text-white group-hover:text-primary transition-colors duration-500">
               {{ stat.value }}
             </h3>
             @if (stat.suffix) {
               <span class="text-[10px] font-black uppercase tracking-widest text-zinc-600">{{ stat.suffix }}</span>
             }
           </div>
         </div>
       }
    </div>
  `
})
export class HeroSummaryComponent {
  summary = input.required<DashboardSummary | null>();

  stats = computed(() => {
    const s = this.summary();
    return [
      { label: 'Pedidos Activos', value: s?.activeOrders ?? 0, icon: LayoutGrid, suffix: 'ORD' },
      { label: 'En Producción', value: s?.productionOrders ?? 0, icon: Activity, suffix: 'JOBS' },
      { label: 'Saldo de Cartera', value: `$${(s?.pendingBalance ?? 0).toLocaleString()}`, icon: Wallet, suffix: 'ARS' },
      { label: 'Alertas Sistema', value: s?.alerts?.length ?? 0, icon: AlertCircle, suffix: 'WARN' }
    ];
  });
}
