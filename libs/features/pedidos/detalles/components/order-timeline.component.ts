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
    <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 shadow-sm h-full">
      <div class="flex items-center gap-3 mb-10 px-2">
        <lucide-angular [img]="icons.History" class="h-4 w-4 text-zinc-300"></lucide-angular>
        <h3 class="text-xs font-black uppercase tracking-widest text-zinc-400">Historial de Operatividad</h3>
        <div class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
      </div>

      <div class="relative space-y-0 pb-4 overflow-y-auto max-h-[500px] custom-scrollbar">
        <div class="absolute left-[23px] top-2 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-zinc-100 to-transparent dark:via-zinc-800"></div>
        
        @for (entry of history(); track entry.id; let first = $first) {
          <div class="relative flex gap-6 pb-12 last:pb-0 group">
            <div class="relative z-10 h-12 w-12 rounded-2xl flex items-center justify-center border-4 border-white dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-800 text-zinc-300 shadow-sm transition-all group-hover:scale-110 group-hover:text-primary">
              <lucide-angular [img]="first ? icons.CheckCircle : icons.Clock" class="h-5 w-5"></lucide-angular>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span [class]="cn('px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border', getStatusStyles(entry.toStatus))">
                  {{ getStatusLabel(entry.toStatus) }}
                </span>
                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {{ (entry.changedAt || entry.createdAt) | date:'dd MMM, HH:mm' }}
                </span>
              </div>
              
              <div class="mt-4 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="h-8 w-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                    <lucide-angular [img]="icons.User" class="h-4 w-4"></lucide-angular>
                  </div>
                  <div>
                    <p class="text-[8px] font-black uppercase text-zinc-400 tracking-widest leading-none">Operador</p>
                    <p class="text-xs font-black text-zinc-700 dark:text-white">{{ entry.performedBy?.fullName || entry.employee?.firstName || 'Sistema' }}</p>
                  </div>
                </div>
                
                @if (entry.note || entry.notes) {
                  <div class="relative group/note">
                    <lucide-angular [img]="icons.MessageSquare" class="h-4 w-4 text-zinc-300 hover:text-primary cursor-help"></lucide-angular>
                    <div class="absolute bottom-full right-0 mb-2 w-48 p-3 bg-zinc-900 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover/note:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50">
                       {{ entry.note || entry.notes }}
                    </div>
                  </div>
                }
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
