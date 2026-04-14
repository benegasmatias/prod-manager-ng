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
  template: `
    <div class="flex flex-col gap-3">
      <!-- Manual URL Input (Always available as fallback) -->
        <div class="flex items-center gap-2">
          @if (isImage()) {
            <input 
              type="text" 
              [(ngModel)]="item.reference_image" 
              (ngModelChange)="onUpdate.emit()"
              placeholder="URL de imagen (Pinterest, etc)..."
              class="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/20 px-4 py-2 text-sm font-black focus:outline-none focus:ring-4 focus:ring-primary/5 dark:border-zinc-800 transition-all"
            >
          } @else {
            <input 
              type="text" 
              [(ngModel)]="item.url_stl" 
              (ngModelChange)="onUpdate.emit()"
              placeholder="URL del modelo (Thingiverse, Printables)..."
              class="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/20 px-4 py-2 text-sm font-black focus:outline-none focus:ring-4 focus:ring-primary/5 dark:border-zinc-800 transition-all"
            >
          }

          @if (isValidUrl(isImage() ? item.reference_image : item.url_stl)) {
            <a 
              [href]="isImage() ? item.reference_image : item.url_stl" 
              target="_blank"
              class="h-12 w-12 flex-shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-primary hover:bg-primary/10 transition-all border border-zinc-200 dark:border-zinc-800"
              title="Abrir enlace"
            >
              <lucide-angular [img]="icons.ExternalLink" class="h-4 w-4"></lucide-angular>
            </a>
          }
        </div>

      <input type="file" #fileInput class="hidden" [accept]="isImage() ? 'image/*' : '.stl'" (change)="onFileSelected($event)">
      
      @if (fieldKey === 'url_stl') {
        <div class="flex items-center ">
          <div class="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
          <span class="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Insumos y Archivos</span>
          <div class="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
        </div>
      }

      @if (!currentFile()) {
        <button
          type="button"
          (click)="fileInput.click()"
          [disabled]="isUploading()"
          class="h-12 w-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:border-primary hover:text-primary transition-all disabled:opacity-50"
        >
          @if (isUploading()) {
            <lucide-angular [img]="icons.Loader2" class="h-4 w-4 animate-spin"></lucide-angular>
          } @else {
            <lucide-angular [img]="isImage() ? icons.Image : icons.Upload" class="h-4 w-4"></lucide-angular>
            {{ isImage() ? 'Adjuntar Imagen Referencia' : 'Adjuntar Archivo .STL' }}
          }
        </button>
      } @else {
        <div class="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
          <div class="flex items-center gap-3 overflow-hidden">
            @if (isImage()) {
              <div class="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700">
                <img [src]="currentFile().url" class="w-full h-full object-cover">
              </div>
            } @else {
              <div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[9px]">STL</div>
            }
            <div class="flex flex-col overflow-hidden">
              <span class="text-[11px] font-black text-primary truncate">{{ currentFile().fileName }}</span>
              <span class="text-[9px] font-bold text-primary/50 uppercase tracking-tighter">{{ (currentFile().size / 1024 / 1024) | number:'1.1-1' }} MB</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" (click)="clearFile()" class="h-8 w-8 rounded-lg hover:bg-rose-500 hover:text-white text-zinc-300 transition-all flex items-center justify-center">
              <lucide-angular [img]="icons.X" class="h-3.5 w-3.5"></lucide-angular>
            </button>
          </div>
        </div>
      }
    </div>
  `,
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
