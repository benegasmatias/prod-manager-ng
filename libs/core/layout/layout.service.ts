import { Injectable, signal, computed } from '@angular/core';
import { LAYOUT_CONSTANTS } from '../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  isPinned = signal(true);
  isHovered = signal(false);

  // Computed state for isCollapsed
  isCollapsed = computed(() => !this.isPinned() && !this.isHovered());

  // Expose constants for templates
  readonly constants = LAYOUT_CONSTANTS;

  // Computed width for the sidebar
  sidebarWidth = computed(() => 
    this.isCollapsed() ? LAYOUT_CONSTANTS.SIDEBAR_WIDTH_COLLAPSED : LAYOUT_CONSTANTS.SIDEBAR_WIDTH_EXPANDED
  );

  // Computed offset for translation
  translateOffset = computed(() => 
    LAYOUT_CONSTANTS.SIDEBAR_WIDTH_EXPANDED - LAYOUT_CONSTANTS.SIDEBAR_WIDTH_COLLAPSED
  );

  togglePinned() {
    this.isPinned.set(!this.isPinned());
  }

  setHovered(hovered: boolean) {
    this.isHovered.set(hovered);
  }
}
