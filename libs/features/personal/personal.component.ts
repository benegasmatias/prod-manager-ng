import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalService } from '@core/api/personal.service';
import { SessionService } from '@core/session/session.service';
import { InvitationsService, InvitationCheckResult } from '@core/api/invitaciones.service';
import { Employee } from '@shared/models';
import { LucideAngularModule, Plus, Search, HardHat, Award, Pencil, Trash2, Power, Mail, Phone, X, AlertCircle, Loader2, User, Send, ChevronRight } from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';
import { MetricCardComponent, MetricCardsGridComponent } from '@shared/ui';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonSpinnerComponent, MetricCardComponent, MetricCardsGridComponent],
  templateUrl: './personal.component.html'
})
export class PersonalPageComponent {
  private personalService = inject(PersonalService);
  private sessionService = inject(SessionService);
  private invitationsService = inject(InvitationsService);

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

  // For Legacy/Edit mode (if needed later)
  editingStaffId = signal<string | null>(null);

  readonly icons = { Plus, Search, HardHat, Award, Pencil, Trash2, Power, Mail, Phone, X, AlertCircle, Loader2, User, Send, ChevronRight };

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
      this.isFormOpen.set(false);
      this.personalService.loadPersonal();
    } catch (err) {
      console.error('[Personal] Error saving member:', err);
    } finally {
      this.invitationSaving.set(false);
    }
  }

  async handleToggleStatus(staff: Employee) {
    await this.personalService.toggleStatus(staff);
  }

  async handleDelete(staff: Employee) {
    if (!confirm(`¿Estás seguro de eliminar a ${staff.firstName}?`)) return;
    await this.personalService.removeEmployee(staff.id);
  }
}
