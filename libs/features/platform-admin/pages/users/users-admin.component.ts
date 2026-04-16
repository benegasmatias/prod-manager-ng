import { Component, OnInit, inject, signal, ChangeDetectionStrategy, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UserProfile } from '@shared/models';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { UserEditModalComponent } from './components/user-edit-modal/user-edit-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UserDetailComponent, UserEditModalComponent, FormsModule],
  templateUrl: './users-admin.component.html',
  styleUrl: './users-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersAdminComponent implements OnInit {
  private adminService = inject(PlatformAdminService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);
  
  // Data Signals
  users = signal<UserProfile[]>([]);
  meta = signal<any>(null);
  stats = signal<any>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  // UI State Signals
  activeTab = signal<'users' | 'invitations' | 'audit'>('users');
  selectedUserForDetail = signal<string | null>(null);
  selectedUserForEdit = signal<UserProfile | null>(null);
  
  // Data Signals (Invitations)
  invitations = signal<any[]>([]);
  invitationsMeta = signal<any>(null);
  invitationsLoading = signal<boolean>(false);

  // Expose service metadata to template (Signals chain)
  metadata = this.adminService.metadata;

  // Filter Signals
  search = signal<string>('');
  statusFilter = signal<string>('');
  planFilter = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = 10;
  
  constructor() {
    // Reload when filters or tab change
    effect(() => {
      const tab = this.activeTab();
      // Access filters to trigger effect
      this.search();
      this.statusFilter();
      this.planFilter();

      untracked(() => {
        if (tab === 'users') {
          this.loadUsers(1); 
        } else if (tab === 'invitations') {
          this.loadInvitations(1);
        }
      });
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.loadStats();
    this.ensureMetadata();
  }

  async ensureMetadata() {
    try {
      await this.adminService.ensureMetadataLoaded();
    } catch (e) {
      this.toast.error('Error al cargar configuración global');
    }
  }

  async loadInvitations(page: number = 1) {
    try {
      this.invitationsLoading.set(true);
      const response = await this.adminService.getInvitations(page, this.pageSize, {
        search: this.search(),
        status: this.statusFilter()
      });
      this.invitations.set(response.items);
      this.invitationsMeta.set(response.meta);
    } catch (e) {
      this.toast.error('Error al cargar invitaciones');
    } finally {
      this.invitationsLoading.set(false);
    }
  }

  async resendInvitation(inv: any) {
    const confirmed = await this.confirmService.confirm({
      title: 'RE-ENVIAR INVITACIÓN',
      message: `¿Deseas enviar nuevamente la invitación a ${inv.email}?`,
      type: 'info',
      confirmLabel: 'ENVIAR',
      cancelLabel: 'Cancelar'
    });

    if (!confirmed) return;

    try {
      await this.adminService.resendInvitation(inv.id);
      this.toast.success('Invitación re-enviada correctamente');
      this.loadInvitations();
    } catch (e) {
      this.toast.error('Error al re-enviar invitación');
    }
  }

  async cancelInvitation(inv: any) {
    const confirmed = await this.confirmService.confirm({
      title: 'CANCELAR INVITACIÓN',
      message: `¿Estás seguro de cancelar la invitación para ${inv.email}? El enlace dejará de ser válido.`,
      type: 'danger',
      confirmLabel: 'CANCELAR',
      cancelLabel: 'Volver'
    });

    if (!confirmed) return;

    try {
      await this.adminService.cancelInvitation(inv.id);
      this.toast.warning('Invitación cancelada');
      this.loadInvitations();
    } catch (e) {
      this.toast.error('Error al cancelar invitación');
    }
  }

  async loadStats() {
    try {
      const data = await this.adminService.getStats();
      this.stats.set(data.users);
    } catch (e) {
      console.error('Error loading user stats');
    }
  }

  async loadUsers(page: number = this.currentPage()) {
    try {
      this.loading.set(true);
      this.error.set(null);
      this.currentPage.set(page);
      
      const response = await this.adminService.getUsers(page, this.pageSize, {
        search: this.search(),
        status: this.statusFilter(),
        plan: this.planFilter()
      });
      
      if (Array.isArray(response)) {
        this.users.set(response);
        this.meta.set({ totalItems: response.length, totalPages: 1, currentPage: 1 });
      } else {
        this.users.set(response.items || []);
        this.meta.set(response.meta);
      }
    } catch (e: any) {
      this.error.set(e.message || 'No se pudieron cargar los usuarios');
      this.toast.error('Error al cargar usuarios');
    } finally {
      this.loading.set(false);
    }
  }

  getStatCount(status: string): number {
    if (!this.stats()?.breakdown) return 0;
    return this.stats().breakdown.find((s: any) => s.status === status)?.count || 0;
  }

  async goToPage(page: number) {
    if (page < 1 || (this.meta() && page > this.meta().totalPages)) return;
    await this.loadUsers(page);
  }

  // --- ACTIONS ---

  async toggleUserBlock(user: UserProfile) {
    const isBlocked = user.status === 'BLOCKED';
    const action = isBlocked ? 'DESBLOQUEAR' : 'BLOQUEAR';
    
    const confirmed = await this.confirmService.confirm({
      title: `${action} ACCESO`,
      message: `¿Estás seguro de que quieres ${action.toLowerCase()} el acceso a ${user.fullName || user.email}?`,
      type: isBlocked ? 'warning' : 'danger',
      confirmLabel: action,
      cancelLabel: 'Volver'
    });

    if (!confirmed) return;
    
    try {
        if (isBlocked) {
            await this.adminService.unblockUser(user.id);
            this.toast.success(`Usuario ${user.email} desbloqueado`);
        } else {
            await this.adminService.blockUser(user.id);
            this.toast.warning(`Usuario ${user.email} bloqueado`);
        }
        this.loadUsers();
        this.loadStats();
    } catch (e: any) {
        this.toast.error(`Error al ${action.toLowerCase()} usuario`);
    }
  }

  async toggleUserSuspension(user: UserProfile) {
    const isSuspended = user.status === 'SUSPENDED';
    const action = isSuspended ? 'REACTIVAR' : 'SUSPENDER';
    
    const confirmed = await this.confirmService.confirm({
      title: `${action} CUENTA`,
      message: `¿Estás seguro de que quieres ${action.toLowerCase()} la cuenta de ${user.fullName || user.email}?`,
      type: 'info',
      confirmLabel: action,
      cancelLabel: 'Volver'
    });

    if (!confirmed) return;
    
    try {
        if (isSuspended) {
            await this.adminService.reactivateUser(user.id);
        } else {
            await this.adminService.suspendUser(user.id);
        }
        this.toast.success(`Usuario ${user.email} ${isSuspended ? 'reactivado' : 'suspendido'}`);
        this.loadUsers();
        this.loadStats();
    } catch (e: any) {
        this.toast.error(`Error al ${action.toLowerCase()} usuario`);
    }
  }

  async approve(user: UserProfile) {
    const isNew = user.status === 'PENDING';
    const action = isNew ? 'APROBAR' : 'ACTIVAR';
    
    const confirmed = await this.confirmService.confirm({
      title: `${action} USUARIO`,
      message: `¿Deseas habilitar permanentemente el acceso a ${user.fullName || user.email}?`,
      type: 'info',
      confirmLabel: action,
      cancelLabel: 'Cancelar'
    });

    if (!confirmed) return;
    
    try {
        await this.adminService.approveUser(user.id);
        this.toast.success(`Usuario ${user.email} habilitado`);
        this.loadUsers();
        this.loadStats();
    } catch (e: any) {
        this.toast.error('Error al activar usuario');
    }
  }

  async delete(user: UserProfile) {
    const confirmed = await this.confirmService.confirm({
      title: 'ELIMINAR USUARIO',
      message: `¿Estás seguro de eliminar a ${user.email}? Esta acción es un borrado lógico y el usuario no podrá volver a loguearse.`,
      type: 'danger',
      confirmLabel: 'ELIMINAR',
      cancelLabel: 'Cancelar'
    });

    if (!confirmed) return;
    
    try {
      await this.adminService.deleteUser(user.id);
      this.toast.success(`Usuario ${user.email} eliminado lógicamente`);
      this.loadUsers();
      this.loadStats();
    } catch (e: any) {
      this.toast.error('Error al eliminar usuario');
    }
  }
}
