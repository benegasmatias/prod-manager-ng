import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlatformAdminService } from '../../../../services/platform-admin.service';
import { ToastService } from '../../../../../../shared/services/toast.service';

@Component({
  selector: 'app-user-edit-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-edit-modal.component.html',
  styles: [`
    :host { display: block; }
  `]
})
export class UserEditModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(PlatformAdminService);
  private toast = inject(ToastService);

  @Input() user: any;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  editForm!: FormGroup;
  saving = signal<boolean>(false);
  
  // Expose centralized metadata
  metadata = this.adminService.metadata;

  ngOnInit() {
    this.ensureMetadata();
    this.editForm = this.fb.group({
      fullName: [this.user.fullName || '', [Validators.required]],
      globalRole: [this.user.globalRole || 'USER', [Validators.required]],
      plan: [this.user.plan || 'free', [Validators.required]],
      active: [this.user.active ?? true]
    });
  }

  async ensureMetadata() {
    try {
      await this.adminService.ensureMetadataLoaded();
    } catch (e) {
      console.error('Error loading metadata', e);
    }
  }

  async save() {
    if (this.editForm.invalid) return;
    
    try {
      this.saving.set(true);
      await this.adminService.updateUser(this.user.id, this.editForm.value);
      this.toast.success('Usuario actualizado correctamente');
      this.updated.emit();
      this.close.emit();
    } catch (e) {
      this.toast.error('Error al actualizar el usuario');
    } finally {
      this.saving.set(false);
    }
  }
}
