import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Menu, Sun, Moon } from 'lucide-angular';
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
  
  readonly icons = { Menu, Sun, Moon };

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
