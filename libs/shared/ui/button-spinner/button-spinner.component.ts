import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, RefreshCw, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-button-spinner',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex items-center justify-center gap-2">
      <lucide-angular [img]="icon === 'loader2' ? Loader2 : RefreshCw" class="h-4 w-4 animate-spin"></lucide-angular>
      @if (text) {
        <span class="text-[10px] font-black uppercase tracking-widest">{{ text }}</span>
      }
    </div>
  `
})
export class ButtonSpinnerComponent {
  @Input() text: string = '';
  @Input() icon: 'loader2' | 'refreshCw' = 'refreshCw';
  
  Loader2 = Loader2;
  RefreshCw = RefreshCw;
}
