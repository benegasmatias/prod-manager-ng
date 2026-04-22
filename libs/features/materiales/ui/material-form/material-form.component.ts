import { Component, input, output, model, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Package, ChevronDown } from 'lucide-angular';
import { ButtonSpinnerComponent } from '../../../../shared/ui/button-spinner/button-spinner.component';
import { NegocioConfig } from '../../../../shared/models/negocio';
import { cn } from '../../../../shared/utils/cn';

@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonSpinnerComponent],
  templateUrl: './material-form.component.html',
  styleUrls: ['./material-form.component.scss']
})
export class MaterialFormComponent {
  isOpen = model.required<boolean>();
  materialId = input<string | null>(null);
  config = input.required<NegocioConfig>();
  saving = input<boolean>(false);
  suggestedBrands = input<string[]>([]);
  
  // Form Signals (Managed by parent or model?)
  // For Phase 1, we will keep them as models to sync back easily
  name = model<string>('');
  brand = model<string>('');
  color = model<string>('#cccccc');
  type = model<string>('PLA');
  unit = model<string>('g');
  weight = model<number>(1000);
  remainingWeight = model<number>(1000);
  bedTemp = model<number | null>(null);
  nozzleTemp = model<number | null>(null);
  costPerKg = model<number>(0);

  onSave = output<void>();
  onCancel = output<void>();
  onWeightChange = output<number>();

  readonly icons = { Package, ChevronDown };
  presetColors = [
    { name: 'Negro', hex: '#000000' },
    { name: 'Blanco', hex: '#ffffff' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Rojo', hex: '#ef4444' },
    { name: 'Azul', hex: '#3b82f6' },
    { name: 'Verde', hex: '#22c55e' },
    { name: 'Amarillo', hex: '#eab308' },
    { name: 'Naranja', hex: '#f97316' },
  ];

  cn = cn;
}
