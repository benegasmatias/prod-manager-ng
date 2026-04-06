import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, Search, X, Check, Activity, User, Monitor, 
  Settings, Layers, Box
} from 'lucide-angular';
import { FormsModule } from '@angular/forms';

export interface PickerItem {
  id: string;
  label: string;
  sublabel?: string;
  avatar?: string;
  icon?: any;
  color?: string;
}

@Component({
  selector: 'app-quick-resource-picker',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div class="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in" (click)="close.emit()"></div>
      
      <div class="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
        <!-- HEADER -->
        <div class="px-8 pt-8 pb-6 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/30">
           <div class="flex items-center gap-4">
              <div class="h-12 w-12 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center shadow-sm">
                 <lucide-angular [img]="titleIcon()" class="h-6 w-6 text-primary"></lucide-angular>
              </div>
              <h3 class="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{{ title() }}</h3>
           </div>
           <button (click)="close.emit()" class="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-zinc-400">
              <lucide-angular [img]="icons.X" class="h-5 w-5"></lucide-angular>
           </button>
        </div>

        <!-- SEARCH -->
        <div class="p-4 bg-white dark:bg-zinc-900 sticky top-0 z-10 border-b border-zinc-50 dark:border-zinc-800">
           <div class="relative group">
              <lucide-angular [img]="icons.Search" class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors"></lucide-angular>
              <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)"
                   placeholder="Buscar recurso..." 
                   class="w-full pl-11 pr-5 py-3.5 bg-zinc-100/50 dark:bg-zinc-950/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none">
           </div>
        </div>

        <!-- OPTIONS -->
        <div class="max-h-[60vh] overflow-y-auto p-4 space-y-2">
           @for (item of filteredItems(); track item.id) {
             <button (click)="selectItem(item.id)" 
                  class="w-full px-5 py-4 flex items-center justify-between rounded-[1.5rem] border transition-all text-zinc-900 dark:text-zinc-100"
                  [ngClass]="activeId() === item.id 
                    ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20' 
                    : 'bg-white dark:bg-zinc-800/20 border-zinc-50 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'">
                
                <div class="flex items-center gap-4">
                  <div class="h-11 w-11 rounded-xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center border border-zinc-100/20 shadow-inner">
                    <lucide-angular [img]="item.icon || titleIcon()" class="h-5 w-5" [ngClass]="item.color || 'text-primary'"></lucide-angular>
                  </div>
                  <div class="text-left">
                    <p class="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter">{{ item.label }}</p>
                    <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">{{ item.sublabel || '--' }}</p>
                  </div>
                </div>

                @if (activeId() === item.id) {
                  <div class="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center animate-in zoom-in border-4 border-white dark:border-zinc-800 shadow-xl">
                    <lucide-angular [img]="icons.Check" class="h-4 w-4"></lucide-angular>
                  </div>
                }
             </button>
           } @empty {
             <div class="py-20 text-center opacity-30">
                <p class="text-[10px] font-black uppercase tracking-[0.2em]">Sin resultados</p>
             </div>
           }
        </div>

        <!-- FOOTER / DESELECT -->
        @if (canDeselect()) {
          <div class="p-4 bg-zinc-50 dark:bg-zinc-950/50">
             <button (click)="selectItem(null)" 
                  class="w-full py-4 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50/50 rounded-2xl transition-all border border-dashed border-rose-100 dark:border-rose-900/30">
               Liberar Asignación
             </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .overflow-y-auto::-webkit-scrollbar { display: none; }
    .overflow-y-auto { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class QuickResourcePickerComponent {
  type = input.required<'MACHINE' | 'OPERATOR' | 'STAGE' | 'MATERIAL'>();
  titleIcon = input<any>(Activity);
  items = input.required<PickerItem[]>();
  activeId = input<string | null>(null);
  canDeselect = input<boolean>(true);

  close = output<void>();
  select = output<string | null>();

  searchTerm = '';
  private _filteredItems = signal<PickerItem[]>([]);

  title = computed(() => {
    const t = this.type();
    if (t === 'OPERATOR') return 'Seleccionar Operario';
    if (t === 'STAGE') return 'Cambiar Etapa';
    if (t === 'MATERIAL') return 'Reservar Material';
    return 'Seleccionar Máquina';
  });
  
  filteredItems = computed(() => {
    const term = this.searchTerm.toLowerCase();
    const list = this.items();
    if (!term) return list;
    return list.filter(i => 
      i.label.toLowerCase().includes(term) || 
      i.sublabel?.toLowerCase().includes(term)
    );
  });

  icons = {
    Search, X, Check, Activity, User, Monitor, Settings, Layers, Box
  };

  onSearch(term: string) {
    this.searchTerm = term;
  }

  selectItem(id: string | null) {
    this.select.emit(id);
    this.close.emit();
  }
}
