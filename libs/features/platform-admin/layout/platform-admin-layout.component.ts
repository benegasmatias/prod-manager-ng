import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Terminal, Users, LayoutGrid, CreditCard, ArrowLeft, LayoutDashboard } from 'lucide-angular';
import { AuthService } from '@core/auth';
import { ToastComponent } from '../../../shared/ui/feedback/toast.component';

@Component({
  selector: 'app-platform-admin-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    LucideAngularModule,
    ToastComponent
  ],
  template: `
    <div class="flex h-screen bg-zinc-950 text-white overflow-hidden font-sans">
      <!-- Sidebar -->
      <aside class="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div class="p-8">
          <div class="flex items-center gap-3 mb-10">
            <div class="h-10 w-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/20">
              <i-lucide name="terminal" class="h-6 w-6 text-white"></i-lucide>
            </div>
            <div>
              <h1 class="text-lg font-black tracking-tight text-white leading-tight uppercase">Platform</h1>
              <p class="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Superadmin Context</p>
            </div>
          </div>

          <nav class="space-y-1">
            <a routerLink="dashboard" routerLinkActive="bg-zinc-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 font-bold hover:bg-zinc-800 transition-all group">
              <i-lucide name="layout-dashboard" class="h-5 w-5"></i-lucide>
              <span>Dashboard</span>
            </a>
            <a routerLink="users" routerLinkActive="bg-zinc-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 font-bold hover:bg-zinc-800 transition-all group">
              <i-lucide name="users" class="h-5 w-5"></i-lucide>
              <span>Usuarios</span>
            </a>
            <a routerLink="businesses" routerLinkActive="bg-zinc-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 font-bold hover:bg-zinc-800 transition-all group">
              <i-lucide name="layout-grid" class="h-5 w-5"></i-lucide>
              <span>Negocios</span>
            </a>
            <a routerLink="plans" routerLinkActive="bg-zinc-800 text-white" class="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 font-bold hover:bg-zinc-800 transition-all group">
              <i-lucide name="credit-card" class="h-5 w-5"></i-lucide>
              <span>Planes</span>
            </a>
          </nav>
        </div>

        <div class="mt-auto p-6 border-t border-zinc-800">
          <a routerLink="/dashboard" class="flex items-center gap-3 px-4 py-2 rounded-xl text-zinc-500 font-bold hover:text-white transition-all">
            <i-lucide name="arrow-left" class="h-4 w-4"></i-lucide>
            Volver al App
          </a>
        </div>
      </aside>

      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto bg-zinc-950 p-12 relative">
        <router-outlet></router-outlet>
      </main>

      <!-- Global Admin Toasts -->
      <app-toast-container></app-toast-container>
    </div>
  `
})
export class PlatformAdminLayoutComponent {
  private auth = inject(AuthService);
}

// In the component logic, standard icons approach for Angular 21 (v18+)
LucideAngularModule.pick({
    Terminal, 
    Users, 
    LayoutGrid, 
    CreditCard, 
    ArrowLeft,
    LayoutDashboard
});
