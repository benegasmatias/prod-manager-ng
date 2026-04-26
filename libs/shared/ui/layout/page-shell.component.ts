import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-shell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-12 animate-in fade-in duration-1000">
      <!-- HEADER LAYER -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 px-0">
        <div class="hidden md:block space-y-2">
          <div class="flex items-center gap-4 mb-2">
            <div class="h-1.5 w-10 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"></div>
            <span class="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">
              {{ category() }}
            </span>
          </div>
          <h1 class="text-4xl md:text-5xl font-black tracking-tighter text-text uppercase italic font-display leading-none">
            {{ title() }} <span class="text-primary">{{ titleAccent() }}</span>
          </h1>
          <p class="text-[10px] font-black text-text-muted/40 uppercase tracking-[0.4em] leading-relaxed max-w-2xl italic">
            {{ description() }}
          </p>
        </div>

        <!-- ACTIONS SLOT -->
        <div class="flex items-center gap-4 w-full md:w-auto">
          <ng-content select="[actions]"></ng-content>
        </div>
      </header>

      <!-- MAIN CONTENT LAYER -->
      <main class="relative transition-all">
        @if (loading()) {
          <div class="flex items-center justify-center min-h-[40vh] animate-in fade-in zoom-in-95 duration-700">
            <div class="animate-spin h-12 w-12 border-[3px] border-primary border-t-transparent rounded-full shadow-2xl shadow-primary/20"></div>
          </div>
        } @else {
          <ng-content></ng-content>
        }
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageShellComponent {
  title = input.required<string>();
  titleAccent = input<string>('');
  category = input<string>('Operaciones');
  description = input<string>('');
  loading = input<boolean>(false);
}
