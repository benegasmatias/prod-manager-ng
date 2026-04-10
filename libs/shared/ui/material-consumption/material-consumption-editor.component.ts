import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Layers } from 'lucide-angular';
import { Material } from '@shared/models';
import { MultiMaterial } from '@shared/models/material-consumption';
import { MaterialSelectorComponent } from '../material-selector/material-selector.component';

@Component({
  selector: 'app-material-consumption-editor',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule,
    MaterialSelectorComponent
  ],
  template: `
    <div class="space-y-4 relative z-10 animate-in fade-in slide-in-from-top-2 duration-500">
      <div class="flex items-center gap-2 mb-1">
        <div class="h-1 text-blue-500 bg-blue-500 rounded-full w-4"></div>
        <label class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          {{ label() }}
        </label>
      </div>
      
      <div class="grid grid-cols-1 gap-2">
        @for (mm of slots(); track $index) {
          <div class="flex gap-3 items-center group/slot bg-white dark:bg-zinc-900/60 p-1.5 rounded-2xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
            
            <!-- Indicador de Slot (S1, S2, etc) -->
            <div class="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400 group-hover/slot:text-blue-500 transition-colors border border-zinc-100 dark:border-zinc-700/50">
              S{{ $index + 1 }}
            </div>

            <!-- Custom Material Selector (Visual Color Swatch) -->
            <div class="flex-1">
              <app-material-selector
                [materials]="materials()"
                [selectedId]="mm.materialId"
                [readOnly]="readOnly()"
                (selectChange)="onMaterialChange($index, $event)"
              ></app-material-selector>
            </div>

            <!-- Input de Gramos -->
            <div class="relative w-24 group/input">
              <input
                type="number"
                min="0"
                class="w-full h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-3 pr-8 text-[12px] font-black text-blue-600 focus:outline-none text-right placeholder:text-zinc-300 transition-all focus:bg-blue-50 dark:focus:bg-blue-900/10 disabled:opacity-50"
                placeholder="0"
                [disabled]="readOnly()"
                [ngModel]="mm.gramsPerUnit || ''"
                (ngModelChange)="onGramsChange($index, $event)"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-400 group-focus-within/input:text-blue-500 transition-colors">g</span>
            </div>

          </div>
        }
      </div>
    </div>
  `
})
export class MaterialConsumptionEditorComponent {
  // Inputs
  label = input<string>('Consumo Estimado por Unidad');
  slots = input<MultiMaterial[]>([]);
  materials = input<Material[]>([]);
  readOnly = input<boolean>(false);

  // Outputs
  slotsChange = output<MultiMaterial[]>();

  readonly icons = { Layers };

  onMaterialChange(index: number, materialId: string) {
    const updated = [...this.slots()];
    updated[index] = { ...updated[index], materialId };
    this.slotsChange.emit(updated);
  }

  onGramsChange(index: number, value: any) {
    const grams = Math.max(0, Number(value) || 0);
    const updated = [...this.slots()];
    updated[index] = { ...updated[index], gramsPerUnit: grams };
    this.slotsChange.emit(updated);
  }
}
