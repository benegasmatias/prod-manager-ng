import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LAYOUT_CONSTANTS } from '../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private platformId = inject(PLATFORM_ID);
  
  // Responsive state
  isMobile = signal(false);
  isPinned = signal(true);
  isHovered = signal(false);
  isMobileMenuOpen = signal(false);
  
  // UI overlay state
  activeDropdown = signal<'business' | 'notifications' | 'user' | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkMobile();
      window.addEventListener('resize', () => this.checkMobile());
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
