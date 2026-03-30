import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../utils/cn';
import { Priority } from '../../models/pedido';

@Component({
  selector: 'app-badge-urgencia',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cn(
      'inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-sm transition-all',
      style().container
    )">
      <div [class]="cn('h-1.5 w-1.5 rounded-full shrink-0', style().dot)"></div>
      {{ urgencia }}
    </div>
  `
})
export class BadgeUrgenciaComponent {
  @Input({ required: true }) urgencia: Priority = 'EN TIEMPO';

  style = computed(() => {
    const variants: any = {
      VENCIDO: {
        container: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40",
        dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
      },
      PRÓXIMO: {
        container: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40",
        dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
      },
      "EN TIEMPO": {
        container: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700/40",
        dot: "bg-zinc-400"
      },
      LISTO: {
        container: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40",
        dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
      },
    };

    return variants[this.urgencia] || variants["EN TIEMPO"];
  });

  cn = cn;
}
