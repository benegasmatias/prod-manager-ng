import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-button-spinner',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="btnClass"
      (click)="onClick.emit($event)"
      class="relative flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
    >
      @if (loading) {
        <div class="flex items-center justify-center gap-2 animate-in fade-in zoom-in-90 duration-300">
          <lucide-angular [img]="Loader2" class="h-4 w-4 animate-spin"></lucide-angular>
          @if (loadingText) {
            <span class="text-[10px] font-black uppercase tracking-widest">{{ loadingText }}</span>
          }
        </div>
      } @else {
        <div class="flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-500">
            @if (text) {
               <span>{{ text }}</span>
            } @else {
               <ng-content></ng-content>
            }
        </div>
      }
    </button>
  `
})
export class ButtonSpinnerComponent {
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() btnClass: string = '';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() loadingText: string = '';
  @Input() text: string = ''; // Forward compatibility
  
  @Output() onClick = new EventEmitter<MouseEvent>();
  
  Loader2 = Loader2;
}
