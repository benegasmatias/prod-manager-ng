import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  LucideAngularModule, 
  Plus, 
  Layers, 
  Calendar,
  Zap,
  Printer
} from 'lucide-angular';
import { DashboardQuickAction } from '@shared/models/dashboard.config';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="flex flex-wrap gap-4">
      @for (action of actions(); track action.label) {
        <a
          [routerLink]="action.url"
          [class]="cn(
            'group flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-300 active:scale-95 shadow-sm hover:shadow-xl',
            getVariantClasses(action.color)
          )"
        >
          <div class="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center transition-transform group-hover:scale-110">
            <lucide-angular [img]="getIcon(action.icon)" class="h-5 w-5"></lucide-angular>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-black uppercase tracking-widest opacity-60">Acción Rápida</span>
            <span class="text-sm font-black tracking-tight">{{ action.label }}</span>
          </div>
        </a>
      }
    </div>
  `
})
export class QuickActionsComponent {
  actions = input.required<DashboardQuickAction[]>();

  readonly icons: any = { Plus, Layers, Calendar, Zap, Printer };

  getIcon(iconName: string): any {
    return this.icons[iconName] || this.icons.Plus;
  }

  getVariantClasses(color?: string): string {
    const variants: Record<string, string> = {
      primary: 'bg-primary border-primary/20 text-white shadow-primary/20 hover:bg-primary/90',
      indigo: 'bg-indigo-600 border-indigo-200 text-white shadow-indigo-600/20 hover:bg-indigo-700',
      zinc: 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800'
    };
    return variants[color || 'zinc'];
  }

  cn = cn;
}
