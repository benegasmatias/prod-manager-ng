import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Filter, X, ChevronDown, User, Cpu, AlertCircle, Sparkles, RefreshCw, Settings2 } from 'lucide-angular';
import { CalendarFilters } from '../models/calendar.models';
import { Employee } from '@shared/models';

export type FilterLayout = 'VERTICAL' | 'HORIZONTAL';

@Component({
  selector: 'app-calendar-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div [class]="cn(
      'transition-all duration-500',
      layout() === 'VERTICAL' ? 'bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-border' : 'w-full flex flex-col gap-4 lg:gap-6'
    )">
      
      <!-- HORIZONTAL MODE: Better spacing and no cutting -->
      @if (layout() === 'HORIZONTAL') {
        <div class="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          
          <!-- Pill Style Status Bar: Improved Wrap & Scroll -->
          <div class="flex-1 flex flex-wrap items-center gap-1.5 bg-indigo-50/50 dark:bg-zinc-900/50 p-1.5 rounded-[2rem] border border-indigo-100/50 dark:border-zinc-800/50 min-w-0">
            <button 
              (click)="resetFilters()"
              [class]="'px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ' + 
                (isReset() ? 'bg-white dark:bg-zinc-800 text-indigo-500 shadow-sm ring-1 ring-indigo-200/50' : 'text-zinc-500 hover:text-indigo-400')">
              Todos
            </button>
            
            @for (status of statusOptions(); track status.key) {
              <button 
                (click)="toggleStatus(status.key)"
                [class]="'px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ' + 
                  (isStatusSelected(status.key) ? 'bg-white dark:bg-zinc-800 text-indigo-500 shadow-sm ring-1 ring-indigo-200/50' : 'text-zinc-500 hover:text-indigo-400')">
                {{ status.label }}
              </button>
            }
          </div>

          <!-- Secondary Actions (Dropdown & More) -->
          <div class="flex items-center gap-3 shrink-0">
             <!-- Collaborator Dropdown -->
             <div class="relative group min-w-[200px]">
                <select 
                  [(ngModel)]="operatorId"
                  (change)="onFilterChange()"
                  class="w-full appearance-none h-11 pl-5 pr-12 bg-indigo-50/50 dark:bg-zinc-900/50 border border-indigo-100/50 dark:border-zinc-800/50 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer">
                  <option value="all">Todos los Colaboradores</option>
                  @for (emp of employees(); track emp.id) {
                    <option [value]="emp.id">{{ emp.firstName }} {{ emp.lastName }}</option>
                  }
                </select>
                <lucide-angular [img]="icons.ChevronDown" class="absolute right-5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none group-hover:text-primary transition-colors"></lucide-angular>
             </div>

             <!-- Settings/Adjustments Icon -->
             <button class="h-11 w-11 flex items-center justify-center rounded-2xl bg-indigo-50/50 dark:bg-zinc-900/50 border border-indigo-100/50 dark:border-zinc-800/50 text-indigo-400 hover:text-primary hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-95">
                <lucide-angular [img]="icons.Settings2" class="h-4 w-4"></lucide-angular>
             </button>
          </div>

        </div>
      }

      <!-- VERTICAL MODE: Original Layout -->
      @if (layout() === 'VERTICAL') {
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <lucide-angular [img]="icons.Filter" class="h-5 w-5"></lucide-angular>
            </div>
            <h3 class="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-50">Refinar Búsqueda</h3>
          </div>
          <button (click)="resetFilters()" class="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">Limpiar Todo</button>
        </div>

        <div class="space-y-8">
          <div class="flex flex-wrap gap-2">
             <button (click)="toggleRisky()" [class]="'px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ' + (filters().onlyRisky ? 'bg-red-500 border-red-500 text-white' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-400')">En Riesgo</button>
             <button (click)="toggleOverdue()" [class]="'px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ' + (filters().onlyOverdue ? 'bg-zinc-900 text-white' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-400')">Vencidos</button>
          </div>

          <div class="space-y-4">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Etapas Operativas</label>
            <div class="grid grid-cols-2 gap-2">
              @for (status of statusOptions(); track status.key) {
                <label class="flex items-center gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 cursor-pointer select-none">
                  <input type="checkbox" [checked]="isStatusSelected(status.key)" (change)="toggleStatus(status.key)" class="accent-primary" />
                  <span class="text-[10px] font-bold text-zinc-500 uppercase">{{ status.label }}</span>
                </label>
              }
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class CalendarFiltersComponent {
  employees = input.required<Employee[]>();
  statusOptions = input.required<{ key: string; label: string }[]>();
  layout = input<FilterLayout>('VERTICAL');
  
  onFiltersChange = output<CalendarFilters>();

  filters = signal<CalendarFilters>({
    status: [],
    onlyRisky: false,
    onlyOverdue: false
  });

  operatorId = 'all';

  icons = { Filter, X, ChevronDown, User, Cpu, AlertCircle, Sparkles, RefreshCw, Settings2 };

  cn(...args: any[]) { return args.filter(Boolean).join(' '); }

  isReset() {
    return this.filters().status.length === 0 && !this.filters().onlyRisky && !this.filters().onlyOverdue && this.operatorId === 'all';
  }

  toggleRisky() {
    this.filters.update(f => ({ ...f, onlyRisky: !f.onlyRisky }));
    this.onFilterChange();
  }

  toggleOverdue() {
    this.filters.update(f => ({ ...f, onlyOverdue: !f.onlyOverdue }));
    this.onFilterChange();
  }

  isStatusSelected(status: string) {
    return this.filters().status.includes(status);
  }

  toggleStatus(status: string) {
    this.filters.update(f => {
      const current = [...f.status];
      const idx = current.indexOf(status);
      if (idx === -1) current.push(status);
      else current.splice(idx, 1);
      return { ...f, status: current };
    });
    this.onFilterChange();
  }

  onFilterChange() {
    this.onFiltersChange.emit({
      ...this.filters(),
      operatorId: this.operatorId === 'all' ? undefined : this.operatorId
    });
  }

  resetFilters() {
    this.filters.set({
      status: [],
      onlyRisky: false,
      onlyOverdue: false
    });
    this.operatorId = 'all';
    this.onFilterChange();
  }
}
