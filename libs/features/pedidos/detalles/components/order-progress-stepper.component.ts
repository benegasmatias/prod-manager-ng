import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, CheckCircle, Clock, Circle, Edit3, Cog, Truck } from 'lucide-angular';
import { OrderStatus } from '@shared/models';
import { getStatusLabel } from '@shared/utils';

interface Step {
  label: string;
  key: string;
  index: number;
}

@Component({
  selector: 'app-order-progress-stepper',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="py-12 animate-in fade-in duration-700">
      <div class="relative px-4">
        <!-- Connecting Line -->
        <div class="absolute top-[22px] left-10 right-10 h-0.5 bg-zinc-100 dark:bg-zinc-800">
           <div class="h-full bg-primary transition-all duration-1000 ease-out" [style.width.%]="linePercentage()"></div>
        </div>

        <!-- Steps Interaction Area -->
        <div class="relative flex justify-between">
          @for (step of steps; track step.index) {
            <div class="flex flex-col items-center gap-3 relative z-10 group/step">
              <!-- Node -->
              <div [class]="cn(
                'h-11 w-11 rounded-full flex items-center justify-center transition-all duration-700 border-2',
                isCompleted(step.index) ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 
                isCurrent(step.index) ? 'bg-primary border-primary text-white scale-110 shadow-2xl shadow-primary/40' : 
                'bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700'
              )">
                <lucide-angular [img]="getStepIcon(step.key)" [class]="cn('h-5 w-5', isCurrent(step.index) ? 'animate-pulse' : '')"></lucide-angular>
              </div>

              <!-- Label -->
              <p [class]="cn(
                'text-[7px] font-black uppercase tracking-tight transition-all duration-500 whitespace-nowrap',
                isCurrent(step.index) ? 'text-primary' : 
                isCompleted(step.index) ? 'text-text' : 
                'text-zinc-400'
              )">
                {{ step.label }}
              </p>
            </div>
          }
        </div>
      </div>
    </div>

  `,
  styles: [`
    :host { display: block; }
  `]
})
export class OrderProgressStepperComponent {
  status = input.required<OrderStatus>();
  age = input<string | null>();
  dueDate = input<string | null>();
  rubro = input<string | null>(null);
  isStock = input<boolean>(false);

  icons = { TrendingUp, CheckCircle, Clock, Circle, Edit3, Cog, Truck };

  getStepIcon(key: string) {
    switch(key) {
      case 'PENDING': return this.icons.Circle;
      case 'DESIGN': return this.icons.Edit3;
      case 'PROD': return this.icons.Cog;
      case 'DONE': return this.icons.CheckCircle;
      case 'DELIVERED': return this.icons.Truck;
      default: return this.icons.Circle;
    }
  }

  steps: Step[] = [
    { label: 'Pendiente', key: 'PENDING', index: 0 },
    { label: 'Diseño', key: 'DESIGN', index: 1 },
    { label: 'Producción', key: 'PROD', index: 2 },
    { label: 'Terminado', key: 'DONE', index: 3 },
    { label: 'Entregado', key: 'DELIVERED', index: 4 }
  ];

  currentStepIndex = computed(() => {
    const s = this.status();
    if (['PENDING', 'APPROVED'].includes(s)) return 0;
    if (s === 'DESIGN') return 1;
    if (['IN_PRODUCTION', 'WAITING_PRINTER', 'WAITING_MATERIALS', 'CUTTING', 'WELDING', 'ASSEMBLY', 'PAINTING'].includes(s)) return 2;
    if (['READY_FOR_DELIVERY', 'DONE', 'POST_PROCESS', 'READY', 'ARMADO', 'BARNIZADO'].includes(s)) return 3;
    if (s === 'DELIVERED') return 4;
    return 0;
  });

  currentStepLabel = computed(() => {
    const idx = this.currentStepIndex();
    return this.steps[idx].label;
  });

  linePercentage = computed(() => {
    const idx = this.currentStepIndex();
    return (idx / (this.steps.length - 1)) * 100;
  });

  progressPercentage = computed(() => {
    const idx = this.currentStepIndex();
    return Math.round(((idx + 1) / this.steps.length) * 100);
  });

  isCompleted(index: number): boolean {
    return index < this.currentStepIndex();
  }

  isCurrent(index: number): boolean {
    return index === this.currentStepIndex();
  }

  isDelayed = computed(() => {
    // Lógica simple si el estado no es entregado y pasaron muchos días
    // O si tenemos la fecha de entrega y hoy es mayor
    return false; // Implementar si hace falta
  });

  cn(...args: any[]) {
    return args.filter(Boolean).join(' ');
  }
}
