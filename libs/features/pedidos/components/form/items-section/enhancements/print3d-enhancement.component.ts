import { Component, Input, Output, EventEmitter, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Upload, Loader2, FileCheck, X } from 'lucide-angular';
import { FilesApiService } from '@core/api/files.api.service';
import { ConfirmService } from '@shared/ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-print3d-item-enhancement',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-3">
      <input type="file" #fileInput class="hidden" accept=".stl" (change)="onFileSelected($event)">
      
      <div class="flex items-center gap-3">
        <div class="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
        <span class="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Insumos y Archivos</span>
        <div class="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
      </div>

      @if (!item.stlFile) {
        <button
          type="button"
          (click)="fileInput.click()"
          [disabled]="isUploading()"
          class="h-12 w-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:border-primary hover:text-primary transition-all disabled:opacity-50"
        >
          @if (isUploading()) {
            <lucide-angular [img]="icons.Loader2" class="h-4 w-4 animate-spin"></lucide-angular>
          } @else {
            <lucide-angular [img]="icons.Upload" class="h-4 w-4"></lucide-angular>
            Adjuntar Archivo .STL
          }
        </button>
      } @else {
        <div class="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[9px]">STL</div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-[11px] font-black text-primary truncate">{{ item.stlFile.fileName }}</span>
              <span class="text-[9px] font-bold text-primary/50 uppercase tracking-tighter">{{ (item.stlFile.size / 1024 / 1024) | number:'1.1-1' }} MB</span>
            </div>
          </div>
          <button type="button" (click)="clearFile()" class="h-8 w-8 rounded-lg hover:bg-rose-500 hover:text-white text-zinc-300 transition-all flex items-center justify-center">
            <lucide-angular [img]="icons.X" class="h-3.5 w-3.5"></lucide-angular>
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Print3dItemEnhancementComponent {
  @Input({ required: true }) item: any;
  @Output() onFileUpload = new EventEmitter<string>();
  @Output() onFileDelete = new EventEmitter<string>();
  @Output() onUpdate = new EventEmitter<void>();

  private filesApi = inject(FilesApiService);
  private confirm = inject(ConfirmService);
  isUploading = signal(false);
  readonly icons = { Upload, Loader2, FileCheck, X };

  async onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.isUploading.set(true);
    try {
      const res = await this.filesApi.uploadFile(file);
      this.item.stlFile = res;
      this.onFileUpload.emit(res.path);
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
        await this.filesApi.deleteFile(this.item.stlFile.path);
        this.onFileDelete.emit(this.item.stlFile.path);
        this.item.stlFile = undefined;
        this.onUpdate.emit();
      } catch (error) {
        console.error('Delete failed', error);
      } finally {
        this.isUploading.set(false);
      }
    }
  }
}
