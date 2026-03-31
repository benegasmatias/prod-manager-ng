import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="group relative bg-white dark:bg-zinc-900/40 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/50 p-8 shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 active:scale-95 duration-500 overflow-hidden backdrop-blur-sm">
      <!-- Background Ornament -->
      <div class="absolute -top-10 -right-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl transition-all group-hover:scale-150 duration-700"></div>

      <div class="flex flex-col gap-6 relative z-10 transition-transform duration-500 text-left">
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-primary transition-colors">{{ title }}</span>
          </div>
          <div class="h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 group-hover:bg-primary group-hover:text-white transition-all shadow-sm flex items-center justify-center duration-500 group-hover:rotate-6">
            <lucide-angular [img]="icon" class="h-6 w-6"></lucide-angular>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <h3 class="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-baseline gap-1">
            <span class="group-hover:translate-x-1 transition-transform inline-block">{{ value }}</span>
          </h3>
          
          @if (trend) {
            <div class="flex items-center gap-1.5 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <span [class]="trend.isPositive ? 'text-emerald-500' : 'text-rose-500'" class="text-[10px] font-black">
                {{ trend.isPositive ? '+' : '-' }}{{ trend.value }}%
              </span>
              <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{{ trend.label }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() icon: any;
  @Input() trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}
