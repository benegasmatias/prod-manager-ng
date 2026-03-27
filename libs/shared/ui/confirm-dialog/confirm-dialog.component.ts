import { Component, ElementRef, ViewChild, signal, computed, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, X } from 'lucide-angular';

export interface ConfirmData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private _data = signal<ConfirmData | null>(null);
  data = computed(() => this._data());

  confirm(data: Omit<ConfirmData, 'resolve'>): Promise<boolean> {
    return new Promise((resolve) => {
      this._data.set({ ...data, resolve });
    });
  }

  close(result: boolean) {
    const d = this._data();
    if (d) {
      d.resolve(result);
      this._data.set(null);
    }
  }
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (service.data(); as data) {
      <div 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div 
          class="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        >
          <div class="px-6 py-6 text-center">
            <div 
              class="mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-4"
              [ngClass]="{
                'bg-red-100 text-red-600 dark:bg-red-400/10 dark:text-red-400': data.type === 'danger',
                'bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400': data.type === 'warning',
                'bg-indigo-100 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400': data.type === 'info'
              }"
            >
              @if (data.type === 'danger' || data.type === 'warning') {
                <lucide-angular [img]="icons.AlertTriangle" class="h-7 w-7"></lucide-angular>
              } @else {
                <lucide-angular [img]="icons.X" class="h-7 w-7"></lucide-angular>
              }
            </div>
            
            <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{{ data.title }}</h3>
            <p class="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">
              {{ data.message }}
            </p>
          </div>

          <div class="px-6 py-4 bg-zinc-50 dark:bg-zinc-950/40 border-t border-zinc-100 dark:border-zinc-800 flex flex-col-reverse sm:flex-row gap-3">
            <button 
              (click)="service.close(false)"
              class="flex-1 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-all"
            >
              {{ data.cancelLabel || 'Cancelar' }}
            </button>
            <button 
              (click)="service.close(true)"
              class="flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95"
              [ngClass]="{
                'bg-red-600 hover:bg-red-700 shadow-red-600/20': data.type === 'danger',
                'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20': data.type === 'warning',
                'bg-primary hover:bg-primary/90 shadow-primary/20': data.type === 'info'
              }"
            >
              {{ data.confirmLabel || 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  readonly icons = { AlertTriangle, X };
  constructor(public service: ConfirmService) {}
}
