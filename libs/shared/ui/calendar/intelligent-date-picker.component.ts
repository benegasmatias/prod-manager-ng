import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar as CalendarIcon, X } from 'lucide-angular';
import { DeliveryCalendarComponent } from './delivery-calendar.component';

@Component({
  selector: 'app-intelligent-date-picker',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DeliveryCalendarComponent],
  template: `
    <div class="flex flex-col gap-2 relative">
      @if (label) {
        <label class="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-zinc-400">
          {{ label }}
        </label>
      }

      <div class="relative group">
        <div class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary z-10 pointer-events-none">
          <lucide-angular [img]="icons.CalendarIcon" class="h-[18px] w-[18px]" [strokeWidth]="2.5"></lucide-angular>
        </div>

        <div 
          (click)="toggleCalendar()"
          [class]="cn(
            'w-full h-14 pl-12 pr-12 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center cursor-pointer transition-all hover:border-primary/30',
            disabled && 'opacity-50 cursor-not-allowed grayscale pointer-events-none'
          )"
        >
          <span [class]="cn('text-[14px] font-bold', value ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-400')">
            {{ value ? (value | date:'dd / MM / yyyy') : (placeholder || 'Seleccionar fecha...') }}
          </span>
        </div>

        @if (value) {
          <button
            type="button"
            (click)="clear($event)"
            class="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-all flex items-center justify-center"
          >
            <lucide-angular [img]="icons.X" class="h-3.5 w-3.5"></lucide-angular>
          </button>
        }
      </div>

      <!-- Floating Calendar -->
      @if (showCalendar()) {
        <div class="absolute top-full left-0 mt-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          <div (click)="stop($event)">
             <app-delivery-calendar 
               [selectedDate]="value" 
               (dateChange)="onDateSelect($event)"
             ></app-delivery-calendar>
          </div>
          <!-- Backdrop to close -->
          <div (click)="toggleCalendar()" class="fixed inset-0 z-[-1]"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class IntelligentDatePickerComponent {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() value?: string | Date;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  showCalendar = signal(false);
  icons = { CalendarIcon, X };

  toggleCalendar() {
    if (this.disabled) return;
    this.showCalendar.update(v => !v);
  }

  onDateSelect(date: Date) {
    const isoDate = date.toISOString().split('T')[0];
    this.valueChange.emit(isoDate);
    this.showCalendar.set(false);
  }

  clear(e: Event) {
    e.stopPropagation();
    this.valueChange.emit('');
  }

  stop(e: Event) {
    e.stopPropagation();
  }

  cn(...args: any[]) {
    return args.filter(Boolean).join(' ');
  }
}
