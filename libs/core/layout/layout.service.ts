import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LAYOUT_CONSTANTS } from '../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private location = inject(Location);
  
  // Responsive state
  isMobile = signal(false);
  isPinned = signal(true);
  isHovered = signal(false);
  isMobileMenuOpen = signal(false);
  
  // UI overlay state
  activeDropdown = signal<'business' | 'notifications' | 'user' | null>(null);

  // Back button state for mobile/global header
  showBackButton = signal(false);
  backAction = signal<(() => void) | null>(null);
  headerTitle = signal<string | null>(null);

  // Contextual bottom bar
  customBottomAction = signal<{ label: string, icon: any, action: () => void } | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkMobile();
      window.addEventListener('resize', () => this.checkMobile());

      // Auto-detect back button necessity and page title
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        const segments = url.split('/').filter((s: string) => s.length > 0);
        
        // Show back button if we are deep in a module (e.g. /pedidos/nuevo)
        const shouldShow = segments.length > 1;
        this.showBackButton.set(shouldShow);

        // Set Title based on the main segment
        if (segments.length > 0) {
          const mainSegment = segments[0].toLowerCase();
          const titles: Record<string, string> = {
            'dashboard': 'DASHBOARD',
            'pedidos': 'PEDIDOS',
            'clientes': 'CLIENTES',
            'produccion': 'PRODUCCIÓN',
            'stock': 'INVENTARIO',
            'ajustes': 'AJUSTES',
            'equipo': 'EQUIPO'
          };
          this.headerTitle.set(titles[mainSegment] || mainSegment.toUpperCase());
        } else {
          this.headerTitle.set('PROD MANAGER');
        }
      });
    }
  }

  private checkMobile() {
    // Breakpoint defined as 1024px (standard for Mobile/Tablet in many UI libs)
    this.isMobile.set(window.innerWidth < 1024);
  }

  // Computed state for isCollapsed (only for desktop)
  isCollapsed = computed(() => {
    if (this.isMobile()) return true;
    return !this.isPinned() && !this.isHovered();
  });

  // Expose constants for templates
  readonly constants = LAYOUT_CONSTANTS;

  // Computed width for the sidebar
  sidebarWidth = computed(() => {
    if (this.isMobile()) return 0;
    return this.isCollapsed() ? LAYOUT_CONSTANTS.SIDEBAR_WIDTH_COLLAPSED : LAYOUT_CONSTANTS.SIDEBAR_WIDTH_EXPANDED;
  });

  // Computed offset for translation
  translateOffset = computed(() => 
    LAYOUT_CONSTANTS.SIDEBAR_WIDTH_EXPANDED - LAYOUT_CONSTANTS.SIDEBAR_WIDTH_COLLAPSED
  );

  private hoverTimeout: any;

  togglePinned() {
    this.isPinned.set(!this.isPinned());
  }

  setHovered(hovered: boolean) {
    if (this.isMobile()) return;

    if (hovered) {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
      this.isHovered.set(true);
    } else {
      // Small delay before collapsing to prevent flickering
      if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
      this.hoverTimeout = setTimeout(() => {
        this.isHovered.set(false);
        this.hoverTimeout = null;
      }, 150);
    }
  }

  onEscape() {
    this.activeDropdown.set(null);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
