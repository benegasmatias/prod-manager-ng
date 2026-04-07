import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '@core/session/session.service';
import { AuthService } from '@core/auth/auth.service';
import { LucideAngularModule, Building2, AlertCircle, Mail, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  private session = inject(SessionService);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly icons = { Building2, AlertCircle, Mail, Loader2 };

  negocios = computed(() => this.session.negocios());
  userEmail = computed(() => this.auth.session()?.user.email || 'Usuario');

  ngOnInit() {
    // Si ya tiene negocios, redirigir al selector o dashboard
    if (this.session.isInitialized() && this.negocios().length > 0) {
      this.router.navigate([this.negocios().length === 1 ? '/dashboard' : '/select-business']);
    }
  }

  async logout() {
    try {
      await this.auth.logout();
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('[Onboarding] Error during logout:', err);
    }
  }
}
