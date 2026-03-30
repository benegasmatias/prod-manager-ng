import { Component, Input, Output, EventEmitter, signal, computed, inject, ElementRef, HostListener, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User, Search, ChevronDown, Check, X, UserPlus, Loader2, RefreshCw } from 'lucide-angular';
import { Client } from '@shared/models';
import { ClientesApiService } from '@core/api/clientes.api.service';
import { SessionService } from '@core/session/session.service';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-client-selector',
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
            @else { <lucide-angular [img]="icons.User" class="h-4 w-4"></lucide-angular> }
          </div>
          
          @if (isOpen()) {
            <input
              #searchInput
              type="text"
              class="bg-transparent border-none outline-none text-[13px] font-bold w-full text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400"
              [placeholder]="'Empiece a escribir para buscar...'"
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
              (click)="$event.stopPropagation()"
            />
          } @else {
            <div class="flex flex-col truncate">
              <span [class]="cn('text-[13px] font-bold truncate transition-all', selectedClient() ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400')">
                {{ selectedClient() ? selectedClient()?.name : placeholder }}
              </span>
              @if (selectedClient()?.email && !isOpen()) {
                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-tight -mt-0.5 truncate">
                  {{ selectedClient()?.email }}
                </span>
              }
            </div>
          }
        </div>

        <div class="flex items-center gap-1 ml-2">
          @if (loading()) {
            <lucide-angular [img]="icons.RefreshCw" class="h-4 w-4 animate-spin text-zinc-400"></lucide-angular>
          } @else if (value && !isOpen()) {
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

      @if (error) {
        <p class="text-[10px] font-bold text-rose-500 ml-2 uppercase tracking-tight">{{ error }}</p>
      }

      <!-- Dropdown Menu -->
      @if (isOpen()) {
        <div class="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl z-[100] max-h-[320px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
          
          <div class="overflow-y-auto flex-1 p-2 no-scrollbar">
            @if (filteredClients().length > 0) {
              <div class="space-y-1">
                @for (client of filteredClients(); track client.id) {
                  <button
                    type="button"
                    (click)="selectClient(client)"
                    [class]="cn(
                      'w-full flex flex-col px-4 py-3 rounded-xl text-left transition-all group',
                      value === client.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    )"
                  >
                    <div class="flex items-center justify-between w-full">
                      <span class="text-[12px] font-black uppercase tracking-tight">{{ client.name }}</span>
                      @if (value === client.id) { <lucide-angular [img]="icons.Check" class="h-4 w-4 text-primary"></lucide-angular> }
                    </div>
                    @if (client.email || client.phone) {
                      <div class="flex items-center gap-3 mt-0.5 opacity-60">
                        @if (client.email) { <span class="text-[9px] font-bold truncate">{{ client.email }}</span> }
                        @if (client.phone) { <span class="text-[9px] font-bold italic">{{ client.phone }}</span> }
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
                  No se encontraron clientes <br/> para "{{ searchTerm() }}"
                </p>
              </div>
            }
          </div>

          <!-- Create New Option -->
          <div class="p-2 bg-zinc-50/50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              (click)="createNew($event)"
              class="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all bg-primary/5 hover:bg-primary/10 text-primary group"
            >
              <div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-angular [img]="icons.UserPlus" class="h-4 w-4"></lucide-angular>
              </div>
              <div class="flex flex-col">
                <span class="text-[11px] font-black uppercase tracking-widest">Registrar Nuevo Cliente</span>
                <span class="text-[9px] font-medium opacity-60 italic mt-0.5">Añadir "{{ searchTerm() || '...' }}" a la base de datos</span>
              </div>
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class ClientSelectorComponent implements OnInit {
  private api = inject(ClientesApiService);
  private session = inject(SessionService);
  private eRef = inject(ElementRef);
 
  readonly icons = { User, Search, ChevronDown, Check, X, UserPlus, RefreshCw };

  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  
  @Input() label?: string;
  @Input() placeholder: string = 'Seleccionar cliente...';
  @Input() error?: string;
  @Input() disabled: boolean = false;

  // State
  clients = signal<Client[]>([]);
  loading = signal(false);
  isOpen = signal(false);
  searchTerm = signal('');

  // Computed
  filteredClients = computed(() => {
    const search = this.searchTerm().toLowerCase();
    return this.clients().filter(c => 
      c.name.toLowerCase().includes(search) || 
      (c.email && c.email.toLowerCase().includes(search))
    );
  });

  selectedClient = computed(() => {
    return this.clients().find(c => c.id === this.value) || null;
  });

  businessId = computed(() => this.session.activeNegocio()?.id || '');

  constructor() {
    effect(() => {
      if (this.businessId()) {
        this.loadClients();
      }
    });
  }

  ngOnInit() { }

  async loadClients() {
    if (!this.businessId()) return;
    this.loading.set(true);
    try {
      this.clients.set(await this.api.getListing(this.businessId()));
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

  selectClient(client: Client) {
    this.valueChange.emit(client.id);
    this.isOpen.set(false);
    this.searchTerm.set('');
  }

  clearSelection(event: Event) {
    event.stopPropagation();
    this.valueChange.emit('');
  }

  createNew(event: Event) {
    event.stopPropagation();
    // For now, just a placeholder or emit event
    this.isOpen.set(false);
    this.searchTerm.set('');
    // TODO: Open ClienteFormDialog
  }

  cn = cn;
}
