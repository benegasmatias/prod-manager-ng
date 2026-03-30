import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-angular';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex items-center justify-between px-4 py-3 sm:px-6">
      <div class="flex flex-1 justify-between sm:hidden">
        <button
          (click)="onPageChange(currentPage - 1)"
          [disabled]="currentPage === 1"
          class="relative inline-flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 transition-all active:scale-95 shadow-sm"
        >
          Anterior
        </button>
        <button
          (click)="onPageChange(currentPage + 1)"
          [disabled]="currentPage === totalPages"
          class="relative ml-3 inline-flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 transition-all active:scale-95 shadow-sm"
        >
          Siguiente
        </button>
      </div>

      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Mostrando 
            <span class="text-zinc-900 dark:text-zinc-100">{{ (currentPage - 1) * pageSize + 1 }}</span>
            a 
            <span class="text-zinc-900 dark:text-zinc-100">{{ Math.min(currentPage * pageSize, totalItems) }}</span>
            de 
            <span class="text-zinc-900 dark:text-zinc-100">{{ totalItems }}</span>
            resultados
          </p>
        </div>

        <div>
          <nav class="isolate inline-flex -space-x-px rounded-2xl shadow-sm gap-1" aria-label="Pagination">
            <!-- First Page -->
            <button
              (click)="onPageChange(1)"
              [disabled]="currentPage === 1"
              class="relative inline-flex items-center rounded-xl px-3 py-2 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 disabled:opacity-20 transition-all"
            >
              <lucide-angular [img]="icons.ChevronsLeft" class="h-4 w-4"></lucide-angular>
            </button>

            <!-- Previous -->
            <button
              (click)="onPageChange(currentPage - 1)"
              [disabled]="currentPage === 1"
              class="relative inline-flex items-center rounded-xl px-3 py-2 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 disabled:opacity-20 transition-all"
            >
              <lucide-angular [img]="icons.ChevronLeft" class="h-4 w-4"></lucide-angular>
            </button>

            <!-- Page Numbers -->
            <div class="flex items-center gap-1 px-2">
              @for (page of visiblePages(); track page) {
                <button
                  (click)="onPageChange(page)"
                  [class]="'min-w-[40px] h-10 flex items-center justify-center rounded-xl text-[11px] font-black transition-all ' + 
                    (currentPage === page 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40')"
                >
                  {{ page }}
                </button>
              }
            </div>

            <!-- Next -->
            <button
              (click)="onPageChange(currentPage + 1)"
              [disabled]="currentPage === totalPages"
              class="relative inline-flex items-center rounded-xl px-3 py-2 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 disabled:opacity-20 transition-all"
            >
              <lucide-angular [img]="icons.ChevronRight" class="h-4 w-4"></lucide-angular>
            </button>

            <!-- Last Page -->
            <button
              (click)="onPageChange(totalPages)"
              [disabled]="currentPage === totalPages"
              class="relative inline-flex items-center rounded-xl px-3 py-2 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 disabled:opacity-20 transition-all"
            >
              <lucide-angular [img]="icons.ChevronsRight" class="h-4 w-4"></lucide-angular>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `
})
export class PaginatorComponent {
  @Input() totalItems = 0;
  @Input() pageSize = 20;
  @Input() currentPage = 1;
  @Output() pageChange = new EventEmitter<number>();

  icons = { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight };
  Math = Math;

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  visiblePages = computed(() => {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];
    
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
  });

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.pageChange.emit(page);
    }
  }
}
