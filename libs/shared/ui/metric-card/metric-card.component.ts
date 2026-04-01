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
    const variantStyles = {
      default: '',
      highlight: 'bg-primary text-primary-foreground rounded-[2rem] overflow-hidden hover:scale-[1.02] shadow-xl shadow-primary/20',
      status: 'border-b-4'
    };

    return cn(
      base,
      variantStyles[this.variant()],
      this.variant() === 'status' && this.accentColor() ? `border-b-${this.accentColor()}` : '',
      this.clickable() ? 'cursor-pointer active:scale-95' : 'cursor-default'
    );
  });

  badgeClasses = computed(() => {
    const tones = {
      neutral: 'bg-muted text-muted-foreground',
      success: 'bg-emerald-500/10 text-emerald-500',
      warning: 'bg-amber-500/10 text-amber-500',
      danger: 'bg-rose-500/10 text-rose-500',
      info: 'bg-sky-500/10 text-sky-500',
      primary: 'bg-primary/10 text-primary'
    };
    return cn(
      'text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border border-current opacity-70',
      tones[this.badgeTone()]
    );
  });

  iconClasses = computed(() => {
    return cn(
      'h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500',
      this.variant() === 'highlight' 
        ? 'bg-white/10 text-white border border-white/10' 
        : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'
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
