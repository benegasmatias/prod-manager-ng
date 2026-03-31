import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, AlertOctagon, Trash2, Undo2 } from 'lucide-angular';
import { Pedido, Rubro } from '@shared/models';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-failure-module',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-8 animate-in slide-in-from-right duration-500">
       <!-- Reason Section -->
       <div class="space-y-4">
         <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 flex items-center gap-2">
           <div class="h-1 w-3 rounded-full bg-red-500/40"></div>
           Causa Raíz / Motivo
         </label>
         <textarea 
           [ngModel]="reason()"
           (ngModelChange)="reason.set($event)"
           rows="4"
           placeholder="Describe brevemente qué salió mal..."
           class="w-full p-5 rounded-[2rem] border border-red-500/10 dark:border-red-900/20 bg-white dark:bg-zinc-950 text-sm font-bold text-zinc-900 dark:text-zinc-50 focus:border-red-500/50 focus:ring-0 transition-all outline-none resize-none shadow-inner"
         ></textarea>
       </div>

       <div class="grid grid-cols-2 gap-4">
         <!-- Time Lost -->
         <div class="space-y-4">
           <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 flex items-center gap-2 text-left">
             Tiempo Perdido (min)
           </label>
           <div class="relative group">
             <input type="number" [ngModel]="wastedTime()" (ngModelChange)="wastedTime.set($event)"
               class="w-full h-14 pl-5 pr-14 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-sm font-black text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-red-500 focus:ring-0 animate-in transition-all">
             <span class="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-500/60 uppercase">min</span>
           </div>
         </div>

         <!-- Status Badge for Info -->
         <div class="flex flex-col justify-end pb-1 opacity-80 text-left">
            <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1 text-left">Fallo detectado en etapa:</p>
            <p class="text-[10px] font-black text-red-500 uppercase tracking-widest text-left">{{ order.status }}</p>
         </div>
       </div>

       <!-- Material Section -->
       <div class="space-y-5 p-7 rounded-[2.5rem] bg-zinc-950/5 dark:bg-red-950/10 border border-red-500/10 dark:border-red-900/20 relative overflow-hidden group">
          <div class="absolute top-[-10px] right-[-10px] opacity-[0.03] rotate-12 group-hover:rotate-45 transition-transform duration-1000">
             <lucide-angular [img]="AlertOctagon" class="h-32 w-32"></lucide-angular>
          </div>
          
          <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 relative z-10 flex text-left">Material Perdido (g)</label>
          
          <div class="flex items-center justify-between relative z-10">
             <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Merma Total Declarada:</span>
             <span class="text-xl font-black text-red-600 dark:text-red-400 tabular-nums">{{ wastedMaterial() }}g</span>
          </div>

          <div class="pt-2 relative z-10">
             <button class="w-full h-12 rounded-2xl border-2 border-dashed border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest hover:border-red-500/40 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2">
                <span class="text-lg leading-none">+</span>
                Agregar Material Dañado
             </button>
          </div>
       </div>

       <!-- Post-Failure Action -->
       <div class="space-y-4 text-left">
         <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 flex text-left">Acción Requerida Post-Fallo</label>
         <div class="flex gap-2">
           <button 
             (click)="action.set('REDO')"
             [class]="cn('flex-1 h-20 rounded-[1.5rem] border transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden', 
              action() === 'REDO' ? 'border-orange-500 bg-orange-600 text-white shadow-xl shadow-orange-500/20' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-zinc-400')">
             <span class="text-[10px] font-black uppercase tracking-widest relative z-10">Reimprimir</span>
             <span class="text-[8px] font-bold opacity-70 relative z-10">Revertir etapa</span>
           </button>

           <button 
             (click)="action.set('DISCARD')"
             [class]="cn('flex-1 h-20 rounded-[1.5rem] border transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden', 
              action() === 'DISCARD' ? 'border-zinc-950 bg-zinc-900 text-white shadow-xl shadow-black/20' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-zinc-400')">
             <span class="text-[10px] font-black uppercase tracking-widest relative z-10">Descartar</span>
             <span class="text-[8px] font-bold opacity-70 relative z-10">Estado Fallido</span>
           </button>

           <button 
             (click)="action.set('KEEP')"
             [class]="cn('flex-1 h-20 rounded-[1.5rem] border transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden', 
              action() === 'KEEP' ? 'border-zinc-950 bg-zinc-900 text-white shadow-xl shadow-black/20' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-zinc-400')">
             <span class="text-[10px] font-black uppercase tracking-widest relative z-10">Mantener</span>
             <span class="text-[8px] font-bold opacity-70 relative z-10">Solo incidencia</span>
           </button>
         </div>
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
  @Input({ required: true }) wastedMaterial = signal<number>(0);

  readonly AlertOctagon = AlertOctagon;
  readonly Undo2 = Undo2;
  readonly Trash2 = Trash2;
  cn = cn;
}
