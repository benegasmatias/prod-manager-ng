import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Menu, Sun, Moon, Search } from 'lucide-angular';
import { LayoutService } from '../layout.service';
import { ThemeService } from '../theme.service';
import { NotificationDropdownComponent } from './notifications/notification-dropdown.component';
import { BusinessSelectorComponent } from './business-selector/business-selector.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    NotificationDropdownComponent, 
    BusinessSelectorComponent, 
    UserProfileComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  layoutService = inject(LayoutService);
  themeService = inject(ThemeService);
  navbarVisible = signal(true);
  private lastScroll = 0;
  
  readonly icons = { Menu, Sun, Moon, Search };

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  constructor() {
    window.addEventListener('scroll', () => {
      if (!this.layoutService.isMobile()) {
        this.navbarVisible.set(true);
        return;
      }
      const currentScroll = window.pageYOffset;
      if (currentScroll <= 0) {
        this.navbarVisible.set(true);
        return;
      }
      if (currentScroll > this.lastScroll && currentScroll > 60) {
        this.navbarVisible.set(false);
      } else if (currentScroll < this.lastScroll) {
        this.navbarVisible.set(true);
      }
      this.lastScroll = currentScroll;
    }, { passive: true });
  }
}
