import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, X, Check, Activity, User, Monitor } from 'lucide-angular';

export interface PickerItem {
  id: string;
  label: string;
  sublabel?: string;
  avatar?: string;
  icon?: any;
}

@Component({
  selector: 'app-quick-resource-picker',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        class="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:scale-100 duration-500"
      >
        <div class="p-6 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
             <div class="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                <lucide-angular [img]="titleIcon()" class="h-5 w-5"></lucide-angular>
             </div>
             <div>
               <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">Asignar Recurso</p>
               <h3 class="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{{ title() }}</h3>
             </div>
          </div>
          <button (click)="close.emit()" class="h-10 w-10 flex items-center justify-center text-zinc-300 hover:text-zinc-600 transition-colors">
            <lucide-angular [img]="icons.X" class="h-5 w-5"></lucide-angular>
          </button>
        </div>

        <div class="p-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-50 dark:border-zinc-800">
           <div class="relative group">
              <lucide-angular [img]="icons.Search" class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-primary transition-colors"></lucide-angular>
              <input 
                type="text" 
                [placeholder]="'Buscar ' + title().toLowerCase() + '...'"
                [value]="searchTerm"
                (input)="onSearch($event)"
                class="w-full h-11 pl-11 pr-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
           </div>
        </div>

        <div class="max-h-[350px] overflow-y-auto p-4 space-y-1">
          <button 
            (click)="selectItem(null)"
            class="w-full h-12 px-4 rounded-xl flex items-center gap-4 hover:bg-rose-50 text-rose-500 transition-all border-dashed border-2 border-transparent hover:border-rose-100"
          >
             <div class="h-8 w-8 rounded-lg bg-rose-100/50 flex items-center justify-center">
                <lucide-angular [img]="icons.X" class="h-4 w-4"></lucide-angular>
             </div>
             <span class="text-[10px] font-black uppercase tracking-widest">Sin asignar (Limpiar)</span>
          </button>

          <div class="h-px w-full bg-zinc-50 dark:bg-zinc-800 my-2"></div>

          @for (item of filteredItems(); track item.id) {
            <button 
              (click)="selectItem(item.id)"
              class="w-full h-14 px-4 rounded-2xl flex items-center justify-between group hover:bg-primary/5 transition-all outline-none"
              [ngClass]="activeId() === item.id ? 'bg-primary/5 ring-1 ring-primary/20' : ''"
            >
               <div class="flex items-center gap-4">
                  <div class="h-10 w-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                     <lucide-angular [img]="item.icon || icons.Activity" class="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors"></lucide-angular>
                  </div>
                  <div class="text-left">
                    <p class="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter">{{ item.label }}</p>
                    <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">{{ item.sublabel || '--' }}</p>
                  </div>
               </div>
               @if (activeId() === item.id) {
                 <lucide-angular [img]="icons.Check" class="h-4 w-4 text-emerald-500"></lucide-angular>
               }
            </button>
          }

          @if (filteredItems().length === 0) {
            <div class="py-12 text-center">
               <p class="text-[10px] font-black uppercase tracking-widest text-zinc-300">No se encontraron resultados</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    /* Hide scrollbar for cleaner UI */
    .overflow-y-auto::-webkit-scrollbar { display: none; }
    .overflow-y-auto { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class QuickResourcePickerComponent {
  title = input.required<string>();
  titleIcon = input<any>(Activity);
  items = input.required<PickerItem[]>();
  activeId = input<string | null>(null);

  close = output<void>();
  select = output<string | null>();

  searchTerm = '';
  
  filteredItems = computed(() => {
    const list = this.items();
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return list;
    return list.filter(i => 
      i.label.toLowerCase().includes(q) || 
      i.sublabel?.toLowerCase().includes(q)
    );
  });

  icons = {
    Search, X, Check, Activity, User, Monitor
  };

  selectItem(id: string | null) {
    this.select.emit(id);
    this.close.emit();
  }

  onSearch(e: Event) {
    this.searchTerm = (e.target as HTMLInputElement).value;
  }
}
