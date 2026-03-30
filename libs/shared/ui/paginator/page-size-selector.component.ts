import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

@Component({
  selector: 'app-page-size-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-all hover:border-zinc-200 dark:hover:border-zinc-700 shadow-sm relative group">
      <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Mostrar</span>
      
      <div class="relative flex items-center">
        <select 
          [ngModel]="pageSize" 
          (ngModelChange)="pageSizeChange.emit($event)"
          class="appearance-none bg-transparent border-none text-xs font-black text-primary pr-6 py-0 focus:ring-0 cursor-pointer z-10"
        >
          @for (option of options; track option) {
            <option [ngValue]="option">{{ option }} filas</option>
          }
        </select>
        <lucide-angular [img]="ChevronDown" 
          class="h-3 w-3 text-zinc-400 absolute right-0 pointer-events-none group-hover:text-primary transition-colors"></lucide-angular>
      </div>
    </div>
  `,
  styles: [`
    select {
      outline: none;
    }
  `]
})
export class PageSizeSelectorComponent {
  @Input() pageSize: number = 5;
  @Input() options: number[] = [5, 10, 25, 50];
  @Output() pageSizeChange = new EventEmitter<number>();

  protected readonly ChevronDown = ChevronDown;
}
