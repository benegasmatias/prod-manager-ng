import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  computed,
  input,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Trash2, Zap, Check, Settings2, Sparkles, Clock, Layers, MousePointerClick, Info, Award } from 'lucide-angular';
import { MoneyInputComponent } from '@shared/ui/money-input/money-input.component';
import { NegocioConfig, Rubro } from '@shared/models/negocio';
import { cn } from '@shared/utils/cn';
import { OrderCalculatorService } from '../../../services/order-calculator.service';
import { SessionService } from '@core/session/session.service';

// enhancements
import { MetalurgicaItemEnhancementComponent } from './enhancements/metalurgica-enhancement.component';
import { Print3dItemEnhancementComponent } from './enhancements/print3d-enhancement.component';

@Component({
  selector: 'app-item-details-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    MoneyInputComponent,
    MetalurgicaItemEnhancementComponent,
    Print3dItemEnhancementComponent,
    CurrencyPipe
  ],
  templateUrl: './item-details-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetailsFormComponent {
  @Input({ required: true }) item: any;
  index = input.required<number>();
  config = input.required<NegocioConfig>();
  canRemove = input(false);
  rubro = input.required<Rubro>();
  orderType = input<'CLIENT' | 'STOCK'>('CLIENT');
  isSaving = input(false);

  private calculator = inject(OrderCalculatorService);
  private session = inject(SessionService);

  isArgentina = computed(() => this.session.activeNegocio()?.moneda === 'ARS');

  @Output() onRemove = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<void>();
  @Output() onFileUpload = new EventEmitter<string>();
  @Output() onFileDelete = new EventEmitter<string>();

  showAdvanced = signal(false);
  selectedPreset = signal<string | null>(null);

  applyTemplate(type: 'SMALL' | 'MEDIUM' | 'LARGE') {
    this.selectedPreset.set(type);
    
    if (this.rubro() === 'IMPRESION_3D') {
      const templates = {
        'SMALL': { peso: 20, mins: 120, name: 'Pieza Pequeña' },
        'MEDIUM': { peso: 80, mins: 360, name: 'Pieza Mediana' },
        'LARGE': { peso: 300, mins: 1200, name: 'Pieza Grande' }
      };
      const t = templates[type];
      this.item.peso_gramos = t.peso;
      this.item.duracion_estimada_minutos = t.mins;
      if (!this.item.nombreProducto) this.item.nombreProducto = t.name;
    } else if (this.rubro() === 'METALURGICA') {
      const templates = {
        'SMALL': { hrs: 1, name: 'Reparación / Trabajo Rápido' },
        'MEDIUM': { hrs: 4, name: 'Fabricación Estándar' },
        'LARGE': { hrs: 12, name: 'Estructura / Trabajo Complejo' }
      };
      const t = templates[type];
      this.item.duracion_estimada_minutos = t.hrs * 60;
      if (!this.item.nombreProducto) this.item.nombreProducto = t.name;
    }
    
    // Auto-calculate suggested price if possible
    const suggested = this.getSuggestedPrice();
    if (suggested > 0) {
      this.item.precioUnitario = Math.round(suggested);
    }

    this.onUpdate.emit();
    
    // Auto-focus name field after selection
    setTimeout(() => {
      const input = document.querySelector(`[data-item-input="${this.index()}"]`) as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  }

  getItemTotal(): number {
    return this.calculator.calculateItem(this.item, this.rubro()).total;
  }

  isItemPending = computed(() => {
    const total = this.getItemTotal();
    // Item is pending if total is 0 OR if core technical fields are missing/zero
    // but the user has started filling it (has a name or description)
    const hasBasis = !!(this.item.nombreProducto || this.item.descripcion);
    return hasBasis && (total <= 0 || (!this.item.peso_gramos && this.rubro() === 'IMPRESION_3D'));
  });

  getSuggestedPrice(): number {
    const costoKg = Number(this.item.precioBobinaKg) || 0;
    const gramos = Number(this.item.peso_gramos) || 0;
    if (costoKg <= 0 || gramos <= 0) return 0;
    // (Costo de 1 gramo) * gramos * 3 (Multiplicador de ganancia base)
    return (costoKg / 1000) * gramos * 3;
  }

  applySuggestedPrice() {
    const suggested = this.getSuggestedPrice();
    if (suggested > 0) {
      this.item.precioUnitario = Math.round(suggested);
      this.onUpdate.emit();
    }
  }

  getHoursValue(totalMin: number): number {
    return Math.floor((Number(totalMin) || 0) / 60);
  }

  getMinutesRemainder(totalMin: number): number {
    return (Number(totalMin) || 0) % 60;
  }

  updateMinutesFromHs(hs: number) {
    const currentMin = this.getMinutesRemainder(this.item['duracion_estimada_minutos']);
    const h = Math.max(0, Number(hs) || 0);
    this.item['duracion_estimada_minutos'] = (h * 60) + currentMin;
    this.onUpdate.emit();
  }

  updateMinutesFromMin(min: number) {
    const currentHs = this.getHoursValue(this.item['duracion_estimada_minutos']);
    const m = Math.max(0, Number(min) || 0);
    this.item['duracion_estimada_minutos'] = (currentHs * 60) + (m % 60);
    this.onUpdate.emit();
  }

  readonly icons = { Trash2, Zap, Check, Settings2, Sparkles, Clock, Layers, MousePointerClick, Info, Award };

  sectionedFields = computed(() => {
    const sections: { name: string, fields: any[] }[] = [];
    const fields = this.config().itemFields || [];

    fields.forEach(f => {
      const sName = f.section || 'General';
      let section = sections.find(s => s.name === sName);
      if (!section) {
        section = { name: sName, fields: [] };
        sections.push(section);
      }
      section.fields.push(f);
    });

    return sections;
  });

  isFieldVisible(f: any): boolean {
    if (f.visibleIf) {
      const dependentValue = this.item[f.visibleIf.key];
      if (!dependentValue || !f.visibleIf.values.includes(dependentValue)) {
        return false;
      }
    }

    if (this.rubro() === 'IMPRESION_3D') {
      if (f.key === 'url_stl' && this.item['seDiseñaSTL']) return false;
      if (f.key === 'precioDiseno' && !this.item['seDiseñaSTL']) return false;
    }

    return true;
  }

  isFieldBasic(f: any): boolean {
    const basics = ['nombreProducto', 'descripcion', 'cantidad', 'tipo_trabajo', 'medidas', 'tipo_filamento'];
    return basics.includes(f.key);
  }

  hasVisibleFields(section: any): boolean {
    return section.fields.some((f: any) => 
      this.isFieldVisible(f) && (this.isFieldBasic(f) || this.showAdvanced())
    );
  }

  applyEnhancement(data: any) {
    Object.assign(this.item, data);
    this.onUpdate.emit();
  }

  cn = cn;
}
