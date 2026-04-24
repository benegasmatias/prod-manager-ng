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
    <nav class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-3xl border-t border-border/5 h-[75px] px-6 flex items-center justify-between z-[100] sm:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe transition-all duration-500">
      
      @if (!layout.customBottomAction()) {
        <!-- NAV ITEMS -->
        <div class="flex items-center justify-around w-full animate-in fade-in duration-500">
          <!-- INICIO -->
          <a routerLink="/dashboard" routerLinkActive="text-primary" class="flex flex-col items-center gap-1 transition-all duration-300">
            <div class="p-1.5 rounded-xl transition-all" [class.bg-primary/10]="isRouteActive('/dashboard')">
              <lucide-angular [img]="icons.Home" [class]="isRouteActive('/dashboard') ? 'h-5 w-5 text-primary' : 'h-5 w-5 text-text-muted/40'"></lucide-angular>
            </div>
            <span class="text-[8px] font-black uppercase tracking-widest" [class.text-primary]="isRouteActive('/dashboard')" [class.text-text-muted/40]="!isRouteActive('/dashboard')">Inicio</span>
          </a>

          <!-- PEDIDOS -->
          <a routerLink="/pedidos" routerLinkActive="text-primary" class="flex flex-col items-center gap-1 transition-all duration-300">
            <div class="p-1.5 rounded-xl transition-all" [class.bg-primary/10]="isRouteActive('/pedidos')">
              <lucide-angular [img]="icons.ShoppingCart" [class]="isRouteActive('/pedidos') ? 'h-5 w-5 text-primary' : 'h-5 w-5 text-text-muted/40'"></lucide-angular>
            </div>
            <span class="text-[8px] font-black uppercase tracking-widest" [class.text-primary]="isRouteActive('/pedidos')" [class.text-text-muted/40]="!isRouteActive('/pedidos')">Pedidos</span>
          </a>

          <!-- SPACER FOR FAB -->
          <div class="w-16"></div>

          <!-- NOTIFICACIONES -->
          <button (click)="layout.activeDropdown.set('notifications')" class="flex flex-col items-center gap-1 transition-all duration-300 relative">
            <div class="p-1.5 rounded-xl transition-all">
              <lucide-angular [img]="icons.Bell" class="h-5 w-5 text-text-muted/40"></lucide-angular>
              <div class="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-danger rounded-full border-2 border-white"></div>
            </div>
            <span class="text-[8px] font-black uppercase tracking-widest text-text-muted/40">Avisos</span>
          </button>

          <!-- MENÚ / AJUSTES (HAMBURGUESA) -->
          <button (click)="layout.toggleMobileMenu()" class="flex flex-col items-center gap-1 transition-all duration-300">
            <div class="p-1.5 rounded-xl transition-all" [class.bg-primary/10]="layout.isMobileMenuOpen()">
              <lucide-angular [img]="icons.Menu" [class]="layout.isMobileMenuOpen() ? 'h-5 w-5 text-primary' : 'h-5 w-5 text-text-muted/40'"></lucide-angular>
            </div>
            <span class="text-[8px] font-black uppercase tracking-widest" [class.text-primary]="layout.isMobileMenuOpen()" [class.text-text-muted/40]="!layout.isMobileMenuOpen()">Menú</span>
          </button>
        </div>

        <!-- THE FAB (CENTER) -->
        <a routerLink="/pedidos/nuevo" 
           class="absolute left-1/2 -top-7 -translate-x-1/2 h-16 w-16 rounded-3xl bg-primary text-white shadow-[0_15px_35px_-5px_rgba(116,47,229,0.4)] border-[5px] border-white flex items-center justify-center active:scale-95 transition-all group">
          <lucide-angular [img]="icons.Plus" class="h-6 w-6 transition-transform group-hover:rotate-90"></lucide-angular>
        </a>
      } @else {
        <!-- CONTEXTUAL ACTION(S) -->
        <div class="flex items-center justify-center w-full px-4 animate-in slide-in-from-bottom-5 duration-300">
          <button (click)="layout.customBottomAction()?.action()" 
            class="h-12 w-full max-w-sm rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary/20">
            <lucide-angular *ngIf="layout.customBottomAction()?.icon" [img]="layout.customBottomAction()?.icon" class="h-4 w-4"></lucide-angular>
            {{ layout.customBottomAction()?.label }}
          </button>
        </div>
      }
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
    return window.location.pathname.startsWith(route);
  }
}
