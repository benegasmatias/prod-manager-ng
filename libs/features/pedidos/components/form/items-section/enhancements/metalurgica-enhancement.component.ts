import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
  selector: 'app-metalurgica-item-enhancement',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './metalurgica-enhancement.component.html',
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
