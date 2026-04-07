import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '@core/session/session.service';
import { LucideAngularModule, Building2, ChevronRight, LogOut, Plus } from 'lucide-angular';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-business-selector',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './select-business.component.html',
  styleUrls: ['./select-business.component.css']
})
export class SelectBusinessComponent {
  private session = inject(SessionService);
  private router = inject(Router);
  private auth = inject(AuthService);

  negocios = computed(() => this.session.negocios());
  readonly icons = { Building2, ChevronRight, LogOut, Plus };

  selectBusiness(id: string) {
    this.session.setActiveId(id);
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.auth.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  createNew() {
    this.router.navigate(['/onboarding']);
  }
}
