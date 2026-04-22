import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Package, Trash2, Droplets, Weight, MoreVertical, Search, AlertTriangle, Edit2, Activity, ChevronDown, Plus } from 'lucide-angular';
import { MaterialesService } from '../../core/api/materiales.service';
import { SessionService } from '../../core/session/session.service';
import { Material } from '../../shared/models/material';
import { ButtonSpinnerComponent } from '../../shared/ui/button-spinner/button-spinner.component';
import { ConfirmService } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { cn } from '../../shared/utils/cn';

import { MaterialStatsComponent } from './ui/material-stats/material-stats.component';
import { MaterialCardComponent } from './ui/material-card/material-card.component';
import { MaterialFormComponent } from './ui/material-form/material-form.component';

@Component({
  selector: 'app-materiales-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule, 
    MaterialStatsComponent, 
    MaterialCardComponent,
    MaterialFormComponent
  ],
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.scss']
})
export class MaterialesPageComponent implements OnInit {
  private service = inject(MaterialesService);
  public session = inject(SessionService);
  private confirmService = inject(ConfirmService);

  readonly icons = { Search, Plus, Package };

  // Expose signals from service
  loading = this.service.loading;
  saving = this.service.saving;
  materials = this.service.items;
  stats = this.service.stats;
  config = computed(() => this.session.config());
  negocio = computed(() => this.session.activeNegocio());

  // UI State
  searchTerm = signal('');
  isDialogOpen = signal(false);
  selectedMaterialId = signal<string | null>(null);

  // Form State
  formName = signal('');
  formColor = signal('#cccccc');
  formBrand = signal('');
  formType = signal('PLA');
  formUnit = signal('g');
  formWeight = signal(1000);
  formRemainingWeight = signal(1000);
  formBedTemp = signal<number | null>(null);
  formNozzleTemp = signal<number | null>(null);
  formCostPerKg = signal(0);
  
  suggestedBrands = ['GST', 'Grillon3D', 'PrintALot', '3N3', 'Hellbot', 'Esun', 'Sunlu', 'Creality'];

  filteredMaterials = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const list = this.materials();
    if (!term) return list;

    return list.filter(m => 
      (m.name?.toLowerCase().includes(term)) ||
      (m.brand?.toLowerCase().includes(term)) ||
      (m.type?.toLowerCase().includes(term))
    );
  });


  constructor() {
    effect(() => {
      const activeId = this.session.activeNegocio()?.id;
      if (activeId) {
        this.service.loadMateriales();
        this.resetForm(); // Sync defaults from config
      }
    });
  }

  ngOnInit() {}

  resetForm() {
    this.selectedMaterialId.set(null);
    this.formName.set('');
    this.formColor.set('#cccccc');
    this.formBrand.set('');
    
    const cfg = this.config();
    this.formType.set(cfg?.materialConfig?.defaultType || 'PLA');
    this.formUnit.set(cfg?.materialConfig?.defaultUnit || 'g');
    
    this.formWeight.set(1000);
    this.formRemainingWeight.set(1000);
    this.formBedTemp.set(null);
    this.formNozzleTemp.set(null);
    this.formCostPerKg.set(0);
  }

  openNew() {
    this.resetForm();
    this.isDialogOpen.set(true);
  }

  editMaterial(mat: Material) {
    this.selectedMaterialId.set(mat.id);
    this.formName.set(mat.name || '');
    this.formColor.set(mat.color || '#cccccc');
    this.formBrand.set(mat.brand || '');
    this.formType.set(mat.type || 'PLA');
    this.formUnit.set(mat.unit || (this.negocio()?.rubro === 'IMPRESION_3D' ? 'g' : 'm'));
    this.formWeight.set(mat.totalWeightGrams || 1000);
    this.formRemainingWeight.set(mat.remainingWeightGrams || 0);
    this.formBedTemp.set(mat.bedTemperature || null);
    this.formNozzleTemp.set(mat.nozzleTemperature || null);
    this.formCostPerKg.set(mat.costPerKg || 0);
    this.isDialogOpen.set(true);
  }

  async handleDelete(id: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar recurso',
      message: '¿Estás seguro de eliminar este recurso? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      await this.service.deleteMaterial(id);
    } catch(e) {
      alert('Error al eliminar');
    }
  }

  async handleSave() {
    if (!this.formName()) {
      alert('El nombre es obligatorio');
      return;
    }

    const payload: Partial<Material> = {
      name: this.formName(),
      color: this.formColor(),
      brand: this.formBrand(),
      type: this.formType(),
      totalWeightGrams: this.formWeight(),
      remainingWeightGrams: this.formRemainingWeight(),
      unit: this.formUnit(),
      costPerKg: this.formCostPerKg(),
      bedTemperature: this.formBedTemp() || undefined,
      nozzleTemperature: this.formNozzleTemp() || undefined,
      businessId: this.negocio()?.id
    };

    try {
      if (this.selectedMaterialId()) {
        await this.service.updateMaterial(this.selectedMaterialId()!, payload);
      } else {
        await this.service.createMaterial(payload);
      }
      this.isDialogOpen.set(false);
      this.resetForm();
    } catch(e) {
      alert('Error guardando material');
    }
  }

  onWeightChange(val: number) {
    this.formWeight.set(val);
    if (!this.selectedMaterialId()) {
      this.formRemainingWeight.set(val);
    }
  }


  cn = cn;
}
