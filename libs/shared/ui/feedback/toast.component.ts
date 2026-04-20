import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastType } from '../../services/toast.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed bottom-10 right-10 z-[1000] flex flex-col gap-4 pointer-events-none w-full max-w-sm">
      <div 
        *ngFor="let toast of toastService.toasts()"
        class="toast-item pointer-events-auto p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center justify-between gap-4 animate-in slide-in-from-right-10 fade-in duration-300 transform"
        [ngClass]="getStyles(toast.type)"
      >
        <div class="flex items-center gap-3">
          <div [ngClass]="getIconBg(toast.type)" class="h-8 w-8 rounded-xl flex items-center justify-center">
            <i-lucide [name]="getIconName(toast.type)" class="h-4 w-4"></i-lucide>
          </div>
          <div>
            <p class="text-[11px] font-black uppercase tracking-widest opacity-60">{{ toast.type }}</p>
            <p class="text-[13px] font-bold">{{ toast.message }}</p>
          </div>
        </div>
        
        <button (click)="toastService.remove(toast.id)" class="p-1 hover:bg-black/5 rounded-lg transition-all opacity-40 hover:opacity-100">
           <i-lucide name="x" class="h-4 w-4"></i-lucide>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-item {
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  getStyles(type: ToastType): string {
    switch (type) {
      case 'success': return 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20';
      case 'error': return 'bg-rose-950/20 text-rose-400 border-rose-500/20';
      case 'warning': return 'bg-amber-950/20 text-amber-400 border-amber-500/20';
      default: return 'bg-zinc-900/20 text-zinc-100 border-zinc-800/50';
    }
  }

  getIconBg(type: ToastType): string {
    switch (type) {
      case 'success': return 'bg-emerald-500/10';
      case 'error': return 'bg-rose-500/10';
      case 'warning': return 'bg-amber-500/10';
      default: return 'bg-zinc-800';
    }
  }

  getIconName(type: ToastType): string {
    switch (type) {
        case 'success': return 'check-circle-2';
        case 'error': return 'alert-circle';
        case 'warning': return 'alert-circle';
        case 'info': return 'info';
        default: return 'info';
    }
  }
}
