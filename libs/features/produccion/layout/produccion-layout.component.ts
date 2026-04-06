import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, LayoutGrid, BarChart3, Clock, MoreHorizontal } from 'lucide-angular';
import { SessionService } from '../../../core/session/session.service';

@Component({
  selector: 'app-produccion-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-[#fafbfc] dark:bg-zinc-950 flex flex-col">
      <!-- TACTICAL TAB NAVIGATION -->
      <div class="sticky top-0 z-30 p-2 sm:p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-1.5 p-1 bg-zinc-100/50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-50 dark:border-zinc-800">
           <a routerLink="./monitor" routerLinkActive="bg-white dark:bg-zinc-800 text-primary shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-700" 
             class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all no-underline">
              <lucide-angular [img]="icons.LayoutGrid" class="h-4 w-4"></lucide-angular>
              <span class="hidden sm:inline">Monitor de Planta</span>
              <span class="sm:hidden">Monitor</span>
           </a>
           <a routerLink="./dashboard" routerLinkActive="bg-white dark:bg-zinc-800 text-primary shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-700" 
             class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all no-underline">
              <lucide-angular [img]="icons.BarChart3" class="h-4 w-4"></lucide-angular>
              <span class="hidden sm:inline">Supervisión / Dashboard</span>
              <span class="sm:hidden">KPIs</span>
           </a>
        </div>

        <div class="flex items-center gap-3">
           <div class="hidden md:flex items-center gap-2 px-4 py-2 current-time bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl">
              <lucide-angular [img]="icons.Clock" class="h-3.5 w-3.5 text-zinc-300"></lucide-angular>
              <span class="text-[9px] font-bold text-zinc-500 tabular-nums">{{ currentTime() }}</span>
           </div>
           <button class="h-10 w-10 flex items-center justify-center text-zinc-300 hover:text-zinc-500 border border-transparent hover:border-zinc-100 rounded-xl transition-all">
              <lucide-angular [img]="icons.MoreHorizontal" class="h-5 w-5"></lucide-angular>
           </button>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div class="flex-1 overflow-auto animate-in fade-in duration-700">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .current-time { font-family: 'Inter', sans-serif; }
  `]
})
export class ProduccionLayoutComponent {
  private router = inject(Router);
  currentTime = signal(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));

  icons = {
    LayoutGrid, BarChart3, Clock, MoreHorizontal
  };

  constructor() {
    // Clock update
    setInterval(() => {
      this.currentTime.set(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
  }
}
