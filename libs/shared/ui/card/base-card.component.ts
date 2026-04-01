import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '@shared/utils/cn';

export type CardVariant = 'default' | 'surface' | 'outline' | 'ghost' | 'flat';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type CardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

@Component({
  selector: 'app-base-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-card.component.html',
  styleUrls: ['./base-card.component.css']
})
export class BaseCardComponent {
  variant = input<CardVariant>('default');
  padding = input<CardPadding>('md');
  radius = input<CardRadius>('2xl');
  shadow = input<boolean>(true);
  border = input<boolean>(true);
  hover = input<boolean>(false);
  glass = input<boolean>(false);
  
  // New: Semantic Tones for specialized variants (metric, list, alert, action)
  tone = input<'metric' | 'list' | 'alert' | 'action' | 'none'>('none');

  cardClasses = computed(() => {
    const base = 'relative transition-all duration-300 overflow-hidden flex flex-col';
    
    const variants = {
      default: 'bg-card text-text',
      surface: 'bg-surface text-text',
      outline: 'bg-transparent border-2 border-border text-text',
      ghost: 'bg-transparent text-text shadow-none border-none',
      flat: 'bg-surface-2 text-text shadow-none border-none'
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    };

    const radii = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      full: 'rounded-full'
    };

    const tones = {
      metric: 'shadow-sm hover:shadow-xl hover:-translate-y-1',
      list: 'border-b last:border-b-0 rounded-none first:rounded-t-2xl last:rounded-b-2xl',
      alert: 'border-l-4 rounded-xl',
      action: 'cursor-pointer active:scale-[0.98] hover:bg-surface-2',
      none: ''
    };

    return cn(
      base,
      variants[this.variant()],
      paddings[this.padding()],
      radii[this.radius()],
      this.shadow() ? (this.variant() === 'default' ? 'shadow-sm shadow-black/5' : 'shadow-none') : 'shadow-none',
      this.border() ? 'border border-border' : 'border-none',
      this.hover() ? 'hover:border-primary/30 hover:shadow-lg' : '',
      this.glass() ? 'backdrop-blur-md bg-white/70 dark:bg-black/60' : '',
      tones[this.tone()]
    );
  });
}
