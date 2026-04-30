import { Component, Input, Output, EventEmitter, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Upload, Loader2, FileCheck, X, Image, FileSearch, ExternalLink } from 'lucide-angular';
import { FilesApiService } from '@core/api/files.api.service';
import { ConfirmService } from '@shared/ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-print3d-item-enhancement',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './print3d-enhancement.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Print3dItemEnhancementComponent {
  @Input({ required: true }) item: any;
  @Input() fieldKey: string = 'url_stl';
  @Output() onFileUpload = new EventEmitter<any>();
  @Output() onFileDelete = new EventEmitter<any>();
  @Output() onUpdate = new EventEmitter<void>();

  private filesApi = inject(FilesApiService);
  private confirm = inject(ConfirmService);
  isUploading = signal(false);
  readonly icons = { Upload, Loader2, FileCheck, X, Image, FileSearch, ExternalLink };

  isImage() {
    return this.fieldKey === 'reference_image';
  }

  currentFile() {
    return this.isImage() ? this.item.referenceImages?.[0] : this.item.stlFile;
  }

  async onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.isUploading.set(true);
    try {
      const res = await this.filesApi.uploadFile(file);
      if (this.isImage()) {
        this.item.referenceImages = [res];
        this.item.reference_image = res.url; // Shadow field for tracking
      } else {
        this.item.stlFile = res;
        this.item.url_stl = res.url; // Shadow field for tracking
      }
      this.onFileUpload.emit({ fieldKey: this.fieldKey, file: res });
      this.onUpdate.emit();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Error al subir el archivo');
    } finally {
      this.isUploading.set(false);
      event.target.value = '';
    }
  }

  async clearFile() {
    if (!this.item.stlFile) return;

    const confirmed = await this.confirm.confirm({
      title: 'Eliminar Diseño',
      message: '¿Borrar este archivo permanentemente de la nube?',
      confirmLabel: 'Sí, borrar',
      type: 'danger'
    });

    if (confirmed) {
      this.isUploading.set(true);
      try {
        const fileToDelete = this.currentFile();
        await this.filesApi.deleteFile(fileToDelete.path);

        if (this.isImage()) {
          this.item.referenceImages = [];
          this.item.reference_image = '';
        } else {
          this.item.stlFile = undefined;
          this.item.url_stl = '';
        }

        this.onFileDelete.emit({ fieldKey: this.fieldKey, path: fileToDelete.path });
        this.onUpdate.emit();
      } catch (error) {
        console.error('Delete failed', error);
      } finally {
        this.isUploading.set(false);
      }
    }
  }
  isValidUrl(url: string | undefined): boolean {
    if (!url) return false;
    try {
      new URL(url);
      return url.startsWith('http');
    } catch {
      return false;
    }
  }
}
