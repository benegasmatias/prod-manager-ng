import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '@core/session/session.service';
import { AuthService } from '@core/auth/auth.service';
import { ApiService } from '@core/api/api.service';
import { LucideAngularModule, Building2, AlertCircle, Mail, Loader2, ChevronRight, Zap, Target, Hammer, ShoppingCart, CheckCircle2 } from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonSpinnerComponent],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  private session = inject(SessionService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private api = inject(ApiService);

  readonly icons = { Building2, AlertCircle, Mail, Loader2, ChevronRight, Zap, Target, Hammer, ShoppingCart, CheckCircle2 };

  // UI State
  step = signal<'WELCOME' | 'CHOOSE_TEMPLATE' | 'CREATING'>('WELCOME');
  templates = signal<any[]>([]);
  loadingTemplates = signal(false);
  selectedTemplate = signal<any | null>(null);
  
  // Creation state
  businessName = signal('');
  isCreating = signal(false);

  userEmail = computed(() => this.auth.session()?.user.email || 'Usuario');
  negocios = computed(() => this.session.negocios());

  ngOnInit() {
    // Si ya tiene negocios, redirigir
    if (this.session.isInitialized() && this.negocios().length > 0) {
      this.router.navigate(['/dashboard']);
    }
  }

  async startOnboarding() {
    this.step.set('CHOOSE_TEMPLATE');
    await this.loadTemplates();
  }

  async loadTemplates() {
    this.loadingTemplates.set(true);
    try {
      const data = await this.api.businesses.getTemplates();
      this.templates.set(data);
    } catch (err) {
      console.error('[Onboarding] Error loading templates:', err);
    } finally {
      this.loadingTemplates.set(false);
    }
  }

  selectTemplate(template: any) {
    this.selectedTemplate.set(template);
    // Auto-set business name if empty
    if (!this.businessName()) {
      this.businessName.set(`${template.name} de ${this.userEmail().split('@')[0]}`);
    }
  }

  async createBusiness() {
    if (!this.selectedTemplate() || this.isCreating()) return;
    
    this.isCreating.set(true);
    try {
      await this.session.addNegocio(this.businessName(), this.selectedTemplate().key);
      this.step.set('CREATING');
      
      // Short delay for the "Success" animation before redirecting
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
    } catch (err) {
      console.error('[Onboarding] Error creating business:', err);
      this.isCreating.set(false);
    }
  }

  back() {
    if (this.step() === 'CHOOSE_TEMPLATE') {
      this.step.set('WELCOME');
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
