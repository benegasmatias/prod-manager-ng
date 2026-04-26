import { Component, Input, Output, EventEmitter, signal, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { cn } from '@shared/utils/cn';
import { parseMoney, sanitizeMoneyInput } from '@shared/utils/money';

@Component({
  selector: 'app-money-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="cn('space-y-2', className)">
      @if (label) {
        <label [class]="cn(
          'text-[10px] font-black uppercase tracking-[0.2em] ml-1',
          error ? 'text-rose-500' : 'text-zinc-400',
          labelClassName
        )">
          {{ label }} @if (required) { <span class="text-rose-500">*</span> }
        </label>
      }

      <div class="relative group">
        <span [class]="cn(
          'absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black transition-colors pointer-events-none z-10',
          disabled ? 'text-zinc-200 dark:text-zinc-800' : (error ? 'text-rose-300' : 'text-zinc-300 dark:text-zinc-700 group-focus-within:text-primary transition-all duration-300')
        )">
          {{ currencySymbol }}
        </span>

        <input
          type="text"
          inputMode="decimal"
          [disabled]="disabled"
          [readOnly]="readOnly"
          [ngModel]="displayValue()"
          (ngModelChange)="handleInput($event)"
          (focus)="handleFocus()"
          (blur)="handleBlur()"
          [placeholder]="placeholder"
          [class]="cn(
            'w-full h-14 rounded-2xl border-2 pl-12 pr-6 text-xl font-black outline-none transition-all duration-300',
            colorStyles[color],
            error && 'border-rose-200 bg-rose-50/10 ring-4 ring-rose-500/5',
            disabled && 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 cursor-not-allowed',
            inputClassName
          )"
          autoComplete="off"
        />
      </div>

      @if (error || helperText) {
        <p [class]="cn(
          'text-[10px] font-bold uppercase tracking-wider ml-1 animate-in fade-in slide-in-from-top-1',
          error ? 'text-rose-500' : 'text-zinc-400'
        )">
          {{ error || helperText }}
        </p>
      }
    </div>
  `
})
export class MoneyInputComponent implements OnChanges {
  @Input() value: number = 0;
  @Output() valueChange = new EventEmitter<number>();

  @Input() currencySymbol: string = '$';
  @Input() decimals: number = 2;
  @Input() color: 'primary' | 'emerald' | 'indigo' | 'amber' | 'rose' = 'primary';
  @Input() disabled: boolean = false;
  @Input() readOnly: boolean = false;
  @Input() required: boolean = false;
  @Input() min?: number;
  @Input() max?: number;
  @Input() allowNegative: boolean = false;
  @Input() label?: string;
  @Input() error?: string;
  @Input() helperText?: string;
  @Input() placeholder: string = '0,00';
  @Input() className: string = '';
  @Input() inputClassName: string = '';
  @Input() labelClassName: string = '';

  displayValue = signal('');
  private isFocused = false;

  colorStyles = {
    primary: "bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-primary/10 focus:border-primary text-zinc-900 dark:text-zinc-100",
    emerald: "bg-emerald-50/10 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-emerald-700 dark:text-emerald-400",
    indigo: "bg-indigo-50/10 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-indigo-700 dark:text-indigo-400",
    amber: "bg-amber-50/10 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 text-amber-700 dark:text-amber-400",
    rose: "bg-rose-50/10 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-rose-700 dark:text-rose-400",
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && !this.isFocused) {
      const val = changes['value'].currentValue;
      this.displayValue.set(this.formatForDisplay(val));
    }
  }

  private formatForDisplay(num: number): string {
    if ((num === 0 || isNaN(num)) && !this.isFocused && !this.required) return '';
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: this.decimals,
      useGrouping: true
    }).format(num || 0);
  }

  handleFocus() {
    this.isFocused = true;
  }

  handleBlur() {
    this.isFocused = false;
    let finalValue = parseMoney(this.displayValue());
    
    // Validations
    if (this.min !== undefined && finalValue < this.min) finalValue = this.min;
    if (this.max !== undefined && finalValue > this.max) finalValue = this.max;
    if (!this.allowNegative && finalValue < 0) finalValue = 0;

    this.displayValue.set(this.formatForDisplay(finalValue));
    this.valueChange.emit(finalValue);
  }

  handleInput(raw: string) {
    if (raw === '') {
      this.displayValue.set('');
      this.valueChange.emit(0);
      return;
    }

    // Sanitize string (digits and one comma)
    let sanitized = sanitizeMoneyInput(raw);
    
    if (!this.allowNegative) {
      sanitized = sanitized.replace(/-/g, '');
    }

    const parts = sanitized.split(',');
    const whole = parts[0];
    const decimal = parts[1];
    
    // Format thousands while typing
    let formattedWhole = '';
    if (whole === '-' && this.allowNegative) {
      formattedWhole = '-';
    } else if (whole) {
      const num = parseInt(whole.replace(/\./g, ''));
      if (!isNaN(num)) {
        formattedWhole = new Intl.NumberFormat('es-AR').format(num);
        // Preserve negative sign if it was there but num is 0
        if (whole.startsWith('-') && num === 0) formattedWhole = `-${formattedWhole}`;
      }
    }

    let newDisplay = formattedWhole;
    if (decimal !== undefined) {
      newDisplay += `,${decimal.slice(0, this.decimals)}`;
    }

    this.displayValue.set(newDisplay);
    this.valueChange.emit(parseMoney(newDisplay));
  }

  cn = cn;
}
