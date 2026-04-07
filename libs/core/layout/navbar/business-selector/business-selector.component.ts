import { Component, inject, computed, ElementRef, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Building2, ChevronDown, CheckCircle2, X } from 'lucide-angular';
import { SessionService } from '../../../session/session.service';
import { LayoutService } from '../../layout.service';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-business-selector',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './business-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessSelectorComponent {
  sessionService = inject(SessionService);
  layoutService = inject(LayoutService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  dropdownOpen = computed(() => this.layoutService.activeDropdown() === 'business');
  protected readonly icons = { Building2, ChevronDown, CheckCircle2, X };

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target) && this.dropdownOpen()) {
      this.layoutService.activeDropdown.set(null);
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.layoutService.activeDropdown.set(this.dropdownOpen() ? null : 'business');
  }

  handleSelect(id: string) {
    this.sessionService.setActiveId(id);
    this.layoutService.activeDropdown.set(null);
    this.router.navigate(['/dashboard']);
  }

  async handleLogout() {
    this.layoutService.activeDropdown.set(null);
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
