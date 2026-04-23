import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { LucideAngularModule, X, Check, Loader2, Sparkles, Plus, Trash2 } from 'lucide-angular';
import { PlatformAdminService } from '@features/platform-admin/services/platform-admin.service';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-plan-editor-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div class="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/20 shrink-0">
          <div>
            <h3 class="text-xl font-black text-white uppercase tracking-tight">{{ plan ? 'Editar Plan' : 'Nuevo Plan' }}</h3>
            <p class="text-xs font-bold text-zinc-500 uppercase tracking-widest">Define las condiciones comerciales del servicio</p>
          </div>
          <button (click)="close.emit()" class="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-all">
            <lucide-angular [img]="icons.X" class="h-5 w-5"></lucide-angular>
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-8 overflow-y-auto custom-scrollbar">
          <form [formGroup]="form" class="space-y-8">
            
            <!-- Basic Info Area -->
            <div class="grid grid-cols-2 gap-6 text-left">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Nombre del Plan</label>
                <input 
                  type="text" 
                  formControlName="name"
                  class="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:border-primary focus:ring-0 transition-all placeholder:text-zinc-600"
                  placeholder="Ej: Profesional"
                >
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Rubro (Categoría)</label>
                <select 
                  formControlName="category"
                  class="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:border-primary focus:ring-0 transition-all cursor-pointer"
                >
                  <option [value]="null">SISTEMA (Global)</option>
                  <option value="IMPRESION_3D">Impresión 3D</option>
                  <option value="METALURGICA">Metalúrgica</option>
                  <option value="CARPINTERIA">Carpintería</option>
                  <option value="KIOSCO">Kiosco</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6 text-left">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Precio Mensual</label>
                <div class="relative">
                  <input 
                    type="number" 
                    formControlName="price"
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:border-primary focus:ring-0 transition-all pl-10"
                  >
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Días de Prueba (Trial)</label>
                <input 
                  type="number" 
                  formControlName="trialDays"
                  class="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:border-primary focus:ring-0 transition-all"
                >
              </div>
            </div>

            <div class="space-y-2 text-left">
              <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Descripción Corta</label>
              <textarea 
                formControlName="description"
                rows="2"
                class="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:border-primary focus:ring-0 transition-all resize-none"
                placeholder="Explica qué incluye este plan..."
              ></textarea>
            </div>

            <!-- Limits Grid -->
            <div>
              <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 block ml-1 text-left">Límites y Cuotas</label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                <div class="bg-zinc-800/30 border border-zinc-800 p-4 rounded-2xl space-y-2">
                   <label class="text-[9px] font-black text-zinc-600 uppercase italic">Usuarios</label>
                   <input type="number" formControlName="maxUsers" class="w-full bg-transparent border-0 p-0 text-white font-bold focus:ring-0 text-sm">
                </div>
                <div class="bg-zinc-800/30 border border-zinc-800 p-4 rounded-2xl space-y-2">
                   <label class="text-[9px] font-black text-zinc-600 uppercase italic">Pedidos/Mes</label>
                   <input type="number" formControlName="maxOrdersPerMonth" class="w-full bg-transparent border-0 p-0 text-white font-bold focus:ring-0 text-sm">
                </div>
                <div class="bg-zinc-800/30 border border-zinc-800 p-4 rounded-2xl space-y-2">
                   <label class="text-[9px] font-black text-zinc-600 uppercase italic">Máquinas</label>
                   <input type="number" formControlName="maxMachines" class="w-full bg-transparent border-0 p-0 text-white font-bold focus:ring-0 text-sm">
                </div>
                <div class="bg-zinc-800/30 border border-zinc-800 p-4 rounded-2xl space-y-2">
                   <label class="text-[9px] font-black text-zinc-600 uppercase italic">Negocios</label>
                   <input type="number" formControlName="maxBusinesses" class="w-full bg-transparent border-0 p-0 text-white font-bold focus:ring-0 text-sm">
                </div>
              </div>
            </div>

            <!-- Features Area -->
            <div class="space-y-4 text-left">
              <div class="flex items-center justify-between ml-1">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Características (Lista)</label>
                <button type="button" (click)="addFeature()" class="text-[10px] font-black text-primary uppercase flex items-center gap-1 hover:underline">
                  <lucide-angular [img]="icons.Plus" class="h-3 w-3"></lucide-angular>
                  Agregar Item
                </button>
              </div>
              
              <div class="space-y-2" formArrayName="features">
                @for (feat of featuresControls; track $index) {
                  <div class="flex items-center gap-2 group animate-in slide-in-from-left-2 duration-300">
                    <div class="flex-1 bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 flex items-center gap-3">
                      <lucide-angular [img]="icons.Sparkles" class="h-3.5 w-3.5 text-zinc-500"></lucide-angular>
                      <input 
                        type="text" 
                        [formControlName]="$index"
                        class="flex-1 bg-transparent border-0 p-0 text-zinc-300 text-xs font-bold focus:ring-0"
                        placeholder="Nueva característica..."
                      >
                    </div>
                    <button (click)="removeFeature($index)" class="h-10 w-10 flex items-center justify-center text-zinc-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                      <lucide-angular [img]="icons.Trash2" class="h-4 w-4"></lucide-angular>
                    </button>
                  </div>
                }
              </div>
            </div>

            <!-- Options -->
            <div class="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 ml-1">
              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" formControlName="isRecommended" class="w-5 h-5 rounded-lg bg-zinc-800 border-zinc-700 text-primary focus:ring-0 focus:ring-offset-0 transition-all border-2">
                <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">Destacar como recomendado</span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" formControlName="hasTrial" class="w-5 h-5 rounded-lg bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0 focus:ring-offset-0 transition-all border-2">
                <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">Habilitar Prueba (Trial)</span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" formControlName="active" class="w-5 h-5 rounded-lg bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 transition-all border-2">
                <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">Plan Activo</span>
              </label>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="px-8 py-6 bg-zinc-800/20 border-t border-zinc-800 flex justify-end gap-3 shrink-0">
          <button 
            (click)="close.emit()" 
            class="px-6 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white font-black text-[11px] uppercase tracking-widest transition-all"
          >
            Cancelar
          </button>
          <button 
            (click)="save()" 
            [disabled]="saving() || form.invalid"
            class="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center gap-2 group disabled:opacity-50"
          >
            <lucide-angular *ngIf="saving()" [img]="icons.Loader2" class="h-4 w-4 animate-spin"></lucide-angular>
            <span>{{ saving() ? 'Guardando...' : 'Guardar Cambios' }}</span>
            <lucide-angular *ngIf="!saving()" [img]="icons.Check" class="h-4 w-4 group-hover:scale-110 transition-transform"></lucide-angular>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
  `]
})
export class PlanEditorModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(PlatformAdminService);
  private toast = inject(ToastService);

  @Input() plan: any;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  readonly icons = { X, Check, Loader2, Sparkles, Plus, Trash2 };

  form: FormGroup;
  saving = signal<boolean>(false);

  get features() {
    return this.form.get('features') as FormArray;
  }

  get featuresControls() {
    return this.features.controls;
  }

  constructor() {
    LucideAngularModule.pick(this.icons);
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      category: [null],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      currency: ['ARS'],
      maxUsers: [1],
      maxOrdersPerMonth: [30],
      maxMachines: [1],
      maxBusinesses: [1],
      isRecommended: [false],
      active: [true],
      sortOrder: [0],
      hasTrial: [false],
      trialDays: [0],
      features: this.fb.array([])
    });
  }

  ngOnInit() {
    if (this.plan) {
      this.form.patchValue(this.plan);
      if (this.plan.features) {
        this.plan.features.forEach((f: string) => this.addFeature(f));
      }
    }

    // Sync trialDays with hasTrial flag
    this.form.get('trialDays')?.valueChanges.subscribe(val => {
      const hasTrial = this.form.get('hasTrial');
      if (val > 0 && !hasTrial?.value) {
        hasTrial?.setValue(true, { emitEvent: false });
      } else if (val <= 0 && hasTrial?.value) {
        hasTrial?.setValue(false, { emitEvent: false });
      }
    });

    this.form.get('hasTrial')?.valueChanges.subscribe(val => {
      const trialDays = this.form.get('trialDays');
      if (!val && trialDays?.value > 0) {
        trialDays?.setValue(0, { emitEvent: false });
      } else if (val && trialDays?.value <= 0) {
        trialDays?.setValue(7, { emitEvent: false }); // Default to 7 days if enabled
      }
    });
  }

  addFeature(value: string = '') {
    this.features.push(this.fb.control(value));
  }

  removeFeature(index: number) {
    this.features.removeAt(index);
  }

  async save() {
    if (this.form.invalid) return;

    try {
      this.saving.set(true);
      const rawValue = this.form.value;
      const data = {
        ...rawValue,
        price: Number(rawValue.price),
        maxUsers: Number(rawValue.maxUsers),
        maxOrdersPerMonth: Number(rawValue.maxOrdersPerMonth),
        maxMachines: Number(rawValue.maxMachines),
        maxBusinesses: Number(rawValue.maxBusinesses),
        sortOrder: Number(rawValue.sortOrder),
        trialDays: Number(rawValue.trialDays),
        features: rawValue.features.filter((f: string) => !!f.trim())
      };

      await this.adminService.updatePlan(this.plan.id, data);
      
      this.toast.success('Plan actualizado correctamente');
      this.updated.emit();
      this.close.emit();
    } catch (e: any) {
      this.toast.error('Error al actualizar plan: ' + (e?.message || 'Error desconocido'));
    } finally {
      this.saving.set(false);
    }
  }
}
