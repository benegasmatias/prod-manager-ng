import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, AlertTriangle, Trash2, Undo2, Plus, Search, PlusCircle, Clock, Settings, Layers, AlertOctagon, RefreshCw, Target } from 'lucide-angular';
import { Pedido, Rubro, Material } from '@shared/models';
import { cn } from '@shared/utils/cn';
import { getStatusLabel, getStatusStyles } from '@shared/utils/negocio-utils';
import { MaterialSelectorComponent } from '@shared/ui/material-selector/material-selector.component';

@Component({
  selector: 'app-failure-module',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule, 
    MaterialSelectorComponent
  ],
  templateUrl: './failure-module.component.html',
  styleUrls: ['./failure-module.component.css']
})
export class FailureModuleComponent {
  @Input({ required: true }) order!: Pedido;
  @Input({ required: true }) rubro!: Rubro;
  @Input({ required: true }) reason = signal<string>('');
  @Input({ required: true }) action = signal<'REDO' | 'DISCARD' | 'KEEP'>('REDO');
  @Input({ required: true }) wastedTime = signal<number>(0);
  @Input({ required: true }) materialWastes = signal<{ materialId: string, grams: number }[]>([]);
  @Input({ required: true }) materials: Material[] = [];

  @Output() onAddRow = new EventEmitter<void>();
  @Output() onSelectMaterial = new EventEmitter<number>();
  @Output() onRemoveMaterial = new EventEmitter<number>();
  @Output() onMaterialChange = new EventEmitter<{ index: number, materialId: string }>();
  @Output() onGramsChange = new EventEmitter<{ index: number, grams: number }>();

  readonly icons = {
    AlertTriangle, Trash2, Undo2, Plus, Search, PlusCircle, Clock, Settings, Layers, AlertOctagon, RefreshCw, Target
  };
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Math = Math;
  cn = cn;

  handleGramsChange(index: number, val: number) {
    const sanitizedVal = Math.max(0, val || 0);
    this.onGramsChange.emit({ index, grams: sanitizedVal });
  }

  getMaterial(id: string) { return this.materials.find(m => m.id === id); }
  getLabel(status: any) { return getStatusLabel(status); }
  getStyles(status: any) { return getStatusStyles(status); }

  getTotalWasted() {
    return this.materialWastes().reduce((acc, curr) => acc + (curr.grams || 0), 0);
  }
}
