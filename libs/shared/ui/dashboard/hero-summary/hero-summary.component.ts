import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LayoutGrid, Activity, Wallet, AlertCircle } from 'lucide-angular';
import { DashboardSummary } from '@shared/models/dashboard';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-hero-summary',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-12 rounded-[4rem] bg-text text-white shadow-[0_40px_80px_-20px_rgba(var(--text-rgb),0.3)] relative overflow-hidden group transition-all duration-700 hover:shadow-primary/20">
       <!-- Dynamic Glow Effects -->
       <div class="absolute -top-40 -left-40 h-[30rem] w-[30rem] bg-primary/20 rounded-full blur-[12rem] transition-all group-hover:scale-150 duration-1000"></div>
       <div class="absolute -bottom-40 -right-40 h-[30rem] w-[30rem] bg-primary/10 rounded-full blur-[15rem]"></div>
       
       @for (stat of stats(); track stat.label) {
          <div class="relative z-10 flex flex-col gap-4 p-6 transition-all duration-500">
            <div class="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
              <lucide-angular [img]="stat.icon" class="h-4 w-4 text-primary"></lucide-angular>
              <span class="text-[9px] font-black uppercase tracking-[0.4em] text-white/60 italic">{{ stat.label }}</span>
            </div>
           
            <div class="flex items-baseline gap-4">
              <h3 class="text-5xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform origin-left duration-700">
                {{ stat.value }}
              </h3>
              @if (stat.suffix) {
                <span class="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">{{ stat.suffix }}</span>
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

  cn = cn;
}
