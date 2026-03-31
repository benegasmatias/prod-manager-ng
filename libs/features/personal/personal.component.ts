import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalService } from '@core/api/personal.service';
import { SessionService } from '@core/session/session.service';
import { Employee } from '@shared/models';
import { LucideAngularModule, Plus, Search, HardHat, Award, Pencil, Trash2, Power, Mail, Phone, X } from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonSpinnerComponent],
  templateUrl: './personal.component.html'
})
export class PersonalPageComponent {
  private personalService = inject(PersonalService);
  private sessionService = inject(SessionService);

  // States
  loading = this.personalService.loading;
  saving = this.personalService.saving;
  employees = this.personalService.items;
  stats = this.personalService.stats;
  searchTerm = signal('');

  // Dialog state
  isFormOpen = signal(false);
  editingStaffId = signal<string | null>(null);

  // Form fields
  formFirstName = signal('');
  formLastName = signal('');
  formEmail = signal('');
  formPhone = signal('');
  formSpecialties = signal('');
  formActive = signal(true);

  readonly icons = { Plus, Search, HardHat, Award, Pencil, Trash2, Power, Mail, Phone, X };

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
    this.formFirstName.set('');
    this.formLastName.set('');
    this.formEmail.set('');
    this.formPhone.set('');
    this.formSpecialties.set('');
    this.formActive.set(true);
    this.isFormOpen.set(true);
  }

  editStaff(staff: Employee) {
    this.editingStaffId.set(staff.id);
    this.formFirstName.set(staff.firstName);
    this.formLastName.set(staff.lastName || '');
    this.formEmail.set(staff.email || '');
    this.formPhone.set(staff.phone || '');
    this.formSpecialties.set(staff.specialties || '');
    this.formActive.set(staff.active);
    this.isFormOpen.set(true);
  }

  async handleSave() {
    if (!this.formFirstName()) return;
    
    const data: Partial<Employee> = {
      firstName: this.formFirstName(),
      lastName: this.formLastName(),
      email: this.formEmail(),
      phone: this.formPhone(),
      specialties: this.formSpecialties(),
      active: this.formActive()
    };

    await this.personalService.saveEmployee(data, this.editingStaffId() || undefined);
    this.isFormOpen.set(false);
  }

  async handleToggleStatus(staff: Employee) {
    await this.personalService.toggleStatus(staff);
  }

  async handleDelete(staff: Employee) {
    if (!confirm(`¿Estás seguro de eliminar a ${staff.firstName}?`)) return;
    await this.personalService.removeEmployee(staff.id);
  }
}
