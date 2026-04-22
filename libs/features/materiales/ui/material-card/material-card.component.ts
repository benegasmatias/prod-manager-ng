import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Edit2, Trash2, Weight, Activity, Droplets } from 'lucide-angular';
import { Material } from '../../../../shared/models/material';
import { NegocioConfig } from '../../../../shared/models/negocio';
import { cn } from '../../../../shared/utils/cn';

@Component({
  selector: 'app-material-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './material-card.component.html',
  styleUrls: ['./material-card.component.scss']
})
export class MaterialCardComponent {
  material = input.required<Material>();
  config = input.required<NegocioConfig>();
  
  onEdit = output<Material>();
  onDelete = output<string>();

  readonly icons = { Edit2, Trash2, Weight, Activity, Droplets };

  getPercent() {
    const mat = this.material();
    if (!mat.totalWeightGrams) return 0;
    return Math.round((mat.remainingWeightGrams / mat.totalWeightGrams) * 100);
  }

  cn = cn;
}
