import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-shell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-[var(--section-gap)] animate-in fade-in duration-700">
      <!-- HEADER LAYER -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 px-0">
        <div class="space-y-0.5 md:space-y-1">
          <div class="flex items-center gap-2 mb-0.5 md:mb-1">
            <div class="h-1.2 w-1.2 md:h-1.5 md:w-1.5 rounded-full bg-primary animate-pulse"></div>
            <span class="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              {{ category() }}
            </span>
          </div>
          <h1 class="text-lg md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase leading-tight">
            {{ title() }} <span class="italic text-primary">{{ titleAccent() }}</span>
          </h1>
          <p class="hidden md:block text-[11px] font-bold text-zinc-400 leading-relaxed uppercase tracking-widest max-w-2xl">
            {{ description() }}
          </p>
        </div>

        <!-- ACTIONS SLOT -->
        <div class="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <ng-content select="[actions]"></ng-content>
        </div>
      </header>

      <!-- MAIN CONTENT LAYER -->
      <main class="relative bg-zinc-50/10 dark:bg-zinc-900/5 transition-all p-1">
        @if (loading()) {
          <div class="flex items-center justify-center min-h-[40vh] animate-in fade-in zoom-in-95 duration-500">
            <div class="animate-spin h-10 w-10 border-[3px] border-primary border-t-transparent rounded-full shadow-lg shadow-primary/20"></div>
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
