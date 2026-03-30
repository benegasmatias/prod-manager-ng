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
    <div class="space-y-6 animate-in slide-in-from-right duration-500">
       <div class="bg-red-50 dark:bg-red-950/20 p-6 rounded-3xl border border-red-100 dark:border-red-800/30 flex items-center gap-4">
          <div class="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
            <lucide-icon name="alert-octagon" size="24"></lucide-icon>
          </div>
          <div>
            <p class="text-[10px] font-black uppercase text-red-600 dark:text-red-400 tracking-widest">¿Qué sucedió con la orden?</p>
            <p class="text-xs text-red-500/60 mt-0.5">El reporte de fallo detendrá el flujo normal para correcciones críticas.</p>
          </div>
       </div>

       <div class="space-y-4">
         <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Motivo del Fallo</label>
         <textarea 
           [ngModel]="reason()"
           (ngModelChange)="reason.set($event)"
           rows="4"
           placeholder="Ej: Material quebrado durante el montaje, falla en el diseño STL..."
           class="w-full p-5 rounded-2xl border-2 border-red-100/30 dark:border-red-950/20 bg-zinc-50/20 dark:bg-zinc-950/40 text-sm font-bold text-zinc-900 dark:text-zinc-50 focus:border-red-500/50 focus:ring-0 transition-all outline-none resize-none"
         ></textarea>
       </div>

       <div class="space-y-4">
         <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Acción Requerida</label>
         <div class="flex gap-3">
           <button 
            (click)="action.set('REDO')"
             [class]="cn('flex-1 h-20 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-2 group', 
              action() === 'REDO' ? 'border-red-500 bg-red-50 text-red-600 shadow-lg shadow-red-500/10' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-200')">
             <lucide-icon name="undo-2" size="20" [class]="action() === 'REDO' ? 'text-red-600' : 'text-zinc-300'"></lucide-icon>
             Re-hacer / Reparar
           </button>
           <button 
             (click)="action.set('DISCARD')"
             [class]="cn('flex-1 h-20 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-2 group', 
              action() === 'DISCARD' ? 'border-zinc-950 bg-zinc-950 text-white shadow-xl' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-200')">
             <lucide-icon name="trash-2" size="20" [class]="action() === 'DISCARD' ? 'text-white' : 'text-zinc-300'"></lucide-icon>
             Descartar Total
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

  cn = cn;
}
