import { Component, ChangeDetectionStrategy, signal, computed, OnInit, OnDestroy, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calculator, X, Delete } from 'lucide-angular';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-floating-calculator',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- MAIN CALCULATOR OVERLAY -->
    @if (isOpen()) {
      <div 
        class="fixed bottom-36 right-8 w-72 rounded-[2rem] bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-primary/20 p-2 z-[99] flex flex-col gap-1 animate-in slide-in-from-bottom-5 zoom-in-95 duration-200"
      >
        <!-- Calculator Header & Display -->
        <div class="px-5 pt-5 pb-3">
          <div class="flex items-center justify-between mb-4">
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Calculadora PDM</span>
            <button (click)="isOpen.set(false)" class="h-6 w-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors">
              <lucide-angular [img]="icons.X" class="h-3 w-3"></lucide-angular>
            </button>
          </div>
          
          <div class="flex flex-col items-end">
            <span class="text-xs font-bold font-mono text-zinc-400 min-h-[16px] truncate max-w-full tracking-wider">{{ prevOperation() || '' }}</span>
            <span class="text-4xl font-black font-mono text-zinc-900 dark:text-zinc-50 tracking-tighter truncate max-w-full leading-none mt-1">
              {{ currentInput() || '0' }}
            </span>
          </div>
        </div>

        <!-- Calculator Grid -->
        <div class="p-2 grid grid-cols-4 gap-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-[1.5rem] border border-zinc-100/50 dark:border-zinc-800/50">
          <button (click)="clear()" class="col-span-2 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black text-sm uppercase tracking-widest hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-all shadow-sm active:scale-95">AC</button>
          <button (click)="delete()" class="h-12 rounded-xl bg-zinc-200/50 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-all shadow-sm active:scale-95">
             <lucide-angular [img]="icons.Delete" class="h-4 w-4"></lucide-angular>
          </button>
          <button (click)="op('/')" class="h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-lg transition-all shadow-sm active:scale-95">÷</button>

          <button (click)="num('7')" [class]="btnClass">7</button>
          <button (click)="num('8')" [class]="btnClass">8</button>
          <button (click)="num('9')" [class]="btnClass">9</button>
          <button (click)="op('*')" class="h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-lg transition-all shadow-sm active:scale-95">×</button>

          <button (click)="num('4')" [class]="btnClass">4</button>
          <button (click)="num('5')" [class]="btnClass">5</button>
          <button (click)="num('6')" [class]="btnClass">6</button>
          <button (click)="op('-')" class="h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-lg transition-all shadow-sm active:scale-95">−</button>

          <button (click)="num('1')" [class]="btnClass">1</button>
          <button (click)="num('2')" [class]="btnClass">2</button>
          <button (click)="num('3')" [class]="btnClass">3</button>
          <button (click)="op('+')" class="h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-lg transition-all shadow-sm active:scale-95">+</button>

          <button (click)="num('0')" [class]="cn(btnClass, 'col-span-2')">0</button>
          <button (click)="dot()" [class]="btnClass">.</button>
          <button (click)="calc()" class="h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xl transition-all shadow-md shadow-primary/20 active:scale-95">=</button>
        </div>
      </div>
    }

    <button 
      (click)="isOpen.set(!isOpen())"
      [class]="cn(
        'fixed bottom-16 right-8 h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all z-[100] active:scale-90',
        isOpen() ? 'bg-zinc-900 border border-zinc-700 text-white rotate-12 scale-90 opacity-0 pointer-events-none' : 'bg-primary border border-primary-50 text-white hover:scale-110 shadow-primary/30'
      )"
    >
      <lucide-angular [img]="icons.Calculator" class="h-6 w-6"></lucide-angular>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingCalculatorComponent implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  
  ngOnInit() {
    // Teleport to body to escape any CSS view-transition/transform layout traps
    // This ensures position:fixed is truly relative to the browser viewport
    document.body.appendChild(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.el.nativeElement.parentNode === document.body) {
      document.body.removeChild(this.el.nativeElement);
    }
  }

  isOpen = signal(false);
  readonly icons = { Calculator, X, Delete };
  
  btnClass = 'h-12 rounded-xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-black text-lg border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-90';

  currentInput = signal('0');
  prevOperation = signal('');
  operator = signal('');
  previousValue = signal<number | null>(null);

  num(val: string) {
    if (this.currentInput() === '0') {
      this.currentInput.set(val);
    } else {
      this.currentInput.update(v => v + val);
    }
  }

  dot() {
    if (!this.currentInput().includes('.')) {
      this.currentInput.update(v => v + '.');
    }
  }

  op(o: string) {
    if (this.currentInput() === '') return;
    
    if (this.previousValue() !== null) {
      this.calc();
    }
    
    const curr = parseFloat(this.currentInput());
    this.previousValue.set(curr);
    this.operator.set(o);
    
    const oStr = o === '*' ? '×' : o === '/' ? '÷' : o === '-' ? '−' : '+';
    this.prevOperation.set(`${curr} ${oStr}`);
    this.currentInput.set('');
  }

  calc() {
    if (this.operator() === '' || Array.from(this.currentInput()).length === 0) return;
    
    const prev = this.previousValue();
    let currentStr = this.currentInput();
    // if ending with dot, pad with 0
    if (currentStr.endsWith('.')) currentStr += '0';
    const curr = parseFloat(currentStr);

    let res = 0;
    if (this.operator() === '+') res = prev! + curr;
    if (this.operator() === '-') res = prev! - curr;
    if (this.operator() === '*') res = prev! * curr;
    if (this.operator() === '/') res = prev! / curr;

    // precision formatting
    res = parseFloat(res.toFixed(6));

    const oStr = this.operator() === '*' ? '×' : this.operator() === '/' ? '÷' : this.operator() === '-' ? '−' : '+';
    this.prevOperation.set(`${prev} ${oStr} ${curr} =`);
    this.currentInput.set(res.toString());
    this.operator.set('');
    this.previousValue.set(null);
  }

  delete() {
    if (this.currentInput().length > 1) {
      this.currentInput.update(v => v.slice(0, -1));
    } else {
      this.currentInput.set('0');
    }
  }

  clear() {
    this.currentInput.set('0');
    this.operator.set('');
    this.previousValue.set(null);
    this.prevOperation.set('');
  }

  cn = cn;
}
