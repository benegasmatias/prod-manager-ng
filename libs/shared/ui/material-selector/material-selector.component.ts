import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown, Check } from 'lucide-angular';
import { Material } from '@shared/models';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-material-selector',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="relative w-full">
      <!-- Trigger Button -->
      <button
        type="button"
        [disabled]="readOnly()"
        (click)="isOpen.set(!isOpen())"
        [class]="cn(
          'w-full h-10 px-3 rounded-xl flex items-center gap-2 transition-all border outline-none text-left bg-zinc-50 dark:bg-zinc-800/40',
          isOpen() ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-700',
          readOnly() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )"
      >
        @if (selectedMaterial()) {
          <div 
            class="h-4 w-4 rounded-full border border-black/10 shrink-0 shadow-sm transition-transform group-hover:scale-110"
            [style.backgroundColor]="selectedMaterial()?.color || '#ccc'"
          ></div>
          <span class="flex-1 text-[11px] font-black truncate text-zinc-700 dark:text-zinc-200 uppercase">
            {{ selectedMaterial()?.name }}
          </span>
        } @else {
          <span class="flex-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Sin Material...
          </span>
        }
        <lucide-angular [img]="icons.ChevronDown" [class]="cn('h-3 w-3 text-zinc-400 transition-transform', isOpen() && 'rotate-180')"></lucide-angular>
      </button>

      <!-- Dropdown Panel (Overlay) -->
      @if (isOpen() && !readOnly()) {
        <div 
          class="absolute z-[120] left-0 right-0 mt-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl max-h-[240px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 custom-scrollbar"
        >
          <div class="grid grid-cols-1 gap-1">
            <!-- Option: None -->
            <button
              type="button"
              (click)="select('')"
              class="w-full flex items-center gap-3 p-2 rounded-xl border border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-left group"
            >
              <div class="h-4 w-4 rounded-full border-2 border-dashed border-zinc-200 shrink-0"></div>
              <span class="flex-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ninguno</span>
              @if (!selectedId()) {
                <lucide-angular [img]="icons.Check" class="h-3 w-3 text-blue-500"></lucide-angular>
              }
            </button>

            <!-- Options: Materials -->
            @for (m of materials(); track m.id) {
              <button
                type="button"
                (click)="select(m.id)"
                class="w-full flex items-center gap-3 p-2 rounded-xl border border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-left group"
              >
                <div 
                  class="h-4 w-4 rounded-full border border-black/10 shrink-0 shadow-sm"
                  [style.backgroundColor]="m.color || '#ccc'"
                ></div>
                <div class="flex flex-col min-w-0">
                  <span [class]="cn('text-[11px] font-black uppercase truncate', selectedId() === m.id ? 'text-blue-600' : 'text-zinc-600 dark:text-zinc-300')">
                    {{ m.name }}
                  </span>
                  @if (m.type || m.brand) {
                    <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter leading-none mt-0.5">
                      {{ m.brand || 'GENÉRICO' }} — {{ m.type }}
                    </span>
                  }
                </div>
                @if (selectedId() === m.id) {
                  <lucide-angular [img]="icons.Check" class="h-3 w-3 text-blue-500 ml-auto"></lucide-angular>
                }
              </button>
            }
          </div>
        </div>

        <!-- Backdrop to close -->
        <div class="fixed inset-0 z-[115]" (click)="isOpen.set(false)"></div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class MaterialSelectorComponent {
  // Inputs
  materials = input<Material[]>([]);
  selectedId = input<string>('');
  readOnly = input<boolean>(false);

  // Outputs
  selectChange = output<string>();

  // UI State
  isOpen = signal(false);
  readonly icons = { ChevronDown, Check };

  selectedMaterial = () => this.materials().find(m => m.id === this.selectedId());

  select(id: string) {
    this.selectChange.emit(id);
    this.isOpen.set(false);
  }

  cn = cn;
}
