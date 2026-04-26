import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, History, CheckCircle, Clock, User, MessageSquare } from 'lucide-angular';
import { StatusHistoryEntry } from '@shared/models';
import { getStatusLabel, getStatusStyles } from '@shared/utils';

@Component({
  selector: 'app-order-timeline',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-8 animate-in fade-in duration-700">
      <div class="flex items-center justify-between px-2">
        <h3 class="text-xl font-black text-text tracking-tighter uppercase italic">Historial de Operatividad</h3>
        <button class="text-[9px] font-black text-primary uppercase tracking-[0.2em] italic border-b border-primary/20 hover:border-primary transition-all">Ver Todos</button>
      </div>

      <div class="relative space-y-10 pl-6">
        <!-- Connecting Line -->
        <div class="absolute left-[7px] top-2 bottom-2 w-0.5 bg-zinc-100 dark:bg-zinc-800"></div>
        
        @for (entry of history(); track entry.id) {
          <div class="relative flex items-start gap-6 group">
            <!-- Node Dot -->
            <div [class]="cn(
              'absolute left-[-23px] h-4 w-4 rounded-full border-4 border-white dark:border-zinc-950 transition-all duration-500',
              $first ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-700'
            )"></div>
            
            <div class="flex-1 space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-sm font-black text-text uppercase tracking-tight">{{ getStatusLabel(entry.toStatus) }}</p>
                <p class="text-[9px] font-bold text-text-muted/40 uppercase tracking-widest">{{ (entry.changedAt || entry.createdAt) | date:'EEEE, HH:mm' }}</p>
              </div>
              
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 overflow-hidden border border-border/5">
                  <lucide-angular [img]="icons.User" class="h-4 w-4"></lucide-angular>
                </div>
                <div class="flex items-center gap-2">
                   <span class="text-[9px] font-bold text-text-muted/40 uppercase tracking-widest italic">Responsable:</span>
                   <span class="text-[10px] font-black text-text uppercase tracking-widest">{{ entry.performedBy?.fullName || entry.employee?.firstName || 'Sistema' }}</span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>

  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
  `]
})
export class OrderTimelineComponent {
  history = input.required<StatusHistoryEntry[]>();

  icons = {
    History, CheckCircle, Clock, User, MessageSquare
  };

  getStatusLabel = getStatusLabel;
  getStatusStyles = getStatusStyles;

  cn(...args: any[]) {
    return args.filter(Boolean).join(' ');
  }
}
