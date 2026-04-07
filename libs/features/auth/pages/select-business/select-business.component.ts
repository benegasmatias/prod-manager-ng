import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '@core/session/session.service';
import { LucideAngularModule, Building2, ChevronRight, LogOut, Plus, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-angular';
import { AuthService } from '@core/auth/auth.service';
import { InvitationsService } from '@core/api/invitaciones.service';

@Component({
  selector: 'app-auth-select-business',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './select-business.component.html',
  styleUrls: ['./select-business.component.css']
})
export class SelectBusinessComponent implements OnInit {
  private session = inject(SessionService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private invitationsService = inject(InvitationsService);

  negocios = computed(() => this.session.negocios());
  invitations = signal<any[]>([]);
  loadingInit = signal(true);
  processingId = signal<string | null>(null);

  readonly icons = { Building2, ChevronRight, LogOut, Plus, Mail, CheckCircle, XCircle, Loader2 };

  async ngOnInit() {
    this.loadingInit.set(true);
    try {
      const invites = await this.invitationsService.getMyInvitations();
      this.invitations.set(invites);
    } catch (err) {
      console.error('Error loading invitations:', err);
    } finally {
      this.loadingInit.set(false);
    }
  }

  selectBusiness(id: string) {
    this.session.setActiveId(id);
    this.router.navigate(['/dashboard']);
  }

  async acceptInvitation(token: string, id: string) {
    this.processingId.set(id);
    try {
      await this.invitationsService.accept(token);
      // Reload session to get new membership
      window.location.reload(); 
    } catch (err) {
      console.error('Error accepting invitation:', err);
    } finally {
      this.processingId.set(null);
    }
  }

  async rejectInvitation(token: string, id: string) {
    this.processingId.set(id);
    try {
      await this.invitationsService.reject(token);
      this.invitations.set(this.invitations().filter(i => i.id !== id));
    } catch (err) {
      console.error('Error rejecting invitation:', err);
    } finally {
      this.processingId.set(null);
    }
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
