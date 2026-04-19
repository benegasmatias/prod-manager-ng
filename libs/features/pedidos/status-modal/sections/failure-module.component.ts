import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, AlertTriangle, Trash2, Undo2, Plus } from 'lucide-angular';
import { Pedido, Rubro, Material } from '@shared/models';
import { cn } from '@shared/utils/cn';
import { getStatusLabel, getStatusStyles } from '@shared/utils/negocio-utils';

@Component({
  selector: 'app-failure-module',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-4 animate-in slide-in-from-right duration-500">
       <!-- Header Info - Compact -->
       <div class="flex items-center justify-between px-1">
          <label class="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <div class="h-1 w-2 rounded-full bg-red-500"></div>
            Motivo de la falla
          </label>
          <div class="flex items-center gap-2">
            <span class="text-[8px] font-bold text-zinc-400 uppercase">Detectado en:</span>
            <span [class]="cn('text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider', getStyles(order.status))">
               {{ getLabel(order.status) }}
            </span>
          </div>
       </div>

       <!-- Reason Input -->
       <textarea 
         [ngModel]="reason()"
         (ngModelChange)="reason.set($event)"
         rows="3"
         placeholder="Describe brevemente qué pasó..."
         class="w-full p-4 rounded-2xl border border-red-500/10 dark:border-red-900/20 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-900 dark:text-zinc-50 focus:border-red-500/40 focus:ring-0 transition-all outline-none resize-none shadow-inner"
       ></textarea>

       <div class="grid grid-cols-2 gap-4">
         <!-- Time Lost -->
         <div class="space-y-2">
           <label class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Tiempo Perdido</label>
           <div class="relative">
             <input type="number" [ngModel]="wastedTime()" (ngModelChange)="wastedTime.set($event)"
               class="w-full h-11 pl-4 pr-12 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-black text-zinc-900 dark:text-zinc-100 focus:border-red-500 transition-all">
             <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-400 uppercase">MIN</span>
           </div>
         </div>

         <!-- Total Summary -->
         <div class="space-y-2">
            <label class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Merma Total</label>
            <div class="h-11 flex items-center justify-between px-4 rounded-xl bg-red-500/5 border border-red-500/10">
               <span class="text-[9px] font-bold text-red-500/70 uppercase">Acumulado:</span>
               <span class="text-sm font-black text-red-600 tabular-nums">{{ getTotalWasted() }}g</span>
            </div>
         </div>
       </div>

       <!-- Dynamic Material Wastes List -->
       <div class="space-y-2">
          <label class="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1">Desglose de Merma por Material</label>
          
          <div class="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            @for (waste of materialWastes(); track $index) {
              <div class="flex items-center gap-2 animate-in slide-in-from-left duration-300">
                <!-- Selector Trigger / Display -->
                <button 
                  (click)="onSelectMaterial.emit($index)"
                  class="flex-1 h-11 px-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-2 hover:border-zinc-300 transition-all overflow-hidden group">
                  @if (getMaterial(waste.materialId); as mat) {
                    <div class="h-4 w-4 rounded-full shadow-sm border border-black/5" [style.backgroundColor]="mat.color || '#ccc'"></div>
                    <span class="text-[10px] font-black uppercase truncate text-zinc-700 dark:text-zinc-200">{{ mat.name }}</span>
                  } @else {
                    <div class="h-4 w-4 rounded-full border-2 border-dashed border-zinc-200"></div>
                    <span class="text-[9px] font-bold uppercase text-zinc-400">Elegir filamento...</span>
                  }
                </button>

                <!-- Grams Input -->
                <div class="relative w-24">
                  <input type="number" [ngModel]="waste.grams" (ngModelChange)="onGramsChange.emit({ index: $index, grams: $event })"
                    placeholder="0"
                    class="w-full h-11 pl-3 pr-8 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-black text-red-600 text-right focus:border-red-500 outline-none">
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-red-500/40 uppercase">G</span>
                </div>

                <!-- Remove Button -->
                <button (click)="onRemoveMaterial.emit($index)" class="h-11 w-11 flex items-center justify-center rounded-xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                  <lucide-angular [img]="Trash2" class="h-4 w-4"></lucide-angular>
                </button>
              </div>
            }
          </div>

          <!-- Add More Button -->
          <button 
            (click)="onAddRow.emit()"
            class="w-full h-9 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest">
              <lucide-angular [img]="Plus" class="h-3 w-3"></lucide-angular>
              Agregar Material
          </button>
       </div>

       <!-- Post-Failure Action -->
       <div class="grid grid-cols-3 gap-2">
         <button 
           (click)="action.set('REDO')"
           [class]="cn('h-16 rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5', 
            action() === 'REDO' ? 'border-orange-500 bg-orange-600 text-white' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-zinc-400')">
           <span class="text-[9px] font-black uppercase tracking-tight">Reimprimir</span>
           <span class="text-[7px] font-bold opacity-70 italic whitespace-nowrap">Revertir etapa</span>
         </button>

         <button 
           (click)="action.set('DISCARD')"
           [class]="cn('h-16 rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5', 
            action() === 'DISCARD' ? 'border-zinc-950 bg-zinc-900 text-white' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-zinc-400')">
           <span class="text-[9px] font-black uppercase tracking-tight">Descartar</span>
           <span class="text-[7px] font-bold opacity-70 italic">Falla total</span>
         </button>

         <button 
           (click)="action.set('KEEP')"
           [class]="cn('h-16 rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5', 
            action() === 'KEEP' ? 'border-zinc-950 bg-zinc-900 text-white' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-zinc-400')">
           <span class="text-[9px] font-black uppercase tracking-tight">Mantener</span>
           <span class="text-[7px] font-bold opacity-70 italic">Incidencia</span>
         </button>
       </div>
    </div>
  `
})
export class FailureModuleComponent {
  @Input({ required: true }) order!: Pedido;
  @Input({ required: true }) rubro!: Rubro;
  @Input({ required: true }) reason = signal<string>('');
  @Input({ required: true }) action = signal<'REDO' | 'DISCARD' | 'KEEP'>('REDO');
  @Input({ required: true }) wastedTime = signal<number>(0);
  @Input({ required: true }) materialWastes = signal<{ materialId: string, grams: number }[]>([]);
  @Input({ required: true }) materials: Material[] = [];

  @Output() onAddRow = new EventEmitter<void>();
  @Output() onSelectMaterial = new EventEmitter<number>();
  @Output() onRemoveMaterial = new EventEmitter<number>();
  @Output() onMaterialChange = new EventEmitter<{ index: number, materialId: string }>();
  @Output() onGramsChange = new EventEmitter<{ index: number, grams: number }>();

  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  cn = cn;

  getMaterial(id: string) { return this.materials.find(m => m.id === id); }
  getLabel(status: any) { return getStatusLabel(status); }
  getStyles(status: any) { return getStatusStyles(status); }

  getTotalWasted() {
    return this.materialWastes().reduce((acc, curr) => acc + (curr.grams || 0), 0);
  }
}
