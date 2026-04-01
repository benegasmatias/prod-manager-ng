import { Component, inject, signal, computed, effect, ViewChild, ElementRef, model, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, User, ChevronDown, Settings, LogOut, X } from 'lucide-angular';
import { AuthService } from '../../../auth/auth.service';
import { LayoutService } from '../../layout.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './user-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {
  @ViewChild('profileDialog') profileDialog!: ElementRef<HTMLDialogElement>;
  
  private authService = inject(AuthService);
  private router = inject(Router);
  layoutService = inject(LayoutService);
  private elementRef = inject(ElementRef);
  
  user = this.authService.user;
  
  displayName = computed(() => {
    const u = this.user();
    if (!u) return 'Usuario';
    return u.user_metadata?.['full_name'] || u.email?.split('@')[0] || 'Usuario';
  });

  dropdownOpen = computed(() => this.layoutService.activeDropdown() === 'user');
  isDialogOpen = signal(false);
  profileName = model('');
  isSaving = signal(false);

  readonly icons = { User, ChevronDown, Settings, LogOut, X };

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target) && this.dropdownOpen()) {
      this.layoutService.activeDropdown.set(null);
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.layoutService.activeDropdown.set(this.dropdownOpen() ? null : 'user');
  }

  constructor() {
    effect(() => {
      const u = this.user();
      if (u) {
        this.profileName.set(u.user_metadata?.['full_name'] || '');
      }
    });
  }

  handleOpenProfile() {
    this.isDialogOpen.set(true);
    this.layoutService.activeDropdown.set(null);
    this.profileDialog.nativeElement.showModal();
  }

  async handleUpdateProfile() {
    if (!this.profileName()) return;
    
    this.isSaving.set(true);
    try {
      await this.authService.updateProfile({ full_name: this.profileName() });
      this.closeDialog();
    } catch (error) {
      console.error('Error updating profile', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  closeDialog() {
    this.profileDialog.nativeElement.close();
    this.isDialogOpen.set(false);
  }
}
