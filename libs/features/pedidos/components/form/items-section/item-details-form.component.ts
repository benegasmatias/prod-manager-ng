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
import { LucideAngularModule, Trash2, Zap, Check } from 'lucide-angular';
import { MoneyInputComponent } from '@shared/ui/money-input/money-input.component';
import { NegocioConfig, Rubro } from '@shared/models/negocio';
import { cn } from '@shared/utils/cn';
import { OrderCalculatorService } from '../../../services/order-calculator.service';

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
  template: `
    <div class="group relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm transition-all hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none">
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

        <!-- RUBRIC ENHANCEMENTS AREA -->
        @switch (rubro()) {
          @case ('METALURGICA') {
            <app-metalurgica-item-enhancement (onApply)="applyEnhancement($event)"></app-metalurgica-item-enhancement>
          }
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
                    <div [class]="cn('space-y-2', (f.key === 'nombreProducto' || f.tipo === 'textarea' || f.key === 'url_stl' || f.key === 'reference_image') ? 'sm:col-span-2' : '')">
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
                        <!-- ITEM SPECIFIC ENHANCEMENTS PLUGINS -->
                        @if ((f.key === 'url_stl' || f.key === 'reference_image') && rubro() === 'IMPRESION_3D') {
                          <app-print3d-item-enhancement
                            [item]="item"
                            [fieldKey]="f.key"
                            (onFileUpload)="onFileUpload.emit($event)"
                            (onFileDelete)="onFileDelete.emit($event)"
                            (onUpdate)="onUpdate.emit()"
                          ></app-print3d-item-enhancement>
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
      <div class="px-8 pb-8 pt-4 space-y-4">
        
        <!-- 3D PRINTING CALCULATOR BANNER -->
        @if (rubro() === 'IMPRESION_3D') {
          <div class="p-5 rounded-[1.8rem] bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 flex flex-col sm:flex-row sm:items-center gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm">
            <div class="flex items-center gap-4 w-full sm:w-auto">
              <div class="h-12 w-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <lucide-angular [img]="icons.Zap" class="h-6 w-6"></lucide-angular>
              </div>
              <div class="flex flex-col">
                <span class="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-900 dark:text-indigo-400 whitespace-nowrap">Calculadora 3D</span>
                <span class="text-[9px] font-bold text-indigo-500/70 uppercase tracking-widest whitespace-nowrap">Base P/Gr x 3</span>
              </div>
            </div>

            <div class="flex-1 w-full sm:max-w-xs">
              <app-money-input
                label="Costo Bobina 1Kg ($)"
                [(value)]="item.precioBobinaKg"
                (valueChange)="onUpdate.emit()"
                inputClassName="h-12 text-sm bg-white dark:bg-zinc-900 shadow-sm border-indigo-100 dark:border-indigo-900/50"
                placeholder="Ej: 20000"
              ></app-money-input>
            </div>

            <div class="flex flex-col items-start sm:items-end w-full sm:w-auto sm:ml-auto min-w-[160px]">
              <span class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2 ml-1">Precio Sugerido</span>
              <button 
                type="button" 
                (click)="applySuggestedPrice()"
                [disabled]="getSuggestedPrice() <= 0"
                class="h-12 px-6 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base tabular-nums tracking-tight shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none flex items-center justify-center gap-2 group/btn relative overflow-hidden"
              >
                <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                <span>{{ getSuggestedPrice() || 0 | currency }}</span>
                @if (getSuggestedPrice() > 0) {
                  <lucide-angular [img]="icons.Check" class="h-4 w-4 opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all"></lucide-angular>
                }
              </button>
            </div>
          </div>
        }

        <!-- STANDARD FOOTER TOTALS -->
        <div class="p-6 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/50 backdrop-blur-sm flex flex-col md:flex-row items-center gap-8">
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <div class="relative group">
              <app-money-input
                [label]="orderType() === 'STOCK' ? 'Precio Venta Est. ($)' : 'Precio Unitario ($)'"
                [(value)]="item.precioUnitario"
                (valueChange)="onUpdate.emit()"
                inputClassName="h-12 text-sm shadow-sm"
              ></app-money-input>
            </div>

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
          
          <div class="flex flex-col items-center md:items-end justify-center min-w-[140px] px-4 w-full md:w-auto">
            <span class="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Carga Final Ítem</span>
            <div class="h-16 w-full md:w-auto px-8 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-black text-2xl tabular-nums shadow-xl group/total overflow-hidden relative transition-all">
              <div class="absolute inset-x-0 bottom-0 h-0.5 bg-primary/40 group-hover/total:h-full transition-all duration-500 opacity-20"></div>
              <span class="relative z-10">{{ getItemTotal() | currency }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetailsFormComponent {
  @Input({ required: true }) item: any;
  index = input.required<number>();
  config = input.required<NegocioConfig>();
  canRemove = input(false);
  rubro = input.required<Rubro>();
  orderType = input<'CLIENT' | 'STOCK'>('CLIENT');

  private calculator = inject(OrderCalculatorService);

  @Output() onRemove = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<void>();
  @Output() onFileUpload = new EventEmitter<string>();
  @Output() onFileDelete = new EventEmitter<string>();

  getItemTotal(): number {
    return this.calculator.calculateItem(this.item, this.rubro()).total;
  }

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

  readonly icons = { Trash2, Zap, Check };

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

  applyEnhancement(data: any) {
    Object.assign(this.item, data);
    this.onUpdate.emit();
  }

  cn = cn;
}
