import { Component, Input, Output, EventEmitter, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Machine } from '@shared/models';
import { LucideAngularModule, Cpu, Info } from 'lucide-angular';
import { SessionService } from '@core/session/session.service';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';

@Component({
  selector: 'app-machine-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonSpinnerComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden m-4 slide-in-from-bottom-4 animate-in duration-300">
        <div class="p-8 border-b border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/10 text-left relative">
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group">
              <lucide-angular [img]="icons.Cpu" class="h-6 w-6 transition-transform group-hover:scale-110"></lucide-angular>
            </div>
            <div class="space-y-1">
              <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {{ machineId ? 'Editar ' + (config().labels.maquinas.slice(0, -1) || 'Máquina') : 'Nueva ' + (config().labels.maquinas.slice(0, -1) || 'Máquina') }}
              </h2>
              <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] leading-relaxed">
                {{ config().labels.produccion || 'Gestión de Equipamiento' }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-8 space-y-8">
          <div class="space-y-6">
            <div class="space-y-2.5">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1 text-left block">Nombre de Unidad</label>
              <input
                [(ngModel)]="form.name"
                placeholder="Ej: Impresora Pro #1 / Torno CNC"
                class="w-full h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
              />
            </div>

            <div class="space-y-2.5">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1 text-left block">Modelo / Marca</label>
              <input
                [(ngModel)]="form.model"
                placeholder="Especificación técnica o modelo"
                class="w-full h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          @if (config().features.hasNozzle || config().features.hasMaxFilaments) {
            <div class="pt-8 border-t border-zinc-50 dark:border-zinc-800/50 grid grid-cols-2 gap-6">
              @if (config().features.hasNozzle) {
                <div class="space-y-2.5">
                  <label class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1 text-left block">Nozzle</label>
                  <input
                    [(ngModel)]="form.nozzle"
                    placeholder="0.4mm"
                    class="w-full h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>
              }
              @if (config().features.hasMaxFilaments) {
                <div class="space-y-2.5">
                  <label class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1 text-left block">Insumos (Max)</label>
                  <div class="relative">
                    <input
                      type="number"
                      [(ngModel)]="form.maxFilaments"
                      class="w-full h-12 rounded-2xl border-none bg-zinc-50/50 dark:bg-zinc-950/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all focus:bg-white dark:focus:bg-zinc-900 pr-12 focus:outline-none"
                    />
                    <span class="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">UNID</span>
                  </div>
                </div>
              }
            </div>
          }

          <div class="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex gap-4 items-start mx-2">
            <lucide-angular [img]="icons.Info" class="h-5 w-5 text-primary shrink-0 mt-0.5"></lucide-angular>
            <p class="text-xs text-primary/80 font-medium leading-relaxed text-left">
              Una vez creada, la unidad aparecerá disponible en el panel de producción para asignar nuevos pedidos y monitorear su estado en tiempo real.
            </p>
          </div>
        </div>

        <div class="p-8 pt-0 flex flex-row items-center justify-end gap-3 bg-white dark:bg-zinc-950">
          <button
            (click)="onCancel.emit()"
            [disabled]="saving"
            class="rounded-2xl font-bold h-12 px-6 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <app-button-spinner
            [loading]="saving"
            [disabled]="!form.name"
            loadingText="Guardando..."
            btnClass="flex items-center justify-center rounded-2xl font-bold h-12 px-10 bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50"
            (onClick)="handleSave()"
          >
            {{ machineId ? 'Actualizar Registro' : 'Confirmar y Crear' }}
          </app-button-spinner>
        </div>
      </div>
    </div>
  `
})
export class MachineFormDialogComponent implements OnChanges {
  @Input() machineId: string | null = null;
  @Input() initialData: Partial<Machine> | null = null;
  @Input() saving = false;

  @Output() onSave = new EventEmitter<Partial<Machine>>();
  @Output() onCancel = new EventEmitter<void>();

  private session = inject(SessionService);
  config = this.session.config;
  readonly icons = { Cpu, Info };

  form = {
    name: '',
    model: '',
    nozzle: '0.4mm',
    maxFilaments: 1
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.form = {
        name: this.initialData.name || '',
        model: this.initialData.model || '',
        nozzle: this.initialData.nozzle || '0.4mm',
        maxFilaments: this.initialData.maxFilaments || 1
      };
    }
  }

  handleSave() {
    this.onSave.emit(this.form);
  }
}
