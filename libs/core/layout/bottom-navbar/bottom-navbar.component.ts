import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Home, ShoppingCart, Bell, Settings, Plus, Menu, Users, Package } from 'lucide-angular';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-bottom-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <nav class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-3xl border-t border-border/5 h-[75px] px-6 flex items-center justify-between z-[90] sm:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe transition-all duration-700"
      [class.translate-y-[200%]]="layout.bottomNavHidden()"
      [class.opacity-0]="layout.bottomNavHidden()">
      
      @if (layout.customBottomItems()) {
        <!-- CONTEXTUAL MULTIPLE ITEMS (Contextual Nav) -->
        <div class="flex items-center justify-around w-full">
          @for (item of layout.customBottomItems(); track item.label) {
            <button (click)="item.action()" class="flex flex-col items-center gap-1 transition-all duration-300">
               <div [class]="'p-1.5 rounded-xl transition-all ' + (item.isActive ? 'bg-primary/10' : '')">
                  <lucide-angular [img]="item.icon" [class]="'h-5 w-5 ' + (item.isActive ? 'text-primary' : 'text-text-muted/40')"></lucide-angular>
               </div>
               <span [class]="'text-[8px] font-black uppercase tracking-widest ' + (item.isActive ? 'text-primary' : 'text-text-muted/40')">{{ item.label }}</span>
            </button>
          }
        </div>
      } @else if (layout.customBottomAction()) {
        <!-- CONTEXTUAL SINGLE ACTION (Original FAB Replacement) -->
        <div class="flex items-center justify-center w-full px-4 animate-in slide-in-from-bottom duration-500">
          <button (click)="layout.customBottomAction()?.action()" 
            class="h-12 w-full max-w-sm rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <lucide-angular *ngIf="layout.customBottomAction()?.icon" [img]="layout.customBottomAction()?.icon" class="h-4 w-4"></lucide-angular>
            {{ layout.customBottomAction()?.label }}
          </button>
        </div>
      } @else {
        <!-- STANDARD NAV ITEMS -->
        <div class="flex items-center justify-around w-full animate-in fade-in duration-500">
          <!-- INICIO -->
          <a routerLink="/dashboard" routerLinkActive="text-primary" class="flex flex-col items-center gap-1 transition-all duration-300">
            <div class="p-1.5 rounded-xl transition-all" routerLinkActive="bg-primary/10">
              <lucide-angular [img]="icons.Home" class="h-5 w-5 text-text-muted/40" routerLinkActive="text-primary"></lucide-angular>
            </div>
            <span class="text-[8px] font-black uppercase tracking-widest text-text-muted/40" routerLinkActive="text-primary">Inicio</span>
          </a>

          <!-- PEDIDOS -->
          <a routerLink="/pedidos" routerLinkActive="text-primary" class="flex flex-col items-center gap-1 transition-all duration-300">
            <div class="p-1.5 rounded-xl transition-all" routerLinkActive="bg-primary/10">
              <lucide-angular [img]="icons.ShoppingCart" class="h-5 w-5 text-text-muted/40" routerLinkActive="text-primary"></lucide-angular>
            </div>
            <span class="text-[8px] font-black uppercase tracking-widest text-text-muted/40" routerLinkActive="text-primary">Pedidos</span>
          </a>

          <!-- SPACER FOR FAB -->
          <div class="w-16"></div>

          <!-- INVENTARIO (Stock) -->
          <a routerLink="/stock" routerLinkActive="text-primary" class="flex flex-col items-center gap-1 transition-all duration-300">
            <div class="p-1.5 rounded-xl transition-all" routerLinkActive="bg-primary/10">
              <lucide-angular [img]="icons.Package" class="h-5 w-5 text-text-muted/40" routerLinkActive="text-primary"></lucide-angular>
            </div>
            <span class="text-[8px] font-black uppercase tracking-widest text-text-muted/40" routerLinkActive="text-primary">Stock</span>
          </a>

          <!-- MENÚ -->
          <button (click)="layout.toggleMobileMenu()" class="flex flex-col items-center gap-1 transition-all duration-300">
            <div class="p-1.5 rounded-xl transition-all" [class.bg-primary/10]="layout.isMobileMenuOpen()">
              <lucide-angular [img]="icons.Menu" [class]="layout.isMobileMenuOpen() ? 'h-5 w-5 text-primary' : 'h-5 w-5 text-text-muted/40'"></lucide-angular>
            </div>
            <span class="text-[8px] font-black uppercase tracking-widest" [class.text-primary]="layout.isMobileMenuOpen()" [class.text-text-muted/40]="!layout.isMobileMenuOpen()">Menu</span>
          </button>
        </div>

        <!-- THE FAB (CENTER) -->
        <button (click)="layout.fabAction() ? layout.fabAction()?.action() : router.navigate(['/pedidos/nuevo'])" 
           class="absolute left-1/2 -top-7 -translate-x-1/2 h-16 w-16 rounded-3xl bg-primary text-white shadow-[0_15px_35px_-5px_rgba(var(--primary-rgb),0.4)] border-[5px] border-white flex items-center justify-center active:scale-95 transition-all group z-[110]">
          <lucide-angular [img]="layout.fabAction()?.icon || icons.Plus" class="h-6 w-6 transition-transform group-hover:rotate-90"></lucide-angular>
        </button>
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
  router = inject(Router);

  icons = { Home, ShoppingCart, Bell, Settings, Plus, Menu, Users, Package };

  isRouteActive(route: string): boolean {
    return window.location.pathname.startsWith(route);
  }
}
