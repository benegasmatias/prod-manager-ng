import { Component, inject, signal, ViewChild, ElementRef, model, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Building2, ChevronDown, Plus, Settings, Monitor, Trash2, X } from 'lucide-angular';
import { SessionService } from '../../../session/session.service';
import { ConfirmService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { Rubro, Negocio } from '../../../../shared/models';

@Component({
  selector: 'app-business-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './business-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessSelectorComponent {
  @ViewChild('businessDialog') businessDialog!: ElementRef<HTMLDialogElement>;
  
  sessionService = inject(SessionService);
  confirmService = inject(ConfirmService);
  private router = inject(Router);
  
  dropdownOpen = signal(false);
  isDialogOpen = signal(false);
  editingId = signal<string | null>(null);
  formNombre = model('');
  formRubro = model<Rubro>('GENERICO');
  isSaving = signal(false);

  readonly icons = { Building2, ChevronDown, Plus, Settings, Monitor, Trash2, X };

  handleOpenAdd() {
    this.editingId.set(null);
    this.formNombre.set('');
    this.formRubro.set('GENERICO');
    this.isDialogOpen.set(true);
    this.dropdownOpen.set(false);
    this.businessDialog.nativeElement.showModal();
  }

  handleOpenEdit(event: Event, negocio: Negocio) {
    event.stopPropagation();
    this.dropdownOpen.set(false);
    this.sessionService.setActiveId(negocio.id);
    this.router.navigate(['/ajustes']);
  }

  async handleSave() {
    if (!this.formNombre()) return;
    
    this.isSaving.set(true);
    try {
      if (this.editingId()) {
        await this.sessionService.updateNegocio(this.editingId()!, {
          nombre: this.formNombre(),
          rubro: this.formRubro()
        });
      } else {
        const result = await this.sessionService.addNegocio(this.formNombre(), this.formRubro());
        if (result?.id) {
          this.sessionService.setActiveId(result.id);
        }
      }
      this.closeDialog();
    } catch (error) {
      console.error('Error saving business', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  async handleDelete(id: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Negocio',
      message: '¿Estás seguro de eliminar este negocio? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      type: 'danger'
    });

    if (confirmed) {
      await this.sessionService.removeNegocio(id);
      this.closeDialog();
    }
  }

  closeDialog() {
    this.businessDialog.nativeElement.close();
    this.isDialogOpen.set(false);
  }
}
