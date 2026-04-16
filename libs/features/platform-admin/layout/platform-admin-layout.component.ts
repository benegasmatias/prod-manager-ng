import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '@core/auth';
import { ToastComponent } from '../../../shared/ui/feedback/toast.component';

@Component({
  selector: 'app-platform-admin-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    LucideAngularModule,
    ToastComponent
  ],
  templateUrl: './platform-admin-layout.component.html',
  styleUrl: './platform-admin-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformAdminLayoutComponent {
  private auth = inject(AuthService);
}
