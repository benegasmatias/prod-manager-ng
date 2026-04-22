import { Component, inject, signal, computed, effect, OnDestroy, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PersonalService } from '@core/api/personal.service';
import { SessionService } from '@core/session/session.service';
import { InvitationsService, InvitationCheckResult } from '@core/api/invitaciones.service';
import { Employee } from '@shared/models';
import { LucideAngularModule, Plus, Search, HardHat, Award, Pencil, Trash2, Power, Mail, Phone, X, AlertCircle, Loader2, User, Send, ChevronRight, RefreshCw, Clock } from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';
import { ConfirmService } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LucideAngularModule, ButtonSpinnerComponent],
  templateUrl: './personal.component.html'
})
export class PersonalPageComponent implements OnDestroy {
  private personalService = inject(PersonalService);
  private sessionService = inject(SessionService);
  private invitationsService = inject(InvitationsService);
  private confirmService = inject(ConfirmService);

  // States
  loading = this.personalService.loading;
  saving = this.personalService.saving;
  employees = this.personalService.items;
  invitations = this.personalService.invitations;
  searchTerm = signal('');

  // Invitation Modal States
  isFormOpen = signal(false);
  modalState = signal<'INPUT' | 'CHECKING' | 'RESULT'>('INPUT');
  formEmail = signal('');
  checkResult = signal<InvitationCheckResult | null>(null);
  invitationSaving = signal(false);
  formRole = signal('OPERATOR');

  // Resend States
  resendingId = signal<string | null>(null);
  resendCooldowns = signal<Record<string, number>>({});  // invitationId -> seconds remaining
  private cooldownInterval: any = null;

  // Plan Usage
  planUsage = this.sessionService.planUsage;
  canAddMember = computed(() => this.planUsage()?.canCreate.users ?? true);

  // For Legacy/Edit mode (if needed later)
  editingStaffId = signal<string | null>(null);

  readonly icons = { Plus, Search, HardHat, Award, Pencil, Trash2, Power, Mail, Phone, X, AlertCircle, Loader2, User, Send, ChevronRight, RefreshCw, Clock };

