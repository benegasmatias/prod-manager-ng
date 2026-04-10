import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Filter, X, ChevronDown, User, Cpu, AlertCircle, Sparkles } from 'lucide-angular';
import { CalendarFilters } from '../models/calendar.models';
import { Employee } from '@shared/models';

@Component({
  selector: 'app-calendar-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-zinc-200/50 dark:border-zinc-800/50 p-8 shadow-sm">
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
        <!-- Quick Insight Badges -->
        <div class="flex flex-wrap gap-2">
           <button 
             (click)="toggleRisky()"
             [class]="'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ' + 
               (filters().onlyRisky ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-transparent border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-red-500/30')">
             <lucide-angular [img]="icons.AlertCircle" class="h-3 w-3 inline mr-1"></lucide-angular>
             Solo en Riesgo
           </button>
           <button 
             (click)="toggleOverdue()"
             [class]="'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ' + 
               (filters().onlyOverdue ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-transparent border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-900/30')">
             Solo Vencidos
           </button>
        </div>

        <!-- Dynamic Status Multi-Select (Simplified for MVP) -->
        <div class="space-y-4">
          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
             <lucide-angular [img]="icons.Sparkles" class="h-3 w-3"></lucide-angular>
             Etapas Operativas
          </label>
          <div class="grid grid-cols-2 gap-2">
            @for (status of statusOptions(); track status.key) {
               <label class="flex items-center gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:border-primary/30 transition-all select-none group">
                  <input type="checkbox" 
                         class="accent-primary h-4 w-4 rounded-lg"
                         [checked]="isStatusSelected(status.key)"
                         (change)="toggleStatus(status.key)" />
                  <span class="text-[10px] font-bold text-zinc-500 group-hover:text-primary transition-colors uppercase">{{ status.label }}</span>
               </label>
            }
          </div>
        </div>

        <!-- Assignment Filters -->
        <div class="space-y-6">
           <!-- Operator -->
           <div class="space-y-3">
             <label class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
               <lucide-angular [img]="icons.User" class="h-3 w-3"></lucide-angular>
               Responsable
             </label>
             <select 
               [(ngModel)]="operatorId"
               (change)="onFilterChange()"
               class="w-full h-12 rounded-2xl border-none bg-zinc-50 dark:bg-zinc-800/80 px-4 text-xs font-bold text-zinc-500 focus:ring-4 focus:ring-primary/10 transition-all">
               <option value="all">TODOS LOS OPERARIOS</option>
               @for (emp of employees(); track emp.id) {
                 <option [value]="emp.id">{{ emp.firstName | uppercase }} {{ emp.lastName | uppercase }}</option>
               }
             </select>
           </div>
        </div>

      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class CalendarFiltersComponent {
  employees = input.required<Employee[]>();
  statusOptions = input.required<{ key: string; label: string }[]>();
  
  onFiltersChange = output<CalendarFilters>();

  filters = signal<CalendarFilters>({
    status: [],
    onlyRisky: false,
    onlyOverdue: false
  });

  operatorId = 'all';

  icons = { Filter, X, ChevronDown, User, Cpu, AlertCircle, Sparkles };

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
