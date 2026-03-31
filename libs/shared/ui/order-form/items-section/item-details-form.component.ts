import { Component, Input, Output, EventEmitter, inject, computed, input, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Trash2, Check, Plus, Upload, Loader2, FileCheck, X } from 'lucide-angular';
import { MoneyInputComponent } from '@shared/ui/money-input/money-input.component';
import { FilesApiService } from '@core/api/files.api.service';
import { NegocioConfig, Rubro } from '@shared/models/negocio';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-item-details-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, MoneyInputComponent],
  template: `
    <div class="group relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm transition-all hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none">
      <input type="file" #fileInput class="hidden" accept=".stl" (change)="onFileSelected($event)">
      <div [class]="cn('absolute top-0 left-0 w-1.5 h-full opacity-20 group-hover:opacity-100 transition-opacity', rubro() === 'METALURGICA' ? 'bg-indigo-500' : 'bg-primary')"></div>

      <div class="p-8 space-y-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div [class]="cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-zinc-50 dark:ring-zinc-800', rubro() === 'METALURGICA' ? 'bg-indigo-500 text-white' : 'bg-primary text-primary-foreground')">
              {{ index() + 1 }}
            </div>
            <h3 class="text-sm font-black uppercase tracking-widest text-zinc-400">Parámetros del Ítem</h3>
          </div>
          @if (canRemove()) {
            <button type="button" (click)="onRemove.emit()" class="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-center">
              <lucide-angular [img]="icons.Trash2" class="h-4 w-4"></lucide-angular>
            </button>
          }
        </div>

        <!-- METALWORK TEMPLATES -->
        @if (rubro() === 'METALURGICA') {
          <div class="space-y-4">
            <div class="bg-indigo-50/50 dark:bg-zinc-950/20 p-5 rounded-[1.5rem] border border-indigo-100/50 dark:border-indigo-900/30">
              <div class="flex items-center gap-2 mb-3">
                <lucide-angular [img]="icons.Check" class="h-3 w-3 text-indigo-400"></lucide-angular>
                <span class="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400/80">Plantillas de Ingeniería</span>
              </div>
              <div class="flex flex-wrap gap-2">
                @for (tpl of metalTemplates; track tpl.label) {
                  <button
                    type="button"
                    (click)="applyTemplate(tpl.data)"
                    class="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-800/50 transition-all hover:border-indigo-500"
                  >
                    {{ tpl.label }}
                  </button>
                }
              </div>
            </div>
          </div>
        }

        <!-- DYNAMIC FIELDS BY SECTION -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          @for (section of sectionedFields(); track section.name) {
            <div [class]="cn('space-y-6', section.name === 'OPCIONALES' ? 'md:col-span-1' : 'md:col-span-2')">
              <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                {{ section.name }}
              </h4>
              <div [class]="cn('grid gap-6', section.name === 'OPCIONALES' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')">
                @for (f of section.fields; track f.key) {
                  @if (isFieldVisible(f)) {
                    <div [class]="cn('space-y-2', (f.key === 'nombreProducto' || f.tipo === 'textarea') ? 'sm:col-span-2' : '')">
                      <label class="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">
                        {{ f.label }} @if (f.required) { <span class="text-rose-500">*</span> }
                      </label>

                      @if (f.tipo === 'select') {
                        <select
                          [(ngModel)]="item[f.key]"
                          (ngModelChange)="onUpdate.emit()"
                          class="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-900 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 dark:border-zinc-800 transition-all cursor-pointer"
                        >
                          <option value="">Seleccionar...</option>
                          @for (opt of f.options; track opt) {
                            <option [value]="opt">{{ opt }}</option>
                          }
                        </select>
                      } @else if (f.tipo === 'boolean') {
                        <button
                          type="button"
                          (click)="item[f.key] = !item[f.key]; onUpdate.emit()"
                          [class]="cn(
                            'flex items-center gap-3 h-12 w-full rounded-xl border px-4 transition-all duration-300',
                            item[f.key] ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white border-zinc-200 text-zinc-400 dark:bg-zinc-950/20 dark:border-zinc-800 shadow-sm'
                          )"
                        >
                          <div [class]="cn('h-5 w-9 rounded-full p-1 transition-colors flex items-center', item[f.key] ? 'bg-white/30' : 'bg-zinc-100 dark:bg-zinc-800')">
                             <div [class]="cn('h-3 w-3 rounded-full transition-transform duration-300', item[f.key] ? 'translate-x-4 bg-white' : 'translate-x-0 bg-zinc-400')"></div>
                          </div>
                          <span class="text-[10px] font-black uppercase tracking-[0.15em]">{{ item[f.key] ? 'SÍ' : 'NO' }}</span>
                        </button>
                      } @else if (f.tipo === 'textarea') {
                        <textarea
                          [(ngModel)]="item[f.key]"
                          (ngModelChange)="onUpdate.emit()"
                          class="flex min-h-[120px] w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 dark:border-zinc-800 dark:bg-zinc-950/50 focus:bg-white dark:focus:bg-zinc-900 transition-all resize-none"
                          [placeholder]="f.placeholder || ''"
                        ></textarea>
                      } @else if (f.tipo === 'money') {
                        <app-money-input
                          [(value)]="item[f.key]"
                          (valueChange)="onUpdate.emit()"
                          [placeholder]="f.placeholder || '0,00'"
                        ></app-money-input>
                      } @else if (f.tipo === 'number') {
                         <div class="relative group">
                            <input 
                              type="number"
                              [(ngModel)]="item[f.key]"
                              (ngModelChange)="onUpdate.emit()"
                              class="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm font-black focus:outline-none focus:ring-4 focus:ring-primary/5 dark:border-zinc-800 dark:bg-zinc-950/20 transition-all font-mono"
                              [placeholder]="f.placeholder || '0'"
                            >
                         </div>
                      } @else {
            @if (f.key === 'url_stl' && rubro() === 'IMPRESION_3D') {
              <div class="flex flex-col gap-3">
                <input
                  type="text"
                  [(ngModel)]="item[f.key]"
                  (ngModelChange)="onUpdate.emit()"
                  class="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm font-black focus:outline-none focus:ring-4 focus:ring-primary/5 dark:border-zinc-800 dark:bg-zinc-950/20 transition-all"
                  placeholder="URL del STL (Thingiverse, Printables, etc...)"
                >
                
                <div class="flex items-center gap-3">
                  <div class="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
                  <span class="text-[9px] font-black text-zinc-300 uppercase tracking-widest">O Subir Archivo</span>
                  <div class="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
                </div>

                @if (!item.stlFile) {
                  <button
                    type="button"
                    (click)="fileInput.click()"
                    [disabled]="isUploading()"
                    class="h-12 w-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:border-primary hover:text-primary transition-all disabled:opacity-50"
                  >
                    @if (isUploading()) {
                      <lucide-angular [img]="icons.Loader2" class="h-4 w-4 animate-spin"></lucide-angular>
                      Subiendo...
                    } @else {
                      <lucide-angular [img]="icons.Upload" class="h-4 w-4"></lucide-angular>
                      Seleccionar Archivo .STL
                    }
                  </button>
                } @else {
                  <div class="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10 animate-in zoom-in-95 duration-300">
                    <div class="flex items-center gap-3 overflow-hidden">
                      <div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <lucide-angular [img]="icons.FileCheck" class="h-4 w-4"></lucide-angular>
                      </div>
                      <div class="flex flex-col overflow-hidden">
                        <span class="text-[11px] font-black text-primary truncate">{{ item.stlFile.fileName }}</span>
                        <span class="text-[9px] font-bold text-primary/50 uppercase tracking-tighter">{{ (item.stlFile.size / 1024 / 1024) | number:'1.1-2' }} MB</span>
                      </div>
                    </div>
                    <button type="button" (click)="clearFile()" class="h-8 w-8 rounded-lg hover:bg-rose-500 hover:text-white text-zinc-300 transition-all flex items-center justify-center">
                      <lucide-angular [img]="icons.X" class="h-3.5 w-3.5"></lucide-angular>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <input
                type="text"
                [(ngModel)]="item[f.key]"
                (ngModelChange)="onUpdate.emit()"
                class="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm font-black focus:outline-none focus:ring-4 focus:ring-primary/5 dark:border-zinc-800 dark:bg-zinc-950/20 transition-all"
                [placeholder]="f.placeholder || ''"
              >
            }
                      }
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- PREMIUM ITEM FOOTER -->
      <div class="px-8 pb-8 pt-4">
        <div class="p-6 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/50 backdrop-blur-sm flex flex-col sm:flex-row items-center gap-6">
          <div class="flex-1 grid grid-cols-2 gap-4 w-full">
            <app-money-input
              [label]="orderType() === 'STOCK' ? 'Precio Venta Est. ($)' : 'Precio Unitario ($)'"
              [(value)]="item.precioUnitario"
              (valueChange)="onUpdate.emit()"
              placeholder="0,00"
              inputClassName="h-12 text-sm shadow-sm"
            ></app-money-input>

            @if (orderType() !== 'STOCK') {
              <app-money-input
                [label]="'Seña / Adelanto ($)'"
                [(value)]="item.senia"
                (valueChange)="onUpdate.emit()"
                [color]="rubro() === 'METALURGICA' ? 'indigo' : 'primary'"
                placeholder="0,00"
                inputClassName="h-12 text-sm shadow-sm"
              ></app-money-input>
            }
          </div>
          
          <div class="flex flex-col items-center sm:items-end justify-center min-w-[140px] px-4">
            <span class="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Carga Final Ítem</span>
            <div class="h-14 px-8 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-black text-2xl tabular-nums shadow-xl group/total overflow-hidden relative">
              <div class="absolute inset-x-0 bottom-0 h-0.5 bg-primary/40 group-hover/total:h-full transition-all duration-500 opacity-20"></div>
              <span class="relative z-10">{{ (item.cantidad || 0) * (item.precioUnitario || 0) | currency }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ItemDetailsFormComponent {
  @Input({ required: true }) item: any;
  index = input.required<number>();
  config = input.required<NegocioConfig>();
  canRemove = input(false);
  rubro = input.required<Rubro>();
  orderType = input<'CUSTOMER' | 'STOCK'>('CUSTOMER');
  
  private filesApi = inject(FilesApiService);
  
  @Output() onRemove = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<void>();
 
  readonly icons = { Trash2, Check, Plus, Upload, Loader2, FileCheck, X };
  isUploading = signal(false);

  async onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.isUploading.set(true);
    try {
      const res = await this.filesApi.uploadFile(file);
      this.item.stlFile = res;
      this.onUpdate.emit();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Error al subir el archivo');
    } finally {
      this.isUploading.set(false);
      // Reset input
      event.target.value = '';
    }
  }

  clearFile() {
    this.item.stlFile = undefined;
    this.onUpdate.emit();
  }

  metalTemplates = [
    { label: 'Portón', data: { tipo_trabajo: 'Portón', typeAperture: 'CORREDIZO', material_estructura: 'Caño 40x40', fillMaterial: 'CHAPA' } },
    { label: 'Reja', data: { tipo_trabajo: 'Reja', fillMaterial: 'BARROTES', material_estructura: 'Hierro Redondo 1/2"' } },
    { label: 'Puerta Reja', data: { tipo_trabajo: 'Puerta', typeAperture: 'BATIENTE', fillMaterial: 'BARROTES', accessories: ['CERRADURA', 'BISAGRAS'] } },
    { label: 'Tinglado', data: { tipo_trabajo: 'Estructura', material_estructura: 'Perfil C 100x50', fillMaterial: 'CHAPA' } },
  ];

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

  applyTemplate(data: any) {
    Object.assign(this.item, data);
    this.onUpdate.emit();
  }

  cn = cn;
}
