import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Home, ShoppingCart, Bell, Settings, Plus, Menu } from 'lucide-angular';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-bottom-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <nav class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-3xl border-t border-border/5 h-[80px] px-6 flex items-center justify-between z-[100] sm:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
      
      <!-- NAV ITEMS -->
      <div class="flex items-center justify-around w-full">
        
        <!-- INICIO -->
        <a routerLink="/dashboard" routerLinkActive="text-primary" class="flex flex-col items-center gap-1 transition-all duration-300">
          <div class="p-2 rounded-2xl transition-all" [class.bg-primary/10]="isRouteActive('/dashboard')">
            <lucide-angular [img]="icons.Home" [class]="isRouteActive('/dashboard') ? 'h-6 w-6 text-primary' : 'h-6 w-6 text-text-muted/40'"></lucide-angular>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest" [class.text-primary]="isRouteActive('/dashboard')" [class.text-text-muted/40]="!isRouteActive('/dashboard')">Inicio</span>
        </a>

        <!-- PEDIDOS -->
        <a routerLink="/pedidos" routerLinkActive="text-primary" class="flex flex-col items-center gap-1 transition-all duration-300">
          <div class="p-2 rounded-2xl transition-all" [class.bg-primary/10]="isRouteActive('/pedidos')">
            <lucide-angular [img]="icons.ShoppingCart" [class]="isRouteActive('/pedidos') ? 'h-6 w-6 text-primary' : 'h-6 w-6 text-text-muted/40'"></lucide-angular>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest" [class.text-primary]="isRouteActive('/pedidos')" [class.text-text-muted/40]="!isRouteActive('/pedidos')">Pedidos</span>
        </a>

        <!-- SPACER FOR FAB -->
        <div class="w-16"></div>

        <!-- NOTIFICACIONES -->
        <button (click)="layout.activeDropdown.set('notifications')" class="flex flex-col items-center gap-1 transition-all duration-300 relative">
          <div class="p-2 rounded-2xl transition-all">
            <lucide-angular [img]="icons.Bell" class="h-6 w-6 text-text-muted/40"></lucide-angular>
            <div class="absolute top-2 right-2 h-2 w-2 bg-danger rounded-full border-2 border-white"></div>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest text-text-muted/40">Avisos</span>
        </button>

        <!-- MENÚ (HAMBURGUESA) -->
        <button (click)="layout.toggleMobileMenu()" class="flex flex-col items-center gap-1 transition-all duration-300">
          <div class="p-1.5 rounded-xl transition-all" [class.bg-primary/10]="layout.isMobileMenuOpen()">
            <lucide-angular [img]="icons.Menu" [class]="layout.isMobileMenuOpen() ? 'h-5 w-5 text-primary' : 'h-5 w-5 text-text-muted/40'"></lucide-angular>
          </div>
          <span class="text-[8px] font-black uppercase tracking-widest" [class.text-primary]="layout.isMobileMenuOpen()" [class.text-text-muted/40]="!layout.isMobileMenuOpen()">Menú</span>
        </button>

      </div>

      <!-- THE FAB (CENTER) -->
      <a routerLink="/pedidos/nuevo" 
         class="absolute left-1/2 -top-8 -translate-x-1/2 h-20 w-20 rounded-[2.5rem] bg-primary text-white shadow-[0_20px_50px_-5px_rgba(116,47,229,0.5)] border-[6px] border-background flex items-center justify-center active:scale-95 transition-all group">
        <lucide-angular [img]="icons.Plus" class="h-8 w-8 transition-transform group-hover:rotate-90"></lucide-angular>
      </a>

    </nav>
  `,
  styles: [`
    .pb-safe {
      padding-bottom: env(safe-area-inset-bottom);
    }
    :host {
      display: contents;
    }
  `]
})
export class BottomNavbarComponent {
  layout = inject(LayoutService);
  
  icons = { Home, ShoppingCart, Bell, Settings, Plus, Menu };

  isRouteActive(route: string): boolean {
    // Simple check, can be improved with Router state
    return window.location.pathname.startsWith(route);
  }
}
