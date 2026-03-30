import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div [class]="containerClasses">
      <div class="relative flex flex-col items-center justify-center gap-4">
        <!-- Main Spinner -->
        <div class="relative h-12 w-12 flex items-center justify-center">
          <!-- Pulse rings -->
          <div class="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
          <div class="absolute inset-2 rounded-full border-2 border-primary/40 border-t-transparent animate-spin-slow"></div>
          
          <lucide-angular [img]="Loader2" 
            class="h-6 w-6 text-primary animate-spin"
            [style.animationDuration]="'1.5s'"></lucide-angular>
        </div>

        @if (message) {
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
            {{ message }}
          </p>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
      animation: spin-slow 3s linear infinite;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message: string = 'Cargando';
  @Input() fullScreen: boolean = false;
  @Input() overlay: boolean = false;
  @Input() className: string = '';

  get containerClasses(): string {
    let classes = 'flex flex-col items-center justify-center p-8 transition-all duration-500 ' + this.className;
    
    if (this.fullScreen) {
      classes = 'fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 flex flex-col items-center justify-center';
    } else if (this.overlay) {
      classes = 'absolute inset-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-[2rem]';
    }

    return classes;
  }

  public Loader2 = Loader2;
}
