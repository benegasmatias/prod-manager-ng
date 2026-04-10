import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Factory, CheckCircle2, Clock, Package, Zap } from 'lucide-angular';
import { OrderStatus } from '@shared/models';

@Component({
  selector: 'app-stock-progress-flow',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
      <!-- Decoration Backdrop -->
      <div class="absolute -top-12 -right-12 h-32 w-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
      
      <!-- Header Info -->
      <div class="flex items-center justify-between mb-12 relative z-10">
        <div class="space-y-1">
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
            <lucide-angular [img]="icons.Factory" class="h-4 w-4 text-primary"></lucide-angular>
            Ciclo de Vida del Activo
          </p>
          <p class="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            Nivel de Disponibilidad: <span class="text-primary italic">{{ currentStepLabel() }}</span>
          </p>
        </div>
        <div class="text-right">
          <div class="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
             <span class="text-xs font-black tabular-nums text-primary">{{ progressPercentage() }}%</span>
             <div class="h-1 w-8 bg-zinc-200 dark:bg-zinc-600 rounded-full overflow-hidden">
                <div class="h-full bg-primary transition-all duration-1000" [style.width.%]="progressPercentage()"></div>
             </div>
          </div>
        </div>
      </div>

      <!-- Flow Rail -->
      <div class="relative px-4 pb-12 pt-6">
        <!-- Connecting Line Background -->
        <div class="absolute top-[39px] left-12 right-12 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
        
        <!-- Active Connecting Line -->
        <div class="absolute top-[39px] left-12 h-1.5 bg-primary rounded-full transition-all duration-1000 ease-out"
             [style.width.%]="linePercentage()"></div>

        <!-- Nodes Display -->
        <div class="relative flex justify-between items-start">
          @for (step of steps; track step.key) {
            <div class="flex flex-col items-center gap-6 relative z-10 w-24">
              <!-- Node Circle -->
              <div 
                [class]="cn(
                  'h-12 w-12 rounded-[1.25rem] border-4 flex items-center justify-center transition-all duration-500 shadow-sm',
                  isCompleted(step.index) ? 'bg-primary border-primary text-white scale-100' : 
                  isCurrent(step.index) ? 'bg-white dark:bg-zinc-900 border-primary text-primary shadow-xl shadow-primary/20 scale-110' : 
                  'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-300'
                )"
              >
                <lucide-angular [img]="step.icon" [class]="cn('h-5 w-5 transition-transform duration-500', isCurrent(step.index) ? 'scale-110' : '')"></lucide-angular>
              </div>

              <!-- Node Identity -->
              <div class="text-center space-y-1">
                <p [class]="cn(
                  'text-[9px] font-black uppercase tracking-widest transition-colors',
                  isCurrent(step.index) ? 'text-primary' : 
                  isCompleted(step.index) ? 'text-zinc-600 dark:text-zinc-300' : 
                  'text-zinc-400'
                )">
                  {{ step.label }}
                </p>
                <p class="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase leading-none opacity-0 group-hover:opacity-100 transition-opacity">
                  {{ step.desc }}
                </p>
              </div>

              <!-- Pulse Indicator for Active -->
              @if (isCurrent(step.index)) {
                <div class="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-ping opacity-40"></div>
                <div class="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-white dark:border-zinc-950"></div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Inventory Metrics Footer -->
      <div class="mt-8 pt-6 border-t border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
        <div class="flex items-center gap-6">
           <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full" [class]="status() === 'IN_STOCK' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-amber-400 animate-pulse'"></div>
              <span class="text-[9px] font-black uppercase tracking-widest text-zinc-400">{{ status() === 'IN_STOCK' ? 'DISPONIBLE EN INVENTARIO' : 'EN PROCESO DE MANUFACTURA' }}</span>
           </div>
        </div>
        
        <div class="flex items-center gap-4 text-zinc-400">
           <lucide-angular [img]="icons.Clock" class="h-3 w-3"></lucide-angular>
           <span class="text-[9px] font-black uppercase tracking-widest">Antigüedad del Lote: {{ ageValue() || 'Nueva Rueda' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class StockProgressFlowComponent {
  status = input.required<OrderStatus>();
  ageValue = input<string | null>();

  icons = { Factory, CheckCircle2, Clock, Package, Zap };

  steps = [
    { key: 'PENDING', label: 'Planificado', desc: 'Cola Taller', icon: Clock, index: 0 },
    { key: 'PRODUCTION', label: 'En Obra', desc: 'Transformación', icon: Zap, index: 1 },
    { key: 'DONE', label: 'Terminado', desc: 'Control Q&A', icon: CheckCircle2, index: 2 },
    { key: 'IN_STOCK', label: 'Disponible', desc: 'Ingreso Inv.', icon: Package, index: 3 }
  ];

  currentStepIndex = computed(() => {
    const s = this.status();
    if (['PENDING', 'APPROVED', 'DRAFT'].includes(s)) return 0;
    if (['IN_PRODUCTION', 'WAITING_PRINTER', 'DESIGN', 'CUTTING', 'WELDING', 'ASSEMBLY', 'PAINTING', 'POST_PROCESS'].includes(s)) return 1;
    if (['DONE', 'READY_FOR_DELIVERY', 'READY'].includes(s)) return 2;
    if (s === 'IN_STOCK' || s === 'DELIVERED') return 3;
    return 0;
  });

  currentStepLabel = computed(() => this.steps[this.currentStepIndex()].label);
  
  progressPercentage = computed(() => Math.round(((this.currentStepIndex() + 1) / this.steps.length) * 100));
  
  linePercentage = computed(() => (this.currentStepIndex() / (this.steps.length - 1)) * 100);

  isCompleted(index: number): boolean { return index < this.currentStepIndex(); }
  isCurrent(index: number): boolean { return index === this.currentStepIndex(); }

  cn(...args: any[]) { return args.filter(Boolean).join(' '); }
}
