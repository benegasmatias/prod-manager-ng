import { Component, OnInit, computed, inject, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Search, ExternalLink, Phone, Mail, User, DollarSign, Pencil, Trash2, Star } from 'lucide-angular';
import { ClientesService } from '../../core/api/clientes.service';
import { Cliente, ClienteStats } from '../../core/models/cliente.model';
import { SessionService } from '../../core/session/session.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ClienteFormDialogComponent } from '../../shared/ui/clientes/cliente-form-dialog/cliente-form-dialog.component';
import { PaginatorComponent } from '../../shared/ui/paginator/paginator.component';
import { ConfirmService } from '@shared/ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    LucideAngularModule,
    ClienteFormDialogComponent,
    PaginatorComponent
  ],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit, OnDestroy {
  // Services
  private clientesService = inject(ClientesService);
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);

  // Icons
  readonly icons = { Plus, Search, ExternalLink, Phone, Mail, User, DollarSign, Pencil, Trash2, Star };

  // Local State
  searchTerm = signal<string>('');
  isFormOpen = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  editingClient = signal<Cliente | null>(null);
  
  // Pagination State
  page = signal<number>(1);
  pageSize = signal<number>(10);
  
  // Computed & Subscribed Data
  activeNegocioId = computed(() => this.sessionService.activeNegocio()?.id || null);
  clientes = this.clientesService.clientes;
  total = this.clientesService.total;
  loading = this.clientesService.loading;
  
  stats = computed<ClienteStats>(() => {
    return this.clientesService.calculateStats(this.clientes(), this.total());
  });

  // Flow control
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor() {
    effect(() => {
      const id = this.activeNegocioId();
      const p = this.page();
      const s = this.searchTerm(); // Tracking these signals triggers the effect
      if (id) {
        this.clientesService.loadClientes(id, s, p, this.pageSize());
      }
    });
  }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      // Whenever we search, we reset to page 1
      this.searchTerm.set(term);
      this.page.set(1);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Actions
  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }
  
  onPageChange(newPage: number): void {
    this.page.set(newPage);
  }

  handleNewClient(): void {
    this.editingClient.set(null);
    this.isFormOpen.set(true);
  }

  handleEdit(event: Event, client: Cliente): void {
    event.stopPropagation();
    this.editingClient.set(client);
    this.isFormOpen.set(true);
  }

  async handleDelete(event: Event, client: Cliente): Promise<void> {
    event.stopPropagation();
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar cliente',
      message: `¿Estás seguro de eliminar a ${client.name}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      type: 'danger'
    });
    if (!confirmed) return;

    this.clientesService.delete(client.id).subscribe({
      next: () => {
        const id = this.activeNegocioId();
        if (id) this.clientesService.loadClientes(id, this.searchTerm(), this.page(), this.pageSize());
      },
      error: (e) => console.error('Falló la eliminación', e)
    });
  }

  handleSaveCliente(data: Partial<Cliente>): void {
    const id = this.activeNegocioId();
    if (!id) return;
    
    this.isSaving.set(true);
    const client = this.editingClient();
    const action$ = client 
      ? this.clientesService.update(client.id, data)
      : this.clientesService.create(id, data);

    action$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isFormOpen.set(false);
        this.clientesService.loadClientes(id, this.searchTerm(), this.page(), this.pageSize());
      },
      error: (e) => {
        console.error('Error al guardar cliente', e);
        this.isSaving.set(false);
      }
    });
  }

  goToClient(clientId: string): void {
    this.router.navigate(['/clientes', clientId]);
  }
}
