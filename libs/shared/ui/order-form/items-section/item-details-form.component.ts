import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Trash2, Check, Plus } from 'lucide-angular';
import { NegocioConfig, Rubro } from '@shared/models/negocio';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-item-details-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="group relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm transition-all hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none">
      <div [class]="cn('absolute top-0 left-0 w-1.5 h-full opacity-20 group-hover:opacity-100 transition-opacity', rubro === 'METALURGICA' ? 'bg-indigo-500' : 'bg-primary')"></div>

      <div class="p-8 space-y-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div [class]="cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-zinc-50 dark:ring-zinc-800', rubro === 'METALURGICA' ? 'bg-indigo-500 text-white' : 'bg-primary text-primary-foreground')">
              {{ index + 1 }}
            </div>
            <h3 class="text-sm font-black uppercase tracking-widest text-zinc-400">Detalles de Manufactura</h3>
          </div>
          @if (canRemove) {
            <button type="button" (click)="onRemove.emit()" class="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-center">
              <lucide-icon name="trash-2" size="18"></lucide-icon>
            </button>
          }
        </div>

        <!-- METALWORK TEMPLATES -->
        @if (rubro === 'METALURGICA') {
          <div class="space-y-4">
            <div class="bg-indigo-50/50 dark:bg-zinc-950/20 p-5 rounded-[1.5rem] border border-indigo-100/50 dark:border-indigo-900/30">
              <div class="flex items-center gap-2 mb-3">
                <lucide-icon name="check" size="12" class="text-indigo-400"></lucide-icon>
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
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      } @else if (f.tipo === 'money' || f.tipo === 'number') {
                         <div class="relative group">
                            @if (f.tipo === 'money') { <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-300">$</span> }
                            <input 
                              type="number"
                              [(ngModel)]="item[f.key]"
                              (ngModelChange)="onUpdate.emit()"
                              [class]="cn('flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm font-black focus:outline-none focus:ring-4 focus:ring-primary/5 dark:border-zinc-800 dark:bg-zinc-950/20 transition-all', f.tipo === 'money' ? 'pl-8' : '')"
                              [placeholder]="f.placeholder || '0.00'"
                            >
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
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ItemDetailsFormComponent {
  @Input({ required: true }) item: any;
  @Input({ required: true }) index: number = 0;
  @Input({ required: true }) config!: NegocioConfig;
  @Input() canRemove = false;
  
  @Output() onRemove = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<void>();

  @Input({ required: true }) rubro!: Rubro;

  metalTemplates = [
    { label: 'Portón', data: { tipo_trabajo: 'Portón', typeAperture: 'CORREDIZO', material_estructura: 'Caño 40x40', fillMaterial: 'CHAPA' } },
    { label: 'Reja', data: { tipo_trabajo: 'Reja', fillMaterial: 'BARROTES', material_estructura: 'Hierro Redondo 1/2"' } },
    { label: 'Puerta Reja', data: { tipo_trabajo: 'Puerta', typeAperture: 'BATIENTE', fillMaterial: 'BARROTES', accessories: ['CERRADURA', 'BISAGRAS'] } },
    { label: 'Tinglado', data: { tipo_trabajo: 'Estructura', material_estructura: 'Perfil C 100x50', fillMaterial: 'CHAPA' } },
  ];

  sectionedFields = computed(() => {
    const sections: { name: string, fields: any[] }[] = [];
    const fields = this.config.itemFields || [];

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

    if (this.rubro === 'IMPRESION_3D') {
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
