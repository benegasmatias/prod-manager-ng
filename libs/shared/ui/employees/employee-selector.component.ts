import { Component, Input, Output, signal, computed, inject, ElementRef, HostListener, OnInit, effect, input, output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User, Search, ChevronDown, Check, X, RefreshCw, Users } from 'lucide-angular';
import { Employee } from '@shared/models';
import { PersonalApiService } from '@core/api/personal.api.service';
import { SessionService } from '@core/session/session.service';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-employee-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-2 relative" #container>
      @if (label) {
        <label class="text-[11px] font-black uppercase tracking-wider text-zinc-500 ml-1">
          {{ label }}
        </label>
      }
      
      <div 
        [class]="cn(
          'relative group h-12 flex items-center px-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer',
          isOpen() && 'ring-4 ring-primary/5 bg-white dark:bg-zinc-900 border-primary/20 shadow-xl',
          error && 'border-rose-500/50 bg-rose-50/10',
          disabled && 'opacity-50 cursor-not-allowed grayscale pointer-events-none'
        )"
        (click)="toggleOpen()"
      >
        <div class="flex items-center gap-3 w-full overflow-hidden">
          <div [class]="cn('transition-all flex-shrink-0', isOpen() ? 'text-primary' : 'text-zinc-400')">
            @if (isOpen()) { <lucide-angular [img]="icons.Search" class="h-4 w-4"></lucide-angular> }
            @else { <lucide-angular [img]="icons.Users" class="h-4 w-4"></lucide-angular> }
          </div>
          
          @if (isOpen()) {
            <input
              #searchInput
              type="text"
              class="bg-transparent border-none outline-none text-[13px] font-bold w-full text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400"
              [placeholder]="selectedEmployee() ? (selectedEmployee()!.firstName + ' ' + (selectedEmployee()!.lastName || '')) : 'Buscar responsable...'"
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
              (click)="$event.stopPropagation()"
            />
          } @else {
            <div class="flex flex-col truncate">
              <span [class]="cn('text-[13px] font-bold truncate transition-all', selectedEmployee() ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400')">
                {{ selectedEmployee() ? (selectedEmployee()!.firstName + ' ' + (selectedEmployee()!.lastName || '')) : placeholder }}
              </span>
              @if (selectedEmployee()?.role && !isOpen()) {
                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-tight -mt-0.5 truncate">
                  {{ selectedEmployee()?.role }}
                </span>
              }
            </div>
          }
        </div>

        <div class="flex items-center gap-1 ml-2">
          @if (loading()) {
            <lucide-angular [img]="icons.RefreshCw" class="h-4 w-4 animate-spin text-zinc-400"></lucide-angular>
          } @else if (value() && !isOpen()) {
            <button 
              type="button"
              (click)="clearSelection($event)"
              class="hover:text-rose-500 text-zinc-300 transition-colors p-1"
            >
              <lucide-angular [img]="icons.X" class="h-4 w-4"></lucide-angular>
            </button>
          }
          <lucide-angular [img]="icons.ChevronDown" class="h-4 w-4 text-zinc-400 transition-transform duration-200" [class.rotate-180]="isOpen()"></lucide-angular>
        </div>
      </div>

      <!-- Dropdown Menu -->
      @if (isOpen()) {
        <div class="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl z-[100] max-h-[320px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
          
          <div class="overflow-y-auto flex-1 p-2 no-scrollbar">
            @if (filteredEmployees().length > 0) {
              <div class="space-y-1">
                @for (emp of filteredEmployees(); track emp.id) {
                  <button
                    type="button"
                    (click)="selectEmployee(emp)"
                    [class]="cn(
                      'w-full flex flex-col px-4 py-3 rounded-xl text-left transition-all group',
                      value() === emp.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    )"
                  >
                    <div class="flex items-center justify-between w-full">
                      <span class="text-[12px] font-black uppercase tracking-tight">{{ emp.firstName }} {{ emp.lastName }}</span>
                      @if (value() === emp.id) { <lucide-angular [img]="icons.Check" class="h-4 w-4 text-primary"></lucide-angular> }
                    </div>
                    @if (emp.role || emp.email) {
                      <div class="flex items-center gap-3 mt-0.5 opacity-60">
                        @if (emp.role) { <span class="text-[9px] font-bold uppercase tracking-tighter">{{ emp.role }}</span> }
                        @if (emp.email) { <span class="text-[9px] font-normal truncate">{{ emp.email }}</span> }
                      </div>
                    }
                  </button>
                }
              </div>
            } @else {
              <div class="py-10 px-4 text-center">
                <div class="h-10 w-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                  <lucide-angular [img]="icons.Search" class="h-4 w-4 text-zinc-300"></lucide-angular>
                </div>
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-relaxed">
                  No se encontraron responsables <br/> para "{{ searchTerm() }}"
                </p>
              </div>
            }
          </div>
          
          <div class="p-2 border-t border-zinc-50 dark:border-zinc-800 bg-zinc-50/30">
             <button type="button" (click)="clearSelection($event)" class="w-full py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-rose-500 transition-colors">
                Desasignar Responsable
             </button>
          </div>
        </div>
      }
    </div>
  `
})
export class EmployeeSelectorComponent implements OnInit {
  private api = inject(PersonalApiService);
  private session = inject(SessionService);
  private eRef = inject(ElementRef);

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  readonly icons = { User, Search, ChevronDown, Check, X, RefreshCw, Users };

  value = input<string>('');
  valueChange = output<string>();

  @Input() label?: string;
  @Input() placeholder: string = 'Sin Asignar';
  @Input() error?: string;
  @Input() disabled: boolean = false;

  // State
  employees = signal<Employee[]>([]);
  loading = signal(false);
  isOpen = signal(false);
  searchTerm = signal('');

  // Computed
  filteredEmployees = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const all = this.employees();

    if (!search) {
      return all.slice(0, 5); // Sugerencia del usuario: mostrar 5 inicialmente
    }

    return all.filter(e =>
      e.firstName.toLowerCase().includes(search) ||
      (e.lastName && e.lastName.toLowerCase().includes(search)) ||
      (e.role && e.role.toLowerCase().includes(search))
    );
  });

  selectedEmployee = computed(() => {
    return this.employees().find(e => e.id === this.value()) || null;
  });

  businessId = computed(() => this.session.activeNegocio()?.id || '');

  constructor() {
    effect(() => {
      if (this.businessId()) {
        this.loadEmployees();
      }
    });

    effect(() => {
      if (this.isOpen()) {
        setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
      }
    });
  }

  ngOnInit() { }

  async loadEmployees() {
    if (!this.businessId()) return;
    this.loading.set(true);
    try {
      this.employees.set(await this.api.getAll(this.businessId(), false));
    } finally {
      this.loading.set(false);
    }
  }

  toggleOpen() {
    if (this.disabled) return;
    this.isOpen.set(!this.isOpen());
    if (!this.isOpen()) {
      this.searchTerm.set('');
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.searchTerm.set('');
    }
  }

  selectEmployee(emp: Employee) {
    this.valueChange.emit(emp.id);
    this.isOpen.set(false);
    this.searchTerm.set('');
  }

  clearSelection(event: Event) {
    event.stopPropagation();
    this.valueChange.emit('');
    this.isOpen.set(false);
  }

  cn = cn;
}
