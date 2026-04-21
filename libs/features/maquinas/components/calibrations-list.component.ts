import { Component, Input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Beaker, Plus, Trash2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-angular';
import { CalibrationsService } from '@core/api/calibrations.service';
import { MaterialesService } from '@core/api/materiales.service';
import { Calibration } from '@shared/models/calibration';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calibrations-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="h-1 w-4 rounded-full bg-primary/30"></div>
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Tests de Calidad</h3>
        </div>
        <button 
          (click)="showForm.set(!showForm())"
          class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all group"
        >
          <lucide-angular [img]="icons.Plus" class="h-3 w-3 text-primary"></lucide-angular>
          <span class="text-[9px] font-black text-primary uppercase tracking-widest">Nuevo Test</span>
        </button>
      </div>

      <!-- New Test Form -->
      @if (showForm()) {
        <div class="p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border border-primary/20 animate-in zoom-in-95 duration-300">
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="col-span-2 sm:col-span-1">
              <label class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-4 mb-2 block">Tipo de Prueba</label>
              <select 
                [(ngModel)]="newTest.testType"
                class="w-full h-12 px-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="Torre de Temperatura">Torre de Temperatura</option>
                <option value="Retracciones">Test de Retracciones</option>
                <option value="Flujo / Extrusión">Calib. de Flujo (Flow)</option>
                <option value="Generico">Otro (Personalizado)</option>
              </select>
            </div>

            <div class="col-span-2 sm:col-span-1">
              <label class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-4 mb-2 block">Filamento</label>
              <select 
                [(ngModel)]="newTest.materialId"
                class="w-full h-12 px-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option [value]="undefined">Cualquiera / Genérico</option>
                @for (mat of materiales.items(); track mat.id) {
                  <option [value]="mat.id">{{ mat.brand }} - {{ mat.color }} ({{ mat.name }})</option>
                }
              </select>
            </div>

            <!-- Predefined Common Parameters based on testType -->
            @if (newTest.testType === 'Torre de Temperatura') {
              <div class="col-span-2 sm:col-span-1">
                <label class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-4 mb-2 block">Temp. Nozzle (°C)</label>
                <input type="number" [(ngModel)]="newTest.params.temp_nozzle" placeholder="Ej: 215" class="w-full h-12 px-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold outline-none" />
              </div>
              <div class="col-span-2 sm:col-span-1">
                <label class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-4 mb-2 block">Temp. Cama (°C)</label>
                <input type="number" [(ngModel)]="newTest.params.temp_bed" placeholder="Ej: 60" class="w-full h-12 px-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold outline-none" />
              </div>
            } @else if (newTest.testType === 'Retracciones') {
              <div class="col-span-2 sm:col-span-1">
                <label class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-4 mb-2 block">Distancia (mm)</label>
                <input type="number" step="0.1" [(ngModel)]="newTest.params.retraction_dist" placeholder="Ej: 4.5" class="w-full h-12 px-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold outline-none" />
              </div>
              <div class="col-span-2 sm:col-span-1">
                <label class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-4 mb-2 block">Velocidad (mm/s)</label>
                <input type="number" [(ngModel)]="newTest.params.retraction_speed" placeholder="Ej: 40" class="w-full h-12 px-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold outline-none" />
              </div>
            } @else if (newTest.testType === 'Flujo / Extrusión') {
              <div class="col-span-2">
                <label class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-4 mb-2 block">Multiplicador de Flujo (%)</label>
                <input type="number" step="0.01" [(ngModel)]="newTest.params.flow" placeholder="Ej: 0.98" class="w-full h-12 px-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold outline-none" />
              </div>
            } @else {
               <div class="col-span-2">
                <label class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-4 mb-2 block">Resumen del Resultado</label>
                <input [(ngModel)]="newTest.summary" placeholder="Ej: Impresión Perfecta / Falló en voladizos" class="w-full h-12 px-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold outline-none" />
              </div>
            }
          </div>

          <!-- Dynamic Key-Value Pairs -->
          <div class="space-y-4 mb-6">
            <div class="flex items-center gap-2">
              <div class="h-1 w-2 rounded-full bg-primary/20"></div>
              <h4 class="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Atributos Extra (Opcional)</h4>
            </div>
            
            <div class="grid grid-cols-12 gap-2">
              @for (attr of newTest.customAttrs; track $index) {
                <div class="col-span-5">
                  <input [(ngModel)]="attr.key" placeholder="Clave (ej: Ventilador)" class="w-full h-9 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-[10px] font-bold" />
                </div>
                <div class="col-span-5">
                  <input [(ngModel)]="attr.value" placeholder="Valor (ej: 100%)" class="w-full h-9 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-[10px] font-bold" />
                </div>
                <div class="col-span-2 flex justify-end">
                  <button (click)="removeAttr($index)" class="h-9 w-9 text-red-400 hover:text-red-500"><lucide-angular [img]="icons.Trash2" class="h-4 w-4"></lucide-angular></button>
                </div>
              }
            </div>
            <button (click)="addAttr()" class="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
               <lucide-angular [img]="icons.Plus" class="h-3 w-3"></lucide-angular> Agregar Atributo
            </button>
          </div>

          <div class="flex gap-2 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button (click)="showForm.set(false)" class="h-10 px-6 text-[10px] font-black uppercase text-zinc-400 hover:text-zinc-600 transition-colors">Cancelar</button>
            <button (click)="saveTest()" [disabled]="!newTest.testType" class="h-10 px-6 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Guardar Resultados</button>
          </div>
        </div>
      }

      <!-- Test List -->
      <div class="space-y-4">
        @for (test of calibrations.items(); track test.id) {
          <div class="group p-6 rounded-[2.5rem] bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-5 min-w-0">
                <div class="h-12 w-12 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center shadow-sm shrink-0">
                  <lucide-angular [img]="icons.Beaker" class="h-6 w-6 text-zinc-400 group-hover:text-primary transition-colors"></lucide-angular>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{{ test.testType }}</p>
                  <p class="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {{ test.material ? (test.material.brand + ' ' + test.material.color) : 'Calibración General' }}
                  </p>
                </div>
              </div>
              <button 
                (click)="calibrations.remove(test.id, machineId)"
                class="h-9 w-9 rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all opacity-0 group-hover:opacity-100 shrink-0"
              >
                <lucide-angular [img]="icons.Trash2" class="h-4 w-4"></lucide-angular>
              </button>
            </div>

            <!-- Results Grid -->
            <div class="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              @if (test.results?.temp_nozzle) {
                <div class="p-3 rounded-2xl bg-white/50 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/50">
                  <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Nozzle</p>
                  <p class="text-xs font-black text-zinc-900 dark:text-zinc-100">{{ test.results.temp_nozzle }}°C</p>
                </div>
              }
              @if (test.results?.temp_bed) {
                <div class="p-3 rounded-2xl bg-white/50 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/50">
                  <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Cama</p>
                  <p class="text-xs font-black text-zinc-900 dark:text-zinc-100">{{ test.results.temp_bed }}°C</p>
                </div>
              }
              @if (test.results?.retraction_dist) {
                <div class="p-3 rounded-2xl bg-white/50 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/50">
                  <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Retracción</p>
                  <p class="text-xs font-black text-zinc-900 dark:text-zinc-100">{{ test.results.retraction_dist }}mm @ {{ test.results.retraction_speed }}mm/s</p>
                </div>
              }
              @if (test.results?.flow) {
                <div class="p-3 rounded-2xl bg-white/50 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/50">
                  <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Flujo</p>
                  <p class="text-xs font-black text-zinc-900 dark:text-zinc-100">{{ test.results.flow * 100 }}%</p>
                </div>
              }
              @if (test.results?.summary) {
                <div class="col-span-2 p-3 rounded-2xl bg-white/50 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/50">
                  <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Nota</p>
                  <p class="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 italic">"{{ test.results.summary }}"</p>
                </div>
              }
               <!-- Custom Attributes -->
               @for (resKey of Object.keys(test.results || {}); track resKey) {
                 @if (!['temp_nozzle', 'temp_bed', 'retraction_dist', 'retraction_speed', 'flow', 'summary', 'param'].includes(resKey)) {
                  <div class="p-3 rounded-2xl bg-white/50 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/50">
                    <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">{{ resKey }}</p>
                    <p class="text-xs font-black text-zinc-900 dark:text-zinc-100">{{ test.results[resKey] }}</p>
                  </div>
                 }
               }
            </div>
          </div>
        } @empty {
          <div class="py-12 text-center border-2 border-dashed rounded-[3rem] border-zinc-100 dark:border-zinc-800 bg-zinc-50/5 flex flex-col items-center justify-center gap-3">
            <lucide-angular [img]="icons.Beaker" class="h-6 w-6 text-zinc-200 dark:text-zinc-800"></lucide-angular>
            <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Sin Tests de Taller</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class CalibrationsListComponent {
  @Input() machineId!: string;
  
  calibrations = inject(CalibrationsService);
  materiales = inject(MaterialesService);
  
  showForm = signal(false);
  
  newTest = {
    testType: 'Torre de Temperatura',
    materialId: undefined as string | undefined,
    summary: '',
    params: {
      temp_nozzle: null,
      temp_bed: null,
      retraction_dist: null,
      retraction_speed: null,
      flow: null,
    },
    customAttrs: [] as { key: string; value: string }[]
  };

  Object = Object; // Para usar en el template

  readonly icons = { Beaker, Plus, Trash2, CheckCircle2, XCircle, ChevronDown, ChevronUp };

  constructor() {
    this.materiales.loadMateriales();
    
    // Auto-load when machineId changes
    effect(() => {
      if (this.machineId) {
        this.calibrations.loadCalibrations(this.machineId);
      }
    }, { allowSignalWrites: true });
  }

  addAttr() {
    this.newTest.customAttrs.push({ key: '', value: '' });
  }

  removeAttr(index: number) {
    this.newTest.customAttrs.splice(index, 1);
  }

  resetForm() {
    this.newTest = {
      testType: 'Torre de Temperatura',
      materialId: undefined,
      summary: '',
      params: {
        temp_nozzle: null,
        temp_bed: null,
        retraction_dist: null,
        retraction_speed: null,
        flow: null,
      },
      customAttrs: []
    };
  }

  async saveTest() {
    if (!this.machineId) return;
    
    const results: any = { ...this.newTest.params };
    if (this.newTest.summary) results.summary = this.newTest.summary;
    
    // Limpiar nulos de los parámetros predefinidos
    Object.keys(results).forEach(key => {
      if (results[key] === null) delete results[key];
    });

    // Agregar atributos personalizados
    this.newTest.customAttrs.forEach(attr => {
      if (attr.key) results[attr.key] = attr.value;
    });
    
    await this.calibrations.create({
      machineId: this.machineId,
      materialId: this.newTest.materialId,
      testType: this.newTest.testType,
      results,
      success: true
    });
    
    this.showForm.set(false);
    this.resetForm();
  }
}
