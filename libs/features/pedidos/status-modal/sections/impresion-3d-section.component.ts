import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Layers, Cpu } from 'lucide-angular';
import { Machine, Material } from '@shared/models';

export interface MultiMaterial {
  materialId: string;
  gramsPerUnit: number;
}

@Component({
  selector: 'app-impresion-3d-section',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6 animate-in zoom-in-95 fade-in duration-300 p-6 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50 relative overflow-hidden group">
      <div class="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
        <lucide-angular [img]="icons.Layers" class="h-24 w-24"></lucide-angular>
      </div>

      <div class="space-y-3 relative z-10">
        <label class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2 px-1">
          <lucide-angular [img]="icons.Cpu" class="h-3 w-3"></lucide-angular>
          Unidad de Proceso
        </label>
        <div class="relative group/select">
          <select
            class="w-full h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 text-[13px] font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none text-zinc-900 dark:text-zinc-100 pr-10"
            [ngModel]="selectedMachineId()"
            (ngModelChange)="onMachineChange($event)"
          >
            <option value="">SELECCIONAR MÁQUINA...</option>
            @for (m of machines(); track m.id) {
              <option [value]="m.id">
                {{ m.name | uppercase }} — {{ m.status === 'IDLE' ? 'DISPONIBLE' : 'EN OPERACIÓN' }}
              </option>
            }
          </select>
          <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover/select:text-blue-500 transition-colors">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 10l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      @if (selectedMachineId() && multiMaterials().length > 0) {
        <div class="space-y-4 relative z-10 animate-in fade-in slide-in-from-top-2 duration-500">
          <div class="flex items-center gap-2 mb-1">
            <div class="h-1 text-blue-500 bg-blue-500 rounded-full w-4"></div>
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Consumo Estimado por Unidad</label>
          </div>
          
          <div class="grid grid-cols-1 gap-2">
            @for (mm of multiMaterials(); track $index) {
              <div class="flex gap-3 items-center group/slot bg-white dark:bg-zinc-900/60 p-1.5 rounded-2xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
                <div class="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400 group-hover/slot:text-blue-500 transition-colors border border-zinc-100 dark:border-zinc-700/50">
                  S{{ $index + 1 }}
                </div>
                <select
                  class="flex-1 h-10 bg-transparent text-[11px] font-black focus:outline-none text-zinc-700 dark:text-zinc-200 outline-none"
                  [ngModel]="mm.materialId"
                  (ngModelChange)="onMaterialChange($index, $event)"
                >
                  <option value="">SIN MATERIAL...</option>
                  @for (m of materials(); track m.id) {
                    <option [value]="m.id">{{ m.name }} — {{ m.color | uppercase }}</option>
                  }
                </select>
                <div class="relative w-24 group/input">
                  <input
                    type="number"
                    class="w-full h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-3 pr-8 text-[12px] font-black text-blue-600 focus:outline-none text-right placeholder:text-zinc-300 transition-all focus:bg-blue-50 dark:focus:bg-blue-900/10"
                    placeholder="0"
                    [ngModel]="mm.gramsPerUnit || ''"
                    (ngModelChange)="onGramsChange($index, $event)"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-400 group-focus-within/input:text-blue-500 transition-colors">g</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class Impresion3dSectionComponent {
  status = input<string>('');
  machines = input<Machine[]>([]);
  materials = input<Material[]>([]);
  selectedMachineId = input<string>('');
  multiMaterials = input<MultiMaterial[]>([]);

  machineChange = output<string>();
  multiMaterialsChange = output<MultiMaterial[]>();

  readonly icons = { Layers, Cpu };

  onMachineChange(id: string) {
    this.machineChange.emit(id);
    const machine = this.machines().find(m => m.id === id);
    if (machine) {
      const slots = machine.maxFilaments || 1;
      this.multiMaterialsChange.emit(
        Array(slots).fill(null).map(() => ({ materialId: '', gramsPerUnit: 0 }))
      );
    } else {
      this.multiMaterialsChange.emit([]);
    }
  }

  onMaterialChange(index: number, materialId: string) {
    const updated = [...this.multiMaterials()];
    updated[index] = { ...updated[index], materialId };
    this.multiMaterialsChange.emit(updated);
  }

  onGramsChange(index: number, grams: number | string) {
    const updated = [...this.multiMaterials()];
    updated[index] = { ...updated[index], gramsPerUnit: Number(grams) || 0 };
    this.multiMaterialsChange.emit(updated);
  }
}
