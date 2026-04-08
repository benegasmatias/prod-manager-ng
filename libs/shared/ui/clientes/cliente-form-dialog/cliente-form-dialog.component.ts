import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../../../core/models/cliente.model';
import { LucideAngularModule, X, Save, Mail, Phone, User, StickyNote } from 'lucide-angular';
import { ButtonSpinnerComponent } from '../../button-spinner/button-spinner.component';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-cliente-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonSpinnerComponent],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-[9999] flex items-start justify-center p-4 sm:pt-24 overflow-y-auto">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" (click)="close()"></div>
        
        <div class="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <!-- Header -->
          <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <h2 class="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {{ initialData ? 'Editar Cliente' : 'Nuevo Cliente' }}
            </h2>
            <button type="button" class="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors" (click)="close()">
              <lucide-angular [img]="icons.X" class="h-5 w-5 text-zinc-500"></lucide-angular>
            </button>
          </div>
          
          <!-- Body -->
          <div class="p-8 space-y-6">
            <div class="space-y-5">
              
              <!-- Input: Nombre -->
              <div class="group/input space-y-1.5">
                <label class="text-[11px] font-black uppercase tracking-widest text-zinc-400 group-focus-within/input:text-primary transition-colors ml-1">
                  Nombre / Razón Social <span class="text-rose-500">*</span>
                </label>
                <div class="relative flex items-center">
                  <div class="absolute left-4 flex items-center justify-center">
                    <lucide-angular [img]="icons.User" class="h-4 w-4 text-zinc-400 group-focus-within/input:text-primary transition-all"></lucide-angular>
                  </div>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.name" 
                    class="h-12 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
                    placeholder="Ej: Juan Pérez"
                  >
                </div>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Input: Email -->
                <div class="group/input space-y-1.5">
                  <label class="text-[11px] font-black uppercase tracking-widest text-zinc-400 group-focus-within/input:text-primary transition-colors ml-1">
                    Email
                  </label>
                  <div class="relative flex items-center">
                    <div class="absolute left-4 flex items-center justify-center">
                      <lucide-angular [img]="icons.Mail" class="h-4 w-4 text-zinc-400 group-focus-within/input:text-primary transition-all"></lucide-angular>
                    </div>
                    <input 
                      type="email" 
                      [(ngModel)]="formData.email" 
                      class="h-12 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
                      placeholder="ejemplo@correo.com"
                    >
                  </div>
                </div>

                <!-- Input: Teléfono -->
                <div class="group/input space-y-1.5">
                  <label class="text-[11px] font-black uppercase tracking-widest text-zinc-400 group-focus-within/input:text-primary transition-colors ml-1">
                    Teléfono
                  </label>
                  <div class="relative flex items-center">
                    <div class="absolute left-4 flex items-center justify-center">
                      <lucide-angular [img]="icons.Phone" class="h-4 w-4 text-zinc-400 group-focus-within/input:text-primary transition-all"></lucide-angular>
                    </div>
                    <input 
                      type="tel" 
                      [(ngModel)]="formData.phone" 
                      class="h-12 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
                      placeholder="+54 9 11..."
                    >
                  </div>
                </div>
              </div>
              
              <!-- Input: Notas -->
              <div class="group/input space-y-1.5">
                <label class="text-[11px] font-black uppercase tracking-widest text-zinc-400 group-focus-within/input:text-primary transition-colors ml-1">
                  Notas Opcionales
                </label>
                <div class="relative">
                  <div class="absolute left-4 top-4 flex items-center justify-center">
                    <lucide-angular [img]="icons.StickyNote" class="h-4 w-4 text-zinc-400 group-focus-within/input:text-primary transition-all"></lucide-angular>
                  </div>
                  <textarea 
                    [(ngModel)]="formData.notes" 
                    class="min-h-[100px] w-full rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 pl-11 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none" 
                    placeholder="Notas adicionales sobre este cliente..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-8 py-6 bg-zinc-50/50 dark:bg-zinc-900/20 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-3">
            <button type="button" class="px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors" (click)="close()" [disabled]="isSaving">
              Cancelar
            </button>
            <app-button-spinner
              [loading]="isSaving"
              [disabled]="!formData.name"
              [loadingText]="initialData ? 'Guardando...' : 'Registrando...'"
              btnClass="px-8 py-3 rounded-2xl text-[11px] uppercase tracking-widest font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 min-w-[160px]"
              (onClick)="save()"
            >
              <lucide-angular [img]="icons.Save" class="h-4 w-4"></lucide-angular>
              {{ initialData ? 'Guardar Cambios' : 'Registrar' }}
            </app-button-spinner>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    input::placeholder, textarea::placeholder {
      font-weight: 500;
      opacity: 0.5;
    }
  `]
})
export class ClienteFormDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() initialData: Cliente | null = null;
  @Input() isSaving = false;
  @Output() onOpenChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Partial<Cliente>>();

  readonly icons = { X, Save, Mail, Phone, User, StickyNote };

  formData: Partial<Cliente> = {
    name: '',
    email: '',
    phone: '',
    notes: ''
  };

  ngOnChanges() {
    if (this.open) {
      if (this.initialData) {
        this.formData = { ...this.initialData };
      } else {
        this.formData = { name: '', email: '', phone: '', notes: '' };
      }
    }
  }

  close() {
    this.open = false;
    this.onOpenChange.emit(false);
  }

  save() {
    if (!this.formData.name?.trim()) return;
    this.onSave.emit(this.formData);
  }
}
