import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, CheckCircle, Clock } from 'lucide-angular';
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
    <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden relative group">
      <!-- Header -->
      <div class="flex items-center justify-between mb-10">
        <div class="space-y-1">
          <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <lucide-angular [img]="icons.TrendingUp" class="h-4 w-4 text-primary"></lucide-angular>
            Flujo de Producción
          </p>
          <p class="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            Etapa Actual: <span class="text-primary">{{ currentStepLabel() }}</span>
          </p>
        </div>
        <div class="text-right flex flex-col items-end">
          <span class="text-2xl font-black tabular-nums text-primary">{{ progressPercentage() }}%</span>
          <span class="text-[8px] font-black uppercase text-zinc-400 tracking-widest">A completitud</span>
        </div>
      </div>

      <!-- Stepper Container -->
      <div class="relative pt-4 pb-8">
        <!-- Progress Line Background -->
        <div class="absolute top-[27px] left-8 right-8 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
        
        <!-- Active Progress Line -->
        <div class="absolute top-[27px] left-8 h-1 bg-primary rounded-full transition-all duration-700 ease-in-out"
             [style.width.%]="linePercentage()"></div>

        <!-- Steps Interaction Area -->
        <div class="relative flex justify-between">
          @for (step of steps; track step.index) {
            <div class="flex flex-col items-center gap-4 relative z-10">
              <!-- Node -->
              <div [class]="cn(
                'h-6 w-6 rounded-full border-4 flex items-center justify-center transition-all duration-500',
                isCompleted(step.index) ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20' : 
                isCurrent(step.index) ? 'bg-white dark:bg-zinc-900 border-primary shadow-xl shadow-primary/20 scale-125' : 
                'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
              )">
                @if (isCompleted(step.index)) {
                  <lucide-angular [img]="icons.CheckCircle" class="h-3 w-3"></lucide-angular>
                } @else if (isCurrent(step.index)) {
                  <div class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                }
              </div>

              <!-- Label -->
              <div class="absolute top-10 flex flex-col items-center min-w-[80px]">
                <p [class]="cn(
                  'text-[9px] font-black uppercase tracking-tighter transition-colors text-center',
                  isCurrent(step.index) ? 'text-primary' : 
                  isCompleted(step.index) ? 'text-zinc-900 dark:text-zinc-200' : 
                  'text-zinc-400'
                )">
                  {{ step.label }}
                </p>
              </div>
            </div>
          }
        </div>
      </div>
      
      <!-- Footer Details -->
      <div class="mt-8 flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-800/50">
        <div class="flex items-center gap-8">
           <div class="space-y-1">
              <p class="text-[8px] font-black uppercase tracking-widest text-zinc-400 leading-none">Antigüedad</p>
              <p class="text-[11px] font-black text-zinc-700 dark:text-zinc-300">{{ age() || '---' }}</p>
           </div>
           <div class="space-y-1">
              <p class="text-[8px] font-black uppercase tracking-widest text-zinc-400 leading-none">Prometido</p>
              <p class="text-[11px] font-black text-zinc-700 dark:text-zinc-300">{{ dueDate() || 'Sin fecha' }}</p>
           </div>
        </div>
        
        @if (isDelayed()) {
          <div class="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 animate-pulse">
            <lucide-angular [img]="icons.Clock" class="h-3 w-3"></lucide-angular>
            <span class="text-[8px] font-black uppercase tracking-widest">Retrasado</span>
          </div>
        }
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

  icons = { TrendingUp, CheckCircle, Clock };

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
