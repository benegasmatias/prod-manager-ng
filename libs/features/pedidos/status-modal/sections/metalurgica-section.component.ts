import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Wrench, Ruler, MapPin, Calendar, Clock, Info, DollarSign } from 'lucide-angular';
import { Pedido } from '@shared/models';
import { AppDatePickerComponent } from '@shared/ui/app-date-picker/app-date-picker.component';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-metalurgica-section',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AppDatePickerComponent],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <!-- Datos de la Visita (Solo si está en fases comerciales) -->
      @if (showVisitData()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/30">
          <div class="sm:col-span-2 flex items-center gap-2 mb-2">
            <lucide-angular [img]="MapPin" class="h-3.5 w-3.5 text-indigo-400"></lucide-angular>
            <span class="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Logística de Obra</span>
          </div>
          
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Dirección de Obra</label>
            <input 
              type="text"
              [(ngModel)]="visitAddress"
              (ngModelChange)="visitAddressChange.emit($event)"
              placeholder="Ej: Calle falsa 123..."
              class="w-full h-12 px-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold focus:border-indigo-500 transition-all outline-none"
            >
          </div>

          <div class="grid grid-cols-2 gap-3">
              <app-date-picker
                label="Fecha"
                [(value)]="visitDate"
                (valueChange)="visitDateChange.emit($event)"
                placeholder="00/00/0000"
                className="bg-white dark:bg-zinc-950"
              ></app-date-picker>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Hora</label>
              <input 
                type="time" 
                [(ngModel)]="visitTime" 
                (ngModelChange)="visitTimeChange.emit($event)"
                class="w-full h-12 px-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold focus:border-indigo-500 transition-all outline-none"
              >
            </div>
          </div>
        </div>
      }

      <!-- Datos Técnicos / Presupuesto -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
           <h3 class="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 px-1">
              <lucide-angular [img]="Wrench" class="h-3.5 w-3.5"></lucide-angular>
              Especificaciones Técnicas
           </h3>
           <span class="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">Modo Metalúrgica</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Monto Indigo Estilizado -->
          <div class="sm:col-span-2 bg-indigo-600 rounded-3xl p-6 shadow-xl shadow-indigo-500/20 flex items-center justify-between group transition-all hover:scale-[1.01]">
            <div class="space-y-1">
              <span class="text-[10px] font-black uppercase text-indigo-100/60 tracking-widest">Presupuesto Confirmado</span>
              <p class="text-3xl font-black text-white tabular-nums flex items-baseline gap-1">
                <span class="text-xl opacity-50">$</span>
                <input 
                  type="number" 
                  [(ngModel)]="totalPrice" 
                  (ngModelChange)="totalPriceChange.emit($event)"
                  [readonly]="isPriceReadOnly"
                  class="bg-transparent border-none text-white focus:ring-0 w-40 p-0 text-3xl font-black outline-none placeholder:text-indigo-400"
                  placeholder="0.00"
                >
              </p>
            </div>
            <div class="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm group-hover:rotate-12 transition-transform">
              <lucide-angular [img]="DollarSign" class="h-[30px] w-[30px]"></lucide-angular>
            </div>
          </div>

          <!-- Campos Técnicos -->
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tipo de Trabajo</label>
            <select 
              [(ngModel)]="tipoTrabajo" 
              (ngModelChange)="tipoTrabajoChange.emit($event)"
              class="w-full h-12 px-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
            >
               <option value="Portón">Portón</option>
               <option value="Reja">Reja</option>
               <option value="Escalera">Escalera</option>
               <option value="Estructura">Estructura</option>
               <option value="Puerta">Puerta</option>
               <option value="Otro">Otro</option>
            </select>
          </div>

          <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Medidas (mts)</label>
              <div class="relative">
                <input 
                  type="text" 
                  [(ngModel)]="measurements" 
                  (ngModelChange)="measurementsChange.emit($event)"
                  placeholder="Ej: 3.50 x 2.10" 
                  class="w-full h-12 pl-10 px-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                >
                <lucide-angular [img]="Ruler" class="h-3.5 w-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></lucide-angular>
              </div>
          </div>

          <div class="sm:col-span-2 space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Obervaciones de Visita / Relevamiento</label>
            <textarea 
              [(ngModel)]="visitObservations" 
              (ngModelChange)="visitObservationsChange.emit($event)"
              rows="3" 
              class="w-full p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-sm font-bold outline-none focus:border-indigo-500 transition-all resize-none"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MetalurgicaSectionComponent {
  @Input({ required: true }) order!: Pedido;
  @Input({ required: true }) status: string = '';

  // Data bindings with two-way support
  @Input() totalPrice: number = 0;
  @Output() totalPriceChange = new EventEmitter<number>();

  @Input() tipoTrabajo: string = '';
  @Output() tipoTrabajoChange = new EventEmitter<string>();

  @Input() itemName: string = '';
  @Output() itemNameChange = new EventEmitter<string>();

  @Input() measurements: string = '';
  @Output() measurementsChange = new EventEmitter<string>();

  @Input() visitAddress: string = '';
  @Output() visitAddressChange = new EventEmitter<string>();

  @Input() visitDate: string = '';
  @Output() visitDateChange = new EventEmitter<string>();

  @Input() visitTime: string = '';
  @Output() visitTimeChange = new EventEmitter<string>();

  @Input() visitObservations: string = '';
  @Output() visitObservationsChange = new EventEmitter<string>();

  @Input() isPriceReadOnly: boolean = false;

  showVisitData = computed(() => {
    return ['SITE_VISIT', 'SITE_VISIT_DONE', 'VISITA_REPROGRAMADA', 'VISITA_CANCELADA', 'QUOTATION', 'BUDGET_GENERATED', 'APPROVED'].includes(this.status);
  });

  readonly MapPin = MapPin;
  readonly Wrench = Wrench;
  readonly DollarSign = DollarSign;
  readonly Ruler = Ruler;
  cn = cn;
}
