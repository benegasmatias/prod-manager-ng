import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@core/api/api.service';
import { SessionService } from '@core/session/session.service';
import { LucideAngularModule, Mail, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-invitacion-aceptar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './invitacion-aceptar.component.html'
})
export class InvitacionAceptarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private session = inject(SessionService);

  token = '';
  invitation = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  processing = signal(false);
  success = signal(false);

  readonly icons = { Mail, CheckCircle, XCircle, Loader2, AlertCircle };

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.error.set('Token de invitación no proporcionado');
      this.loading.set(false);
      return;
    }
    this.loadInvitation();
  }

  async loadInvitation() {
    this.loading.set(true);
    try {
      this.invitation.set(await this.api.get(`/business-invitations/by-token/${this.token}`));
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al cargar la invitación');
    } finally {
      this.loading.set(false);
    }
  }

  async accept() {
    if (this.processing()) return;
    this.processing.set(true);
    try {
      await this.api.post(`/business-invitations/${this.token}/accept`, {});
      this.success.set(true);
      // Recargar sesión para obtener los nuevos negocios
      await this.session.initialize();
      // El dashboard se encargará de mostrar el nuevo negocio
      setTimeout(() => this.router.navigate(['/dashboard']), 2000);
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al aceptar la invitación');
    } finally {
      this.processing.set(false);
    }
  }

  async reject() {
    if (this.processing()) return;
    this.processing.set(true);
    try {
      await this.api.post(`/business-invitations/${this.token}/reject`, {});
      this.router.navigate(['/onboarding']);
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al rechazar la invitación');
    } finally {
      this.processing.set(false);
    }
  }
}
