import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-metric-cards-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="gridClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class MetricCardsGridComponent {
  columns = input<1 | 2 | 3 | 4>(4);
  gap = input<'sm' | 'md' | 'lg'>('md');

  gridClasses = computed(() => {
    const gaps = {
      sm: 'gap-3 sm:gap-4',
      md: 'gap-4 sm:gap-6',
      lg: 'gap-6 sm:gap-10'
    };
    
    const defaultCols = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    const specificCols = {
      1: 'grid grid-cols-1',
      2: 'grid grid-cols-2',
      3: 'grid grid-cols-2 xl:grid-cols-3',
      4: 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    };

    return cn(
      'w-full max-w-full overflow-visible py-6',
      specificCols[this.columns()] || 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      gaps[this.gap()]
    );
  });

  cn = cn;
}
