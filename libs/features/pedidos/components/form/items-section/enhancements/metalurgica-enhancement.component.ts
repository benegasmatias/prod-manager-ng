import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
  selector: 'app-metalurgica-item-enhancement',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-indigo-50/50 dark:bg-zinc-950/20 p-5 rounded-[1.5rem] border border-indigo-100/50 dark:border-indigo-900/30">
      <div class="flex items-center gap-2 mb-3">
        <lucide-angular [img]="icons.Check" class="h-3 w-3 text-indigo-400"></lucide-angular>
        <span class="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400/80 uppercase tracking-widest leading-relaxed">
          Plantillas de Ingeniería
        </span>
      </div>
      <div class="flex flex-wrap gap-2">
        @for (tpl of metalTemplates; track tpl.label) {
          <button
            type="button"
            (click)="onApply.emit(tpl.data)"
            class="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-800/50 transition-all hover:border-indigo-500"
          >
            {{ tpl.label }}
          </button>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetalurgicaItemEnhancementComponent {
  @Output() onApply = new EventEmitter<any>();
  readonly icons = { Check };

  metalTemplates = [
    { label: 'Portón', data: { tipo_trabajo: 'Portón', typeAperture: 'CORREDIZO', material_estructura: 'Caño 40x40', fillMaterial: 'CHAPA' } },
    { label: 'Reja', data: { tipo_trabajo: 'Reja', fillMaterial: 'BARROTES', material_estructura: 'Hierro Redondo 1/2"' } },
    { label: 'Puerta Reja', data: { tipo_trabajo: 'Puerta', typeAperture: 'BATIENTE', fillMaterial: 'BARROTES', accessories: ['CERRADURA', 'BISAGRAS'] } },
    { label: 'Tinglado', data: { tipo_trabajo: 'Estructura', material_estructura: 'Perfil C 100x50', fillMaterial: 'CHAPA' } },
  ];
}
