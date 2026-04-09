import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Layers, Cpu } from 'lucide-angular';
import { Machine, Material } from '@shared/models';
import { MultiMaterial } from '@shared/models/material-consumption';
import { MaterialConsumptionEditorComponent } from '@shared/ui/material-consumption/material-consumption-editor.component';

@Component({
  selector: 'app-impresion-3d-section',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule,
    MaterialConsumptionEditorComponent
  ],
  template: `
    <div class="space-y-6 animate-in zoom-in-95 fade-in duration-300 p-6 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50 relative overflow-hidden group">
      
      <!-- Watermark Background -->
      <div class="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
        <lucide-angular [img]="icons.Layers" class="h-24 w-24"></lucide-angular>
      </div>

      <!-- Machine Selector -->
      <div class="space-y-3 relative z-10">
        <label class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2 px-1">
          <lucide-angular [img]="icons.Cpu" class="h-3 w-3"></lucide-angular>
          Unidad de Proceso (Máquina)
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

      <!-- Shared Material Consumption Editor -->
      @if (selectedMachineId() && multiMaterials().length > 0) {
        <app-material-consumption-editor
          [slots]="multiMaterials()"
          [materials]="materials()"
          (slotsChange)="onMaterialsUpdate($event)"
        ></app-material-consumption-editor>
      }
    </div>
  `
})
export class Impresion3dSectionComponent {
  // Inputs
  status = input<string>('');
  machines = input<Machine[]>([]);
  materials = input<Material[]>([]);
  selectedMachineId = input<string>('');
  multiMaterials = input<MultiMaterial[]>([]);

  // Outputs
  machineChange = output<string>();
  multiMaterialsChange = output<MultiMaterial[]>();

  readonly icons = { Layers, Cpu };

  /**
   * Maneja el cambio de máquina y reinicializa los slots de material
   * según la capacidad técnica de la máquina seleccionada.
   */
  onMachineChange(id: string) {
    this.machineChange.emit(id);
    const machine = this.machines().find(m => m.id === id);
    
    if (machine) {
      const slotsCount = machine.maxFilaments || 1;
      this.multiMaterialsChange.emit(
        Array(slotsCount).fill(null).map(() => ({ materialId: '', gramsPerUnit: 0 }))
      );
    } else {
      this.multiMaterialsChange.emit([]);
    }
  }

  /**
   * Recibe el nuevo array de materiales ya validado y saneado
   * por el componente compartido.
   */
  onMaterialsUpdate(updated: MultiMaterial[]) {
    this.multiMaterialsChange.emit(updated);
  }
}
