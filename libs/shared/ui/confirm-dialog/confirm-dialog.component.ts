import { Component, Injectable, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, Info } from 'lucide-angular';

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
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  readonly icons = { AlertTriangle, Info };
  constructor(public service: ConfirmService) {}
}
