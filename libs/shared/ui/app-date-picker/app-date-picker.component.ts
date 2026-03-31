import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calendar, X, AlertCircle } from 'lucide-angular';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div [class]="cn('flex flex-col gap-2', fullWidth ? 'w-full' : 'w-auto', className)">
      @if (label) {
        <label
          [for]="name"
          [class]="cn(
            'text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors',
            error ? 'text-red-500' : 'text-zinc-400'
          )"
        >
          {{ label }} @if (required) { <span class="text-red-500">*</span> }
        </label>
      }

      <div class="relative group">
        <div [class]="cn(
          'absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none z-10',
          error ? 'text-red-400' : 'text-zinc-400 group-focus-within:text-primary'
        )">
          <lucide-angular [img]="icons.Calendar" class="h-[18px] w-[18px]" [strokeWidth]="2.5"></lucide-angular>
        </div>

        <input
          type="date"
          [id]="name"
          [name]="name"
          [ngModel]="formattedValue()"
          (ngModelChange)="handleInput($event)"
          [min]="minAttr()"
          [max]="maxAttr()"
          [disabled]="disabled"
          [readOnly]="readOnly"
          [required]="required"
          [placeholder]="placeholder"
          [class]="cn(
            'w-full h-14 pl-12 pr-12 rounded-2xl border-2 transition-all duration-300 font-bold text-[14px] outline-none',
            'bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800',
            'focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-primary/10 focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-red-200 bg-red-50/30 text-red-600 focus:border-red-500 focus:ring-red-500/10' : 'text-zinc-700 dark:text-zinc-200',
            'appearance-none'
          )"
        />

        @if (clearable && formattedValue() && !disabled && !readOnly) {
          <button
            type="button"
            (click)="handleClear($event)"
            class="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all flex items-center justify-center group/clear"
          >
            <lucide-angular [img]="icons.X" class="h-3.5 w-3.5 group-hover/clear:scale-110 transition-transform"></lucide-angular>
          </button>
        }

        @if (!formattedValue()) {
          <span class="absolute left-12 top-1/2 -translate-y-1/2 text-zinc-400 text-[13px] font-medium pointer-events-none opacity-50">
            {{ placeholder }}
          </span>
        }
      </div>

      @if (error || helperText) {
        <div [class]="cn(
          'flex items-center gap-1.5 px-2 animate-in fade-in slide-in-from-top-1 duration-300',
          error ? 'text-red-500' : 'text-zinc-400'
        )">
          @if (error) { <lucide-angular [img]="icons.AlertCircle" class="h-3 w-3"></lucide-angular> }
          <span class="text-[10px] font-bold tracking-tight">
            {{ error || helperText }}
          </span>
        </div>
      }
    </div>
  `,
  styles: [`
    input[type="date"]::-webkit-calendar-picker-indicator {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      cursor: pointer;
      opacity: 0;
    }
  `]
})
export class AppDatePickerComponent {
  readonly icons = { Calendar, X, AlertCircle };

  // Internal signals to ensure reactivity in computed
  private _value = signal<string | Date>('');
  private _minDate = signal<string | Date | undefined>(undefined);
  private _maxDate = signal<string | Date | undefined>(undefined);
  private _allowPastDates = signal<boolean>(false);
  private _allowToday = signal<boolean>(true);

  @Input() set value(v: string | Date) { this._value.set(v); }
  get value(): string | Date { return this._value(); }

  @Output() valueChange = new EventEmitter<string>();

  @Input() label?: string;
  @Input() name: string = '';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() readOnly: boolean = false;
  @Input() required: boolean = false;
  @Input() error?: string;
  @Input() helperText?: string;

  @Input() set minDate(v: string | Date | undefined) { this._minDate.set(v); }
  @Input() set maxDate(v: string | Date | undefined) { this._maxDate.set(v); }

  @Input() set allowPastDates(v: boolean) { this._allowPastDates.set(v); }
  @Input() set allowToday(v: boolean) { this._allowToday.set(v); }

  @Input() clearable: boolean = true;
  @Input() fullWidth: boolean = true;
  @Input() className: string = '';

  formattedValue = computed(() => {
    const val = this._value();
    if (!val) return '';
    try {
      const date = typeof val === 'string' ? (val.includes('T') ? new Date(val) : new Date(val + 'T00:00:00')) : val;
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.error('Error parsing date in AppDatePicker', e);
    }
    return '';
  });

  minAttr = computed(() => {
    const min = this._minDate();
    if (min) {
      const d = typeof min === 'string' ? (min.includes('T') ? new Date(min) : new Date(min + 'T00:00:00')) : min;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${da}`;
    }

    if (!this._allowPastDates()) {
      const today = new Date();
      if (!this._allowToday()) {
        today.setDate(today.getDate() + 1);
      }
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const da = String(today.getDate()).padStart(2, '0');
      return `${y}-${m}-${da}`;
    }

    return undefined;
  });

  maxAttr = computed(() => {
    const max = this._maxDate();
    if (max) {
      const d = typeof max === 'string' ? (max.includes('T') ? new Date(max) : new Date(max + 'T00:00:00')) : max;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${da}`;
    }
    return undefined;
  });

  handleInput(val: string) {
    this.valueChange.emit(val);
  }

  handleClear(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.valueChange.emit('');
  }

  cn = cn;
}
