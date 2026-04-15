import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private nextId = 0;
  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'success', duration = 3000) {
    const id = this.nextId++;
    const toast: Toast = { id, message, type };
    
    this.toasts.update(t => [...t, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error', 5000); }
  warning(message: string) { this.show(message, 'warning'); }

  remove(id: number) {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