  filteredStaff = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.employees();
    if (!term) return all;
    return all.filter(e => 
      `${e.firstName} ${e.lastName || ''}`.toLowerCase().includes(term) ||
      (e.specialties || '').toLowerCase().includes(term)
    );
  });

  constructor() {
    effect(() => {
      this.personalService.loadPersonal();
    });

    // Start cooldown ticker
    this.cooldownInterval = setInterval(() => {
      const current = this.resendCooldowns();
      const updated: Record<string, number> = {};
      let hasActive = false;
      for (const [id, seconds] of Object.entries(current)) {
        if (seconds > 1) {
          updated[id] = seconds - 1;
          hasActive = true;
        }
      }
      if (hasActive || Object.keys(current).length !== Object.keys(updated).length) {
        this.resendCooldowns.set(updated);
      }
    }, 1000);

    // Initialize cooldowns from existing invitations
    effect(() => {
      const invites = this.invitations();
      // Use untracked to avoid circular dependency (read + write same signal in effect)
      const existingCooldowns = untracked(() => this.resendCooldowns());
      const cooldowns: Record<string, number> = {};
      let hasNew = false;
      for (const inv of invites) {
        if (existingCooldowns[inv.id]) {
          cooldowns[inv.id] = existingCooldowns[inv.id];
        } else if (inv.resendCount > 0 && inv.lastResentAt) {
          const cooldownSeconds = Math.pow(2, inv.resendCount - 1) * 60;
          const elapsed = (Date.now() - new Date(inv.lastResentAt).getTime()) / 1000;
          const remaining = Math.ceil(cooldownSeconds - elapsed);
          if (remaining > 0) {
            cooldowns[inv.id] = remaining;
            hasNew = true;
          }
        }
      }
      if (hasNew) {
        this.resendCooldowns.set(cooldowns);
      }
    });
  }

  ngOnDestroy() {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  cn = cn;

  openNew() {
    this.editingStaffId.set(null);
    this.formEmail.set('');
    this.formRole.set('OPERATOR');
    this.modalState.set('INPUT');
    this.checkResult.set(null);
    this.isFormOpen.set(true);
  }

  handleEdit(staff: Employee) {
    this.editingStaffId.set(staff.id);
    this.formEmail.set(staff.email || '');
    this.formRole.set(staff.role || 'OPERATOR');
    // We can use a different modal state or a separate edit modal
    // For now, let's use the same modal but skip check-email
    this.modalState.set('RESULT');
    this.checkResult.set({
      email: staff.email || '',
      userExists: true,
      alreadyMember: false,
      pendingInvitation: false,
      user: { id: '', firstName: staff.firstName, lastName: staff.lastName || '' }
    });
    this.isFormOpen.set(true);
  }

  async handleVerifyEmail() {
    const email = this.formEmail();
    const businessId = this.sessionService.activeId();
    if (!email || !businessId) return;

    this.modalState.set('CHECKING');
    try {
      const result = await this.invitationsService.checkEmail(businessId, email);
      this.checkResult.set(result);
      this.modalState.set('RESULT');
    } catch (err) {
      console.error('[Personal] Error verifying email:', err);
      this.modalState.set('INPUT');
    }
  }

  async handleSendInvitation() {
    const email = this.formEmail();
    const role = this.formRole();
    const businessId = this.sessionService.activeId();
    if (!email || !businessId) return;

    this.invitationSaving.set(true);
    try {
      if (this.editingStaffId()) {
        await this.personalService.saveEmployee({ role }, this.editingStaffId()!);
      } else {
        await this.invitationsService.invite(businessId, email, role);
      }
      await this.sessionService.refreshPlanUsage();
      this.isFormOpen.set(false);
      this.personalService.loadPersonal(true);
    } catch (err) {
      console.error('[Personal] Error saving member:', err);
    } finally {
      this.invitationSaving.set(false);
    }
  }

  async handleResend(invite: any) {
    const businessId = this.sessionService.activeId();
    if (!businessId) return;

    this.resendingId.set(invite.id);
    try {
      const result = await this.invitationsService.resend(businessId, invite.id);
      // Set cooldown from server response
      const nextResendAt = new Date(result.nextResendAt).getTime();
      const secondsRemaining = Math.ceil((nextResendAt - Date.now()) / 1000);
      this.resendCooldowns.set({
        ...this.resendCooldowns(),
        [invite.id]: Math.max(secondsRemaining, 0)
      });
    } catch (err: any) {
      console.error('[Personal] Error resending invitation:', err);
    } finally {
      this.resendingId.set(null);
    }
  }

  canResend(invite: any): boolean {
    const cooldown = this.resendCooldowns()[invite.id];
    return !cooldown || cooldown <= 0;
  }

  getResendLabel(invite: any): string {
    const cooldown = this.resendCooldowns()[invite.id];
    if (cooldown && cooldown > 0) {
      const mins = Math.floor(cooldown / 60);
      const secs = cooldown % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }
    return 'Reenviar';
  }

  async handleDeleteInvitation(invite: any) {
    const confirmed = await this.confirmService.confirm({
      title: 'Cancelar invitación',
      message: `¿Estás seguro de cancelar la invitación para ${invite.email}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Sí, cancelar',
      cancelLabel: 'No, mantener',
      type: 'warning'
    });
    if (!confirmed) return;
    
    const businessId = this.sessionService.activeId();
    if (!businessId) return;

    try {
      await this.invitationsService.cancel(businessId, invite.id);
      this.personalService.loadPersonal(true);
    } catch (err) {
      console.error('[Personal] Error cancelling invitation:', err);
    }
  }

  async handleToggleStatus(staff: Employee) {
    await this.personalService.toggleStatus(staff);
  }

  async handleDelete(staff: Employee) {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar integrante',
      message: `¿Estás seguro de eliminar a ${staff.firstName}? Se perderán todos los datos asociados.`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      type: 'danger'
    });
    if (!confirmed) return;
    await this.personalService.removeEmployee(staff.id);
    await this.sessionService.refreshPlanUsage();
  }
}
