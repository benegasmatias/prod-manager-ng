import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, TrendingDown } from 'lucide-angular';
import { cn } from '@shared/utils/cn';
import { BaseCardComponent } from '../card/base-card.component';

export type MetricCardVariant = 'default' | 'highlight' | 'status';
export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
export type TrendDirection = 'up' | 'down' | 'neutral';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseCardComponent],
  templateUrl: './metric-card.component.html',
  styleUrls: ['./metric-card.component.css']
})
export class MetricCardComponent {
  // Inputs as Signals (Angular 21 style)
  title = input.required<string>();
  value = input.required<string | number>();
  subtitle = input<string>();
  badgeText = input<string>();
  badgeTone = input<BadgeTone>('neutral');
  icon = input<any>();
  variant = input<MetricCardVariant>('default');
  trendText = input<string>();
  trendDirection = input<TrendDirection>('neutral');
  accentColor = input<string>(); // Hex or Tailwind class prefix
  loading = input<boolean>(false);
  clickable = input<boolean>(false);

  // Output
  onClick = output<void>();

  // Computed classes
  cardClasses = computed(() => {
    const base = 'group relative transition-all duration-500 flex flex-col justify-between h-full border-none shadow-none bg-transparent';
    return cn(
      base,
      this.clickable() ? 'cursor-pointer active:scale-95' : 'cursor-default'
    );
  });

  trendClasses = computed(() => {
    const directions = {
      up: 'text-emerald-500',
      down: 'text-rose-500',
      neutral: 'text-muted-foreground'
    };
    return cn(
      'text-[10px] font-black flex items-center gap-1',
      directions[this.trendDirection()]
    );
  });

  cn = cn;

  handleClick() {
    if (this.clickable()) {
      this.onClick.emit();
    }
  }

  readonly icons = {
    TrendingUp,
    TrendingDown
  };
}
