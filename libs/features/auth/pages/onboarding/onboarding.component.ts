import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '@core/session/session.service';
import { ApiService } from '@core/api/api.service';
import { Rubro, BusinessTemplate } from '@shared/models';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';
import { LucideAngularModule, Building2, Rocket, ArrowRight, AlertCircle, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonSpinnerComponent, LucideAngularModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  private session = inject(SessionService);
  private api = inject(ApiService);
  private router = inject(Router);

  // Form State
  nombre = '';
  selectedRubro = signal<Rubro | null>(null);
  
  // UI State
  templates = signal<BusinessTemplate[]>([]);
  isLoadingTemplates = signal(true);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  readonly icons = { Building2, Rocket, ArrowRight, AlertCircle, Loader2 };

  negocios = computed(() => this.session.negocios());

  ngOnInit() {
    // Si ya tiene negocios, redirigir al selector o dashboard
    if (this.session.isInitialized() && this.negocios().length > 0) {
      this.router.navigate([this.negocios().length === 1 ? '/dashboard' : '/select-business']);
      return;
    }
    this.loadTemplates();
  }

  async loadTemplates() {
    this.isLoadingTemplates.set(true);
    this.error.set(null);
    try {
      const data = await this.api.businesses.getTemplates();
      this.templates.set(data || []);
      
      // Auto-select first available if none selected
      if (data.length > 0) {
        this.selectedRubro.set(data[0].key);
      }
    } catch (err) {
      this.error.set('No se pudieron cargar los tipos de negocio. Por favor, intenta de nuevo.');
      console.error('[Onboarding] Error loading templates:', err);
    } finally {
      this.isLoadingTemplates.set(false);
    }
  }

  async onSubmit() {
    const rubro = this.selectedRubro();
    if (!this.nombre || !rubro) return;
    
    this.isSubmitting.set(true);
    try {
      const newNegocio = await this.session.addNegocio(this.nombre, rubro);
      // Activar el negocio para que deje de estar en DRAFT y permita ver el dashboard
      await this.api.businesses.activate(newNegocio.id);
      this.session.setActiveId(newNegocio.id);
      this.router.navigate(['/dashboard']);
    } catch (err) {
      console.error('[Onboarding] Error creating business:', err);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/select-business']);
  }
}
